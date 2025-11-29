import { prisma } from "@/lib/prisma";
import { gameSessionSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";
import type { ApiResponse } from "@/types/api";
import type { GameSession } from "@/types/game";

/**
 * POST /api/admin/games
 * Creates a new game session
 * @requires Authentication
 */
export async function POST(request: NextRequest) {
    try {
        // Get authenticated user
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'Unauthorized. Please log in.'
            }, { status: 401 });
        }

        const body = await request.json();

        // Comprehensive validation using Zod schema
        const validatedFields = gameSessionSchema.safeParse(body);

        if (!validatedFields.success) {
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

        const { name, gameCode, gameMode, categoryIds, shuffledCardIds } = validatedFields.data;

        // Verify categories exist
        const existingCategories = await prisma.category.findMany({
            where: { id: { in: categoryIds } }
        });

        if (existingCategories.length !== categoryIds.length) {
            return NextResponse.json<ApiResponse>({
                success: false,
                error: 'One or more selected categories do not exist'
            }, { status: 400 });
        }

        // Create game session with multiple categories
        const newGame = await prisma.gameSession.create({
            data: {
                name,
                gameCode,
                gameMode,
                hostId: user.id,
                status: "WAITING",
                shuffledCardIds: shuffledCardIds || [],
                categories: {
                    create: categoryIds.map((categoryId) => ({
                        categoryId: categoryId
                    }))
                }
            },
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
        console.error("Failed to create game", error);

        // Handle Prisma errors
        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; meta?: { target?: string[] } };

            // Unique constraint violation (duplicate game code)
            if (prismaError.code === 'P2002') {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'This game code already exists. Please use a different code.'
                }, { status: 409 });
            }

            // Foreign key constraint violation
            if (prismaError.code === 'P2003') {
                return NextResponse.json<ApiResponse>({
                    success: false,
                    error: 'Invalid reference: One or more related records do not exist'
                }, { status: 400 });
            }
        }

        return NextResponse.json<ApiResponse>({
            success: false,
            error: 'Failed to create game session. Please try again.'
        }, { status: 500 });
    }
}
export async function GET() {
    try {
        const games = await prisma.gameSession.findMany({
            include: {
                host: true,
                categories: {
                    include: {
                        category: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            games
        }, { status: 200 });
    }
    catch (error) {
        console.error("Failed to fetch games", error);
        return NextResponse.json({
            error: 'Failed to fetch games'
        }, { status: 500 });
    }
}
