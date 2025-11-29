import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";

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

        // Fetch game session with basic info and card IDs to determine current card
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameSession = await (prisma as any).gameSession.findUnique({
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
                players: {
                    select: {
                        id: true,
                        nickname: true,
                        score: true,
                        team: true,
                        isLeader: true,
                        isConnected: true
                    }
                },
                categories: {
                    include: {
                        category: {
                            include: {
                                cards: {
                                    where: {
                                        status: 'OPEN',
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

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        // Prepare response based on game status
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const responseData: any = {
            status: gameSession.status,
            gameMode: gameSession.gameMode,
            currentCardIndex: gameSession.currentCardIndex,
            lastCardStartedAt: gameSession.lastCardStartedAt,
            players: gameSession.players,
        };

        // If game is in progress, fetch ONLY the current card
        if (gameSession.status === GameStatus.IN_PROGRESS) {
            let currentCardId: number | null = null;

            // Use shuffledCardIds to determine current card
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const session = gameSession as any;
            if (session.shuffledCardIds && session.shuffledCardIds.length > 0) {
                currentCardId = session.shuffledCardIds[gameSession.currentCardIndex % session.shuffledCardIds.length];
            } else {
                console.warn(`Game ${gameCode}: shuffledCardIds is empty, cannot determine current card`);
            }

            if (currentCardId) {
                // Fetch full details for the current card

                // Fetch full details for the current card
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const currentCard = await (prisma as any).card.findUnique({
                    where: { id: currentCardId },
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        timeLimit: true,
                        political: true,
                        economic: true,
                        infrastructure: true,
                        society: true,
                        environment: true,
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
                    // Return as a single-element array so frontend logic (index % length) works
                    // (index % 1) is always 0, so it picks this card
                    responseData.cards = [{
                        id: currentCard.id,
                        title: currentCard.title,
                        description: currentCard.description,
                        timeLimit: currentCard.timeLimit,
                        political: currentCard.political,
                        economic: currentCard.economic,
                        infrastructure: currentCard.infrastructure,
                        society: currentCard.society,
                        environment: currentCard.environment,
                        category: {
                            name: currentCard.category.name,
                            color: currentCard.category.color,
                            colorPreset: currentCard.category.colorPreset ? {
                                backgroundColor: currentCard.category.colorPreset.backgroundColor,
                                textColor: currentCard.category.colorPreset.textColor,
                                textBoxColor: currentCard.category.colorPreset.textBoxColor
                            } : undefined
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        responses: currentCard.cardResponses.map((r: any) => ({
                            id: r.id,
                            text: r.text,
                            score: r.score,
                            politicalEffect: r.politicalEffect,
                            economicEffect: r.economicEffect,
                            infrastructureEffect: r.infrastructureEffect,
                            societyEffect: r.societyEffect,
                            environmentEffect: r.environmentEffect
                        }))
                    }];
                } else {
                    responseData.cards = [];
                }
            } else {
                responseData.cards = [];
            }
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching game status:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game status' },
            { status: 500 }
        );
    }
}
