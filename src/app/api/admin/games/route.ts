import { prisma } from "@/lib/prisma";
import { gameCreateSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            name,
            gameCode,
            gameMode,
            hostId,
            categoryIds,
        } = body;

        // Validate required fields
        if (!name || !gameCode || !hostId || !categoryIds || categoryIds.length === 0 || !gameMode) {
            return NextResponse.json({
                message: 'Missing required fields',
                errors: {
                    name: !name ? 'Session name is required' : null,
                    gameCode: !gameCode ? 'Game code is required' : null,
                    hostId: !hostId ? 'Host ID is required' : null,
                    categoryIds: !categoryIds || categoryIds.length === 0 ? 'At least one category is required' : null,
                    gameMode: !gameMode ? 'Game mode is required' : null,
                }
            }, { status: 400 })
        }

        const validatedFields = gameCreateSchema.safeParse({
            gameCode
        })

        if (!validatedFields.success) {
            return NextResponse.json({
                message: 'Validation failed',
                errors: z.treeifyError(validatedFields.error)
            }, { status: 400 })
        }

        // Create game session with multiple categories
        const newGame = await prisma.gameSession.create({
            data: {
                name,
                gameCode,
                gameMode,
                hostId,
                status: "WAITING", // Changed from IN_PROGRESS to WAITING
                categories: {
                    create: categoryIds.map((categoryId: number) => ({
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
        })

        return NextResponse.json({
            success: true,
            message: 'Game Session created successfully',
            data: newGame
        }, { status: 201 })

    }
    catch (error) {
        console.error("Failed to create game", error)

        // Handle unique constraint violation for game code
        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'This game code already exists. Please use a different code.'
            }, { status: 409 })
        }

        return NextResponse.json({
            error: 'Failed to create game session'
        }, { status: 500 })
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
