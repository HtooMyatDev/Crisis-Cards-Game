import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json(
                { error: 'Game ID is required' },
                { status: 400 }
            );
        }

        // Find the game session
        const gameSession = await prisma.gameSession.findUnique({
            where: {
                id
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
                                respondedAt: 'desc'
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

        // Get all cards from all categories
        const allCards = gameSession.categories.flatMap(gc => gc.category.cards);

        // Get current card
        const currentCard = allCards[gameSession.currentCardIndex];

        if (!currentCard) {
            return NextResponse.json(
                { error: 'No current card found' },
                { status: 404 }
            );
        }

        // Process player data
        const playersWithResponses = gameSession.players.map(player => {
            const latestResponse = player.responses[0];
            const hasResponded = latestResponse?.cardId === currentCard.id;

            return {
                id: player.id,
                nickname: player.nickname,
                team: player.team,
                score: player.score,
                isConnected: player.isConnected,
                hasResponded,
                responseId: hasResponded ? latestResponse.responseId : null
            };
        });

        // Calculate team statistics
        const redTeam = playersWithResponses.filter(p => p.team === 'RED');
        const blueTeam = playersWithResponses.filter(p => p.team === 'BLUE');

        const teamStats = {
            RED: {
                playerCount: redTeam.length,
                avgScore: redTeam.length > 0
                    ? Math.round(redTeam.reduce((sum, p) => sum + p.score, 0) / redTeam.length)
                    : 0,
                responseRate: redTeam.length > 0
                    ? Math.round((redTeam.filter(p => p.hasResponded).length / redTeam.length) * 100)
                    : 0
            },
            BLUE: {
                playerCount: blueTeam.length,
                avgScore: blueTeam.length > 0
                    ? Math.round(blueTeam.reduce((sum, p) => sum + p.score, 0) / blueTeam.length)
                    : 0,
                responseRate: blueTeam.length > 0
                    ? Math.round((blueTeam.filter(p => p.hasResponded).length / blueTeam.length) * 100)
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
                responses: currentCard.cardResponses.map(r => ({
                    id: r.id,
                    text: r.text,
                    politicalEffect: r.politicalEffect,
                    economicEffect: r.economicEffect,
                    infrastructureEffect: r.infrastructureEffect,
                    societyEffect: r.societyEffect,
                    environmentEffect: r.environmentEffect,
                    score: r.score
                }))
            },
            players: playersWithResponses,
            teamStats,
            totalPlayers: playersWithResponses.length,
            respondedCount: playersWithResponses.filter(p => p.hasResponded).length
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
