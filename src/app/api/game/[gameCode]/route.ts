import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;

        if (!gameCode) {
            return NextResponse.json(
                { error: 'Game code is required' },
                { status: 400 }
            );
        }

        const { getOrSetCache } = await import('@/lib/redis');

        // Cache this heavy player view for 2 seconds (absorbs high concurrency)
        const responseData = await getOrSetCache(`game_player_view:${gameCode}`, async () => {
            // Fetch game session with basic info and card IDs to determine current card
            const gameSession = await prisma.gameSession.findUnique({
                where: {
                    gameCode: gameCode.toUpperCase()
                },
                select: {
                    id: true,
                    gameCode: true,
                    status: true,
                    gameMode: true,
                    currentCardIndex: true,
                    lastCardStartedAt: true,
                    shuffledCardIds: true,
                    roundStatus: true,
                    lastTurnResult: true,
                    players: {
                        select: {
                            id: true,
                            nickname: true,
                            score: true,
                            teamId: true,
                            team: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                    budget: true
                                }
                            },
                            isLeader: true,
                            isConnected: true
                        }
                    },
                    teams: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                            budget: true,
                            order: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    cards: {
                                        where: {
                                            status: 'Active',
                                            isArchived: false
                                        },
                                        select: {
                                            id: true
                                        },
                                        orderBy: {
                                            id: 'asc'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!gameSession) return null;

            // Prepare response based on game status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
                status: gameSession.status,
                gameMode: gameSession.gameMode,
                currentCardIndex: gameSession.currentCardIndex,
                lastCardStartedAt: gameSession.lastCardStartedAt,
                players: gameSession.players,
                teams: gameSession.teams,
                roundStatus: gameSession.roundStatus,
                lastTurnResult: gameSession.lastTurnResult,
            };

            // If game is in progress, fetch ONLY the current card
            if (gameSession.status === GameStatus.IN_PROGRESS) {
                let currentCardId: number | null = null;

                // Use shuffledCardIds to determine current card
                if (gameSession.shuffledCardIds && gameSession.shuffledCardIds.length > 0) {
                    currentCardId = gameSession.shuffledCardIds[gameSession.currentCardIndex % gameSession.shuffledCardIds.length];
                } else {
                    console.warn(`Game ${gameCode}: shuffledCardIds is empty, cannot determine current card`);
                }

                if (currentCardId) {
                    // Fetch full details for the current card
                    const currentCard = await prisma.card.findUnique({
                        where: { id: currentCardId },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            timeLimit: true,
                            category: {
                                select: {
                                    name: true,
                                    color: true,
                                    colorPreset: {
                                        select: {
                                            backgroundColor: true,
                                            textColor: true,
                                            textBoxColor: true
                                        }
                                    }
                                }
                            },
                            cardResponses: {
                                select: {
                                    id: true,
                                    text: true,
                                    score: true,
                                    cost: true,
                                    politicalEffect: true,
                                    economicEffect: true,
                                    infrastructureEffect: true,
                                    societyEffect: true,
                                    environmentEffect: true
                                },
                                orderBy: {
                                    order: 'asc'
                                }
                            }
                        }
                    });

                    if (currentCard) {
                        data.cards = [{
                            id: currentCard.id,
                            title: currentCard.title,
                            description: currentCard.description,
                            timeLimit: currentCard.timeLimit,
                            // Defaults for legacy frontend support if needed or remove if frontend is updated
                            political: 0,
                            economic: 0,
                            infrastructure: 0,
                            society: 0,
                            environment: 0,
                            category: {
                                name: currentCard.category.name,
                                color: currentCard.category.color,
                                colorPreset: currentCard.category.colorPreset ? {
                                    backgroundColor: currentCard.category.colorPreset.backgroundColor,
                                    textColor: currentCard.category.colorPreset.textColor,
                                    textBoxColor: currentCard.category.colorPreset.textBoxColor
                                } : undefined
                            },
                            responses: currentCard.cardResponses.map((r) => ({
                                id: r.id,
                                text: r.text,
                                score: r.score,
                                cost: r.cost,
                                politicalEffect: r.politicalEffect,
                                economicEffect: r.economicEffect,
                                infrastructureEffect: r.infrastructureEffect,
                                societyEffect: r.societyEffect,
                                environmentEffect: r.environmentEffect
                            }))
                        }];
                    } else {
                        data.cards = [];
                    }
                } else {
                    data.cards = [];
                }
            }
            return data;
        }, 2); // 2 second cache

        if (!responseData) {
             return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching game status:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch game status',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}
