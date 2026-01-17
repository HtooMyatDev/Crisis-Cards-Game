import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { Prisma } from '@prisma/client';

/**
 * POST /api/admin/cards
 * Creates a new crisis card with response options
 *
 * @requires Authentication - Admin only
 * @body {string} title - Card title
 * @body {string} description - Card description
 * @body {number} timeLimit - Time limit in seconds
 * @body {string} status - Card status (DRAFT, PUBLISHED, ARCHIVED)
 * @body {number} categoryId - Associated category ID
 * @body {Object[]} responseOptions - Array of response options
 * @body {number} political - Base political impact
 * @body {number} economic - Base economic impact
 * @body {number} infrastructure - Base infrastructure impact
 * @body {number} society - Base society impact
 * @body {number} environment - Base environment impact
 *
 * @returns {200} Created card
 * @returns {400} Validation error
 * @returns {401} Unauthorized
 * @returns {409} Conflict (duplicate title)
 * @returns {500} Server error
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            timeLimit,
            status,
            responseOptions,
            categoryId,
        } = body;

        // Validate required fields
        if (!title || !description || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, or categoryId' },
                { status: 400 }
            );
        }



        // Validate response options
        if (!responseOptions || !Array.isArray(responseOptions) || responseOptions.length === 0) {
            return NextResponse.json(
                { error: 'At least one response option is required' },
                { status: 400 }
            );
        }

        // Validate response option structure
        for (let i = 0; i < responseOptions.length; i++) {
            const option = responseOptions[i];
            if (!option.text || typeof option.text !== 'string' || option.text.trim() === '') {
                return NextResponse.json(
                    { error: `Response option ${i + 1} must have valid text` },
                    { status: 400 }
                );
            }

            const effects = ['politicalEffect', 'economicEffect', 'infrastructureEffect', 'societyEffect', 'environmentEffect'];
            for (const effect of effects) {
                // Check if effect values exist and are numbers
                if (option[effect] === undefined || typeof option[effect] !== 'number') {
                    return NextResponse.json(
                        { error: `Response option ${i + 1} must have valid ${effect} value` },
                        { status: 400 }
                    );
                }

                // Enforce -5 to +5 range for effect values
                if (option[effect] < -5 || option[effect] > 5) {
                    return NextResponse.json(
                        { error: `Response option ${i + 1}: ${effect} must be between -5 and +5 (got ${option[effect]})` },
                        { status: 400 }
                    );
                }
            }
        }

        // Use Prisma transaction to ensure data consistency
        const result = await prisma.$transaction(async (tx) => {
            // Create the card with base values
            const newCard = await tx.card.create({
                data: {
                    title,
                    description,
                    timeLimit,
                    status,
                    categoryId,
                    createdBy: user.id,
                },
            });

            // Create the response options separately
            const cardResponses = await Promise.all(
                responseOptions.map((option: {
                    text: string;
                    politicalEffect: number;
                    economicEffect: number;
                    infrastructureEffect: number;
                    societyEffect: number;
                    environmentEffect: number;
                    score?: number;
                    cost?: number;
                    impactDescription?: string;
                }, index: number) =>
                    tx.cardResponse.create({
                        data: {
                            cardId: newCard.id,
                            text: option.text.trim(),
                            order: index + 1, // Maintain the order of responses
                            politicalEffect: option.politicalEffect,
                            economicEffect: option.economicEffect,
                            infrastructureEffect: option.infrastructureEffect,
                            societyEffect: option.societyEffect,
                            environmentEffect: option.environmentEffect,
                            score: option.score ?? 0,
                            cost: option.cost ?? 0, // Include cost field
                            impactDescription: option.impactDescription || null,
                        }
                    })
                )
            );

            return { card: newCard, responses: cardResponses };
        });

        return NextResponse.json({
            success: true,
            id: result.card.id,
            card: result.card,
            responses: result.responses,
            message: `Card created successfully with ${result.responses.length} response options`
        });

    } catch (error: unknown) {
        console.error('Error creating card:', error);

        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string };
            if (prismaError.code === 'P2002') {
                return NextResponse.json(
                    { error: 'A card with this title already exists' },
                    { status: 409 }
                );
            }

            if (prismaError.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Invalid category ID or creator ID' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to create card' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/cards
 * Retrieves a list of cards with pagination and filtering
 *
 * @requires Authentication - User must be logged in
 * @query {number} page - Page number (default: 1)
 * @query {number} limit - Items per page (default: 10)
 * @query {string} search - Search term for title/description
 * @query {string} status - Filter by status
 * @query {string} category - Filter by category name
 * @query {boolean} isArchived - Filter archived status
 *
 * @returns {200} List of cards with pagination metadata
 * @returns {401} Unauthorized
 * @returns {500} Server error
 */
export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const isArchivedParam = searchParams.get('isArchived');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');
        const category = searchParams.get('category');

        const skip = (page - 1) * limit;

        const whereClause: Prisma.CardWhereInput = {
            isArchived: isArchivedParam === 'true',
        };

        if (search) {
            whereClause.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (status && status !== 'All') {
            whereClause.status = status;
        }

        if (category && category !== 'All') {
            whereClause.category = {
                name: category
            };
        }

        // Execute query and count in parallel
        const [cards, total] = await Promise.all([
            prisma.card.findMany({
                where: whereClause,
                include: {
                    category: true,
                    cardResponses: {
                        orderBy: { order: 'asc' }
                    }
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.card.count({ where: whereClause })
        ]);

        return NextResponse.json({
            success: true,
            cards,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error: unknown) {
        console.error('Error fetching cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
        );
    }
}
