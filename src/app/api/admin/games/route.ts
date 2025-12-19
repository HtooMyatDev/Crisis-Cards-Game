import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { gameSessionSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import type { ApiResponse } from "@/types/api";
import type { GameSession } from "@/types/game";

/**
 * POST /api/admin/games
 * Creates a new game session with dynamic team support
 *
 * @requires Authentication - User must be logged in
 * @requires Admin Role - Only admins can create games
 *
 * @body {Object} Game session data
 * @body {string} name - Game session name
 * @body {string} gameCode - Unique game code for players to join
 * @body {string} gameMode - Game mode (Standard, Quick Play, etc.)
 * @body {number[]} categoryIds - Array of category IDs to include
 * @body {number[]} shuffledCardIds - Pre-shuffled card IDs (optional)
 *
 * @returns {201} Game session created successfully
 * @returns {400} Validation error or invalid categories
 * @returns {401} Unauthorized - user not logged in
 * @returns {409} Conflict - game code already exists
 * @returns {500} Server error
 */
export async function POST(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unauthorized. Please log in.'
            }, { status: 401 });
        }

        // Parse and validate request body
        const body = await request.json();

        // Comprehensive validation using Zod schema
        const validatedFields = gameSessionSchema.safeParse(body);

        if (!validatedFields.success) {
            // Transform Zod errors into user-friendly field errors
            const fieldErrors: Record<string, string> = {};
            validatedFields.error.issues.forEach((err) => {
                if (err.path[0]) {
                    fieldErrors[err.path[0].toString()] = err.message;
                }
            });

            return NextResponse.json<ApiResponse>({
                success: false,
                message: 'Validation failed',
                errors: fieldErrors
            }, { status: 400 });
        }

        const {
            name,
            gameCode,
            gameMode,
            categoryIds,
            shuffledCardIds
        } = validatedFields.data;

        // Verify all selected categories exist in database
        const existingCategories = await prisma.category.findMany({
            where: { id: { in: categoryIds } }
        });

        if (existingCategories.length !== categoryIds.length) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'One or more selected categories do not exist'
            }, { status: 400 });
        }



        // Create game session with all related data in a single transaction
        const newGame = await prisma.gameSession.create({
            data: {
                name,
                gameCode,
                gameMode,
                hostId: user.id,
                status: "WAITING", // Initial status
                shuffledCardIds: shuffledCardIds || [],
                // Create category associations
                categories: {
                    create: categoryIds.map((categoryId) => ({
                        categoryId: categoryId
                    }))
                }
            },
            // Include related data in response
            include: {
                categories: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                color: true
                            }
                        }
                    }
                },
                teams: true,
                host: {
                    select: {
                        id: true,
                        name: true
                    }
                }
            }
        });

        return NextResponse.json<ApiResponse<GameSession>>({
            success: true,
            message: 'Game Session created successfully',
            data: newGame as unknown as GameSession
        }, { status: 201 });

    } catch (error: unknown) {
        // Log error for debugging (remove in production or use proper logging service)
        console.error("Failed to create game:", error);

        // Handle specific Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; meta?: { target?: string[] } };

            // P2002: Unique constraint violation (duplicate game code)
            if (prismaError.code === 'P2002') {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'This game code already exists. Please use a different code.'
                }, { status: 409 });
            }

            // P2003: Foreign key constraint violation
            if (prismaError.code === 'P2003') {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Invalid reference: One or more related records do not exist'
                }, { status: 400 });
            }
        }

        // Generic error response
        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to create game session. Please try again.'
        }, { status: 500 });
    }
}

/**
 * GET /api/admin/games
 * Retrieves all game sessions with related data
 *
 * @requires Authentication - User must be logged in
 *
 * @returns {200} Array of game sessions with teams, players, categories
 * @returns {401} Unauthorized - user not logged in
 * @returns {500} Server error
 *
 * @performance Includes all related data in single query to avoid N+1 problems
 * @scalability Consider adding pagination for large datasets
 */
export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unauthorized. Please log in.'
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '50'); // Default to 50 to avoid overfetching
        const search = searchParams.get('search') || '';
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: Prisma.GameSessionWhereInput = {};

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { gameCode: { contains: search, mode: 'insensitive' } },
                { host: { name: { contains: search, mode: 'insensitive' } } }
            ];
        }

        if (status && status !== 'All') {
            // @ts-expect-error - Prisma enum filter type mismatch
            whereClause.status = status;
        }

        // Execute query and count in parallel
        const [games, total] = await Promise.all([
            prisma.gameSession.findMany({
                where: whereClause,
                include: {
                    host: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    categories: {
                        include: {
                            category: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                    description: true
                                }
                            }
                        }
                    },
                    teams: {
                        include: {
                            players: {
                                select: {
                                    id: true,
                                    nickname: true,
                                    score: true,
                                    isConnected: true,
                                    isLeader: true
                                }
                            }
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    },
                    players: {
                        select: {
                            id: true,
                            nickname: true,
                            teamId: true,
                            score: true,
                            isConnected: true,
                            joinedAt: true,
                            isLeader: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                skip,
                take: limit
            }),
            prisma.gameSession.count({ where: whereClause })
        ]);

        return NextResponse.json({
            success: true,
            games,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to fetch games:", error);

        return NextResponse.json({
            success: false,
            error: 'Failed to fetch games. Please try again.'
        }, { status: 500 });
    }
}
