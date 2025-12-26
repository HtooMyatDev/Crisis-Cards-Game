import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const body = await request.json().catch(() => ({}));
        const clientCurrentIndex = body.currentCardIndex;

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
                teams: true,
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

        // Idempotency Check: If client is trying to advance a card that is already past, ignore.
        if (typeof clientCurrentIndex === 'number' && gameSession.currentCardIndex > clientCurrentIndex) {
            return NextResponse.json({
                success: true,
                status: gameSession.status,
                game: gameSession,
                message: 'Game already advanced'
            });
        }

        // Calculate total cards from shuffledCardIds if available, otherwise from categories
        let totalCards: number;

        // Ensure shuffledCardIds is typed correctly (it might be Json or null in Prisma types depending on generation)
        const shuffledIds = Array.isArray(gameSession.shuffledCardIds) ? gameSession.shuffledCardIds as number[] : [];

        if (shuffledIds.length > 0) {
            totalCards = shuffledIds.length;
        } else {
            // Fallback for backward compatibility (shouldn't happen in normal flow)
            totalCards = gameSession.categories.reduce(
                (acc: number, gc) => acc + gc.category.cards.length,
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
                    status: 'COMPLETED',
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
            const cardsPerRound = gameSession.cardsPerRound || 3;
            const isNewRound = nextIndex % cardsPerRound === 0;
            const nextRoundStatus = isNewRound ? 'LEADER_ELECTION' : 'DECISION_PHASE';

            const updatedGame = await prisma.gameSession.update({
                where: { id: gameSession.id },
                data: {
                    currentCardIndex: nextIndex,
                    lastCardStartedAt: new Date(), // Reset timer for next card
                    roundStatus: nextRoundStatus,
                    currentRound: { increment: isNewRound ? 1 : 0 }
                }
            });

            // --- RESET TURN STATE ---
            // Clear the temporary results from the previous turn since we are moving on
            await prisma.gameSession.update({
                where: { id: gameSession.id },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: { lastTurnResult: null } as any
            });

            // (Leader rotation handled by round logic or specific vote API, not auto-rotate here anymore)

            // Trigger real-time update
            try {
                // We use await here to ensure it attempts to send, but wrapped in try/catch to not block response on failure
                // Dynamically import to avoid circular dep issues if any, though not expected here
                const { pusherServer } = await import('@/lib/pusher');
                await pusherServer.trigger(`game-${gameCode}`, 'game-update', {
                    type: 'NEXT_CARD',
                    data: {
                        currentCardIndex: nextIndex,
                        roundStatus: nextRoundStatus,
                        timestamp: Date.now()
                    }
                });

                // Invalidate Redis Cache for Host View AND Player View
                const { redis } = await import('@/lib/redis');
                if (redis) {
                    await Promise.all([
                        redis.del(`host_view:${gameSession.id}`),
                        redis.del(`game_player_view:${gameCode}`)
                    ]);
                }
            } catch (error) {
                console.error('Failed to trigger Pusher or Redis:', error);
            }

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
