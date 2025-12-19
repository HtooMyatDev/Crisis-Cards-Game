import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

/**
 * POST /api/game/[gameCode]/start-round
 * Starts a new round - increments round counter and resets voting
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        // Get game session
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode },
            include: {
                categories: {
                    include: {
                        category: {
                            include: {
                                cards: {
                                    where: {
                                        status: 'OPEN',
                                        isArchived: false
                                    }
                                }
                            }
                        }
                    }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json({
                success: false,
                error: 'Game not found'
            }, { status: 404 });
        }

        // Collect all cards from selected categories
        const allCards = gameSession.categories.flatMap(gc => gc.category.cards);

        if (allCards.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No cards available for this game'
            }, { status: 400 });
        }

        // Shuffle and select cards for this round
        const shuffled = [...allCards].sort(() => Math.random() - 0.5);
        const roundCards = shuffled.slice(0, gameSession.cardsPerRound);
        const cardIds = roundCards.map(c => c.id);

        // Update game session
        const nextRound = gameSession.currentRound + 1;

        // Handle leader re-election logic
        const teams = await prisma.team.findMany({
            where: { gameSessionId: gameSession.id }
        });

        const playerUpdates = [];
        for (const team of teams) {
            // Check if leader term has expired
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const teamData = team as any;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sessionData = gameSession as any;
            if (nextRound - (teamData.lastLeaderElectionRound || 0) >= (sessionData.leaderTermLength || 3)) {
                console.log(`Team ${team.name} leader term expired. Triggering re-election.`);
                playerUpdates.push(
                    prisma.player.updateMany({
                        where: {
                            teamId: team.id,
                            gameSessionId: gameSession.id
                        },
                        data: { isLeader: false }
                    })
                );
            }
        }

        if (playerUpdates.length > 0) {
            await prisma.$transaction(playerUpdates);
        }

        const updated = await prisma.gameSession.update({
            where: { id: gameSession.id },
            data: {
                currentRound: nextRound,
                currentCardIndex: 0,
                shuffledCardIds: cardIds
            }
        });

        return NextResponse.json({
            success: true,
            round: updated.currentRound,
            cards: roundCards
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to start round", error);
        return NextResponse.json({
            success: false,
            error: 'Failed to start round. Please try again.'
        }, { status: 500 });
    }
}
