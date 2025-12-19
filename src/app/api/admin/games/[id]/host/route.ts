import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameSession, GameSessionCategory, Category, Card, CardResponse, Player, PlayerResponse } from "@prisma/client";

// Manual Team definition since Prisma Client is not exporting it
interface Team {
    id: string;
    gameSessionId: string;
    name: string;
    budget: number;
    baseValue: number;
    color: string;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}

// Define manual type to bypass Prisma inference issues
interface GameSessionHostData extends GameSession {
    categories: (GameSessionCategory & {
        category: Category & {
            cards: (Card & {
                cardResponses: CardResponse[]
            })[]
        }
    })[];
    players: (Player & {
        teamId: string | null;
        responses: PlayerResponse[];
        team: Team | null;
    })[];
    teams: Team[];
}

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

        // Find the game session with type casting to bypass inference issues
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
                                        status: 'Active',
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
                        },
                        team: true
                    }
                },
                teams: {
                    orderBy: {
                        order: 'asc'
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
                team: player.team?.name || null,
                teamId: player.teamId,
                score: player.score,
                isConnected: player.isConnected,
                hasResponded,
                responseId: hasResponded ? latestResponse.responseId : null
            };
        });

        // Calculate dynamic team statistics
        const teamStats: Record<string, { playerCount: number; avgScore: number; responseRate: number }> = {};

        // Initialize stats for all teams in the session
        gameSession.teams.forEach(team => {
            const teamPlayers = playersWithResponses.filter(p => p.teamId === team.id);

            teamStats[team.name] = {
                playerCount: teamPlayers.length,
                avgScore: teamPlayers.length > 0
                    ? Math.round(teamPlayers.reduce((sum, p) => sum + p.score, 0) / teamPlayers.length)
                    : 0,
                responseRate: teamPlayers.length > 0
                    ? Math.round((teamPlayers.filter(p => p.hasResponded).length / teamPlayers.length) * 100)
                    : 0
            };
        });

        // Prepare response data
        const responseData = {
            game: {
                id: gameSession.id,
                gameCode: gameSession.gameCode,
                status: gameSession.status,
                currentCardIndex: gameSession.currentCardIndex,
                lastCardStartedAt: gameSession.lastCardStartedAt,
                totalCards: allCards.length,
                teams: gameSession.teams
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
            teams: gameSession.teams,
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
