
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import path as needed
import { getCurrentUser } from '@/app/actions/auth';
import { Prisma } from '@prisma/client';

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const {
            title,
            description,
            timeLimit,
            status,
            responseOptions, // This now contains objects with text and effects
            categoryId,
            // New card base values
            political,
            economic,
            infrastructure,
            society,
            environment
        } = body;

        // Validate required fields
        if (!title || !description || !categoryId) {
            return NextResponse.json(
                { error: 'Missing required fields: title, description, or categoryId' },
                { status: 400 }
            );
        }

        // Validate card base values
        if (political === undefined || economic === undefined || infrastructure === undefined || society === undefined || environment === undefined) {
            return NextResponse.json(
                { error: 'Missing required card base values: political, economic, infrastructure, society, environment' },
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

            // Check if effect values exist and are numbers
            const effects = ['politicalEffect', 'economicEffect', 'infrastructureEffect', 'societyEffect', 'environmentEffect'];
            for (const effect of effects) {
                if (option[effect] === undefined || typeof option[effect] !== 'number') {
                    return NextResponse.json(
                        { error: `Response option ${i + 1} must have valid ${effect} value` },
                        { status: 400 }
                    );
                }
            }

            // Validate score field
            if (option.score !== undefined && typeof option.score !== 'number') {
                return NextResponse.json(
                    { error: `Response option ${i + 1} must have valid score value (number)` },
                    { status: 400 }
                );
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
                    // Add the new card base values
                    political,
                    economic,
                    infrastructure,
                    society,
                    environment,
                    // Remove responseOptions from here since we're handling them separately
                },
            });

            // Create the response options separately
            const cardResponses = await Promise.all(
                responseOptions.map((option, index) =>
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
                            score: option.score ?? 0, // Default to 0 if not provided
                        }
                    })
                )
            );

            return { card: newCard, responses: cardResponses };
        });

        // Return the created card with its responses
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
            if (error.code === 'P2002') {
                return NextResponse.json(
                    { error: 'A card with this title already exists' },
                    { status: 409 }
                );
            }

            if (error.code === 'P2003') {
                return NextResponse.json(
                    { error: 'Invalid category ID or creator ID' },
                    { status: 400 }
                );
            }
        }

        return NextResponse.json(
            {
                error: 'Failed to create card',
                details: process.env.NODE_ENV === 'development' && error && typeof error === 'object' && 'message' in error ? String(error.message) : undefined
            },
            { status: 500 }
        );
    }
}
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
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

        const [cards, total] = await Promise.all([
            prisma.card.findMany({
                where: whereClause,
                include: {
                    category: true,
                    cardResponses: true
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
        })
    }
    catch (error: unknown) {
        console.error('Error fetching cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
        )
    }

}
