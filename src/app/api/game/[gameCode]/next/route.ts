import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
// GameStatus is an enum in Prisma schema but might not be exported directly from client in some setups
// or it's just a value. Let's use the string literal if enum import fails, or ensure correct import.
// Actually, GameStatus IS exported from @prisma/client usually.
// If it fails, we can use the string 'COMPLETED' directly or type it.

export async function POST(
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

        // Verify game session and get total cards
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode.toUpperCase() },
            include: {
                categories: {
                    include: {
                        category: {
                            include: {
                                cards: {
                                    where: {
                                        status: 'Active',
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
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        // Calculate total cards from shuffledCardIds if available, otherwise from categories
        let totalCards: number;
        if (gameSession.shuffledCardIds && gameSession.shuffledCardIds.length > 0) {
            totalCards = gameSession.shuffledCardIds.length;
        } else {
            // Fallback for backward compatibility (shouldn't happen in normal flow)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            totalCards = (gameSession.categories as any[]).reduce(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (acc: number, gc: any) => acc + gc.category.cards.length,
                0
            );
            console.warn(`Game ${gameCode}: shuffledCardIds is empty, using category count as fallback`);
        }

        const nextIndex = gameSession.currentCardIndex + 1;

        if (nextIndex >= totalCards) {
            // End game - keep players for results screen
            const completedGame = await prisma.gameSession.update({
                where: { id: gameSession.id },
                data: {
                    status: 'COMPLETED', // Using string literal to avoid import issues if any
                    endedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Game completed',
                gameStatus: completedGame.status
            });
        } else {
            // Next card
            const updatedGame = await prisma.gameSession.update({
                where: { id: gameSession.id },
                data: {
                    currentCardIndex: nextIndex,
                    lastCardStartedAt: new Date() // Reset timer for next card
                }
            });

            // --- LEADER ROTATION LOGIC ---
            // Fetch all players in this game
            const players = await prisma.player.findMany({
                where: { gameSessionId: gameSession.id },
                orderBy: { joinedAt: 'asc' } // Consistent order based on join time
            });

            const teams = ['RED', 'BLUE'];
            const updatePromises = [];

            // Determine the card that just finished using shuffledCardIds
            let finishedCard;
            if (gameSession.shuffledCardIds && gameSession.shuffledCardIds.length > 0) {
                const finishedCardId = gameSession.shuffledCardIds[gameSession.currentCardIndex];
                // Fetch the finished card details
                const allCards = gameSession.categories.flatMap((gc) => gc.category.cards);
                finishedCard = allCards.find((c) => c.id === finishedCardId);
            } else {
                console.warn(`Game ${gameCode}: Cannot determine finished card, shuffledCardIds is empty`);
            }

            for (const team of teams) {
                const teamPlayers = players.filter((p) => p.team === team);
                if (teamPlayers.length === 0) continue;

                const currentLeaderIndex = teamPlayers.findIndex((p) => p.isLeader);

                if (currentLeaderIndex !== -1) {
                    const currentLeader = teamPlayers[currentLeaderIndex];

                    // 1. UPDATE SCORES
                    if (finishedCard) {
                        let leaderResponse = await prisma.playerResponse.findUnique({
                            where: {
                                playerId_cardId: {
                                    playerId: currentLeader.id,
                                    cardId: finishedCard.id
                                }
                            },
                            include: { response: true }
                        });

                        // If no response found (timeout), pick a random one
                        if (!leaderResponse) {
                            const responses = await prisma.cardResponse.findMany({
                                where: { cardId: finishedCard.id }
                            });

                            if (responses.length > 0) {
                                const randomResponse = responses[Math.floor(Math.random() * responses.length)];

                                // Record the random response
                                leaderResponse = await prisma.playerResponse.create({
                                    data: {
                                        playerId: currentLeader.id,
                                        cardId: finishedCard.id,
                                        responseId: randomResponse.id
                                    },
                                    include: { response: true }
                                });
                            }
                        }

                        if (leaderResponse?.response?.score) {
                            const scoreChange = leaderResponse.response.score;
                            // Update score for ALL players in the team
                            for (const player of teamPlayers) {
                                updatePromises.push(prisma.player.update({
                                    where: { id: player.id },
                                    data: { score: { increment: scoreChange } }
                                }));
                            }
                        }
                    }

                    // 2. ROTATE LEADER
                    const nextLeaderIndex = (currentLeaderIndex + 1) % teamPlayers.length;
                    const nextLeader = teamPlayers[nextLeaderIndex];

                    if (currentLeader.id !== nextLeader.id) {
                        updatePromises.push(prisma.player.update({
                            where: { id: currentLeader.id },
                            data: { isLeader: false }
                        }));
                        updatePromises.push(prisma.player.update({
                            where: { id: nextLeader.id },
                            data: { isLeader: true }
                        }));
                    }
                } else {
                    // No leader found, assign first
                    if (teamPlayers.length > 0) {
                        updatePromises.push(prisma.player.update({
                            where: { id: teamPlayers[0].id },
                            data: { isLeader: true }
                        }));
                    }
                }
            }

            await Promise.all(updatePromises);
            // -----------------------------

            return NextResponse.json({ success: true, status: 'IN_PROGRESS', game: updatedGame });
        }

    } catch (error) {
        console.error('Error advancing game:', error);
        return NextResponse.json(
            { error: 'Failed to advance game' },
            { status: 500 }
        );
    }
}
