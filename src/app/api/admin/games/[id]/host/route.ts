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

        // Try to get from cache (Short TTL to debounce polling)
        const { getOrSetCache } = await import('@/lib/redis');

        const responseData = await getOrSetCache(`host_view:${id}`, async () => {
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

            if (!gameSession) return null;

            // Get all cards from all categories (Active/Non-Archived only from the include above)
            const allCards = gameSession.categories.flatMap(gc => gc.category.cards);

            // Calculate total based on shuffle (the actual game deck)
            const shuffledIds = Array.isArray(gameSession.shuffledCardIds) ? gameSession.shuffledCardIds as number[] : [];
            const totalCards = shuffledIds.length > 0 ? shuffledIds.length : allCards.length;

            // Get current card
            let currentCard = null;

            if (shuffledIds.length > 0) {
                // Logic: Trust the shuffle order
                const currentCardId = shuffledIds[gameSession.currentCardIndex];

                // Try to find in the pre-fetched active cards
                currentCard = allCards.find(c => c.id === currentCardId);

                // If not found (maybe archived or status changed mid-game), fetch it directly
                if (!currentCard && currentCardId) {
                    currentCard = await prisma.card.findUnique({
                        where: { id: currentCardId },
                        include: {
                            cardResponses: {
                                orderBy: { order: 'asc' }
                            }
                        }
                    });
                }
            }

            // Fallback for games without shuffle or if specific card fetch failed
            if (!currentCard) {
                 currentCard = allCards[gameSession.currentCardIndex % allCards.length];
            }

            if (!currentCard) return null;

            // Process player data
            const playersWithResponses = gameSession.players.map(player => {
                const latestResponse = player.responses[0];
                const hasResponded = latestResponse?.cardId === currentCard!.id; // Use non-null assertion as checked above

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

            return {
                game: {
                    id: gameSession.id,
                    gameCode: gameSession.gameCode,
                    status: gameSession.status,
                    currentCardIndex: gameSession.currentCardIndex,
                    lastCardStartedAt: gameSession.lastCardStartedAt,
                    totalCards: totalCards,
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
                        score: r.score,
                        cost: r.cost
                    }))
                },
                players: playersWithResponses,
                teams: gameSession.teams,
                teamStats,
                totalPlayers: playersWithResponses.length,
                respondedCount: playersWithResponses.filter(p => p.hasResponded).length
            };
        }, 2); // 2 seconds TTL

        if (!responseData) {
             return NextResponse.json(
                { error: 'Game not found or invalid state' },
                { status: 404 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching host data:', error);
        return NextResponse.json(
            { error: 'Failed to fetch host data' },
            { status: 500 }
        );
    }
}
