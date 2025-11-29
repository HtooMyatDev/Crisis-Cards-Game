import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/utils/auth";

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

        // Verify user is authenticated
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        // Find the game session
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const gameSession = await (prisma as any).gameSession.findUnique({
            where: {
                gameCode: gameCode.toUpperCase()
            },
            include: {
                categories: {
                    include: {
                        category: {
                            include: {
                                cards: {
                                    where: {
                                        status: 'OPEN',
                                        isArchived: false
                                    },
                                    include: {
                                        cardResponses: {
                                            orderBy: {
                                                order: 'asc'
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                players: {
                    include: {
                        responses: {
                            orderBy: {
                                createdAt: 'desc'
                            },
                            take: 1
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

        // Verify user is the host
        if (gameSession.hostId !== parseInt(user.userId)) {
            return NextResponse.json(
                { error: 'Forbidden - Only the host can access this view' },
                { status: 403 }
            );
        }

        // Get all cards from all categories
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const allCards = gameSession.categories.flatMap((gc: any) => gc.category.cards);

        // Get current card
        const currentCard = allCards[gameSession.currentCardIndex];

        if (!currentCard) {
            return NextResponse.json(
                { error: 'No current card found' },
                { status: 404 }
            );
        }

        // Process player data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const playersWithResponses = gameSession.players.map((player: any) => {
            const latestResponse = player.responses[0];
            const hasResponded = latestResponse?.cardId === currentCard.id;

            return {
                team: player.team,
                score: player.score,
                isConnected: player.isConnected,
                hasResponded,
                responseId: hasResponded ? latestResponse.responseId : null
            };
        });

        // Calculate team statistics
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const redTeam = playersWithResponses.filter((p: any) => p.team === 'RED');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const blueTeam = playersWithResponses.filter((p: any) => p.team === 'BLUE');

        const teamStats = {
            RED: {
                playerCount: redTeam.length,
                avgScore: redTeam.length > 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? Math.round(redTeam.reduce((sum: number, p: any) => sum + p.score, 0) / redTeam.length)
                    : 0,
                responseRate: redTeam.length > 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? Math.round((redTeam.filter((p: any) => p.hasResponded).length / redTeam.length) * 100)
                    : 0
            },
            BLUE: {
                playerCount: blueTeam.length,
                avgScore: blueTeam.length > 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? Math.round(blueTeam.reduce((sum: number, p: any) => sum + p.score, 0) / blueTeam.length)
                    : 0,
                responseRate: blueTeam.length > 0
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    ? Math.round((blueTeam.filter((p: any) => p.hasResponded).length / blueTeam.length) * 100)
                    : 0
            }
        };

        // Prepare response data
        const responseData = {
            game: {
                id: gameSession.id,
                gameCode: gameSession.gameCode,
                status: gameSession.status,
                currentCardIndex: gameSession.currentCardIndex,
                lastCardStartedAt: gameSession.lastCardStartedAt,
                totalCards: allCards.length
            },
            currentCard: {
                id: currentCard.id,
                title: currentCard.title,
                description: currentCard.description,
                timeLimit: currentCard.timeLimit,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                responses: currentCard.cardResponses.map((r: any) => ({
                    id: r.id,
                    text: r.text,
                    politicalEffect: r.politicalEffect,
                    economicEffect: r.economicEffect,
                    infrastructureEffect: r.infrastructureEffect,
                    societyEffect: r.societyEffect,
                    environmentEffect: r.environmentEffect,
                    createdAt: r.createdAt
                }))
            },
            players: playersWithResponses,
            teamStats,
            totalPlayers: playersWithResponses.length,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            respondedCount: playersWithResponses.filter((p: any) => p.hasResponded).length
        };

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching host data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch host data' },
            { status: 500 }
        );
    }
}
