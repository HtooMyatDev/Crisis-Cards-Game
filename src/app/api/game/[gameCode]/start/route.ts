import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = 'force-dynamic';

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

        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode.toUpperCase() }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        // Check if cards are already shuffled/assigned
        let shuffledCardIds = gameSession.shuffledCardIds;

        if (!shuffledCardIds || shuffledCardIds.length === 0) {
            console.log(`Game ${gameCode}: Shuffling all active cards regardless of categories...`);

            // Fetch all active cards regardless of categories
            const allActiveCards = await prisma.card.findMany({
                where: {
                    status: 'Active',
                    isArchived: false
                },
                select: { id: true, timeLimit: true }
            });

            if (allActiveCards.length > 0) {
                // Shuffle all cards
                const shuffled = allActiveCards.sort(() => Math.random() - 0.5);

                const cardsPerRound = gameSession.cardsPerRound || 3;

                // Determine card count based on game duration (assume 5 mins per card if no timeLimit)
                // Default to 9 cards (3 rounds of 3) if calculation yields less, as per fairness requirement
                const rawTargetCount = Math.floor(gameSession.gameDurationMinutes / 5) || 9;

                // Ensure strict divisibility by cardsPerRound to guarantee fair rounds
                // e.g. 10 cards / 3 = 3.33 -> 3 rounds * 3 = 9 cards
                let targetCardCount = Math.floor(rawTargetCount / cardsPerRound) * cardsPerRound;

                // Clamp to actual available cards
                // e.g. want 9 cards, have 8 -> 8
                targetCardCount = Math.min(targetCardCount, allActiveCards.length);

                // Re-verify divisibility after clamping
                // e.g. clamped to 8, need multiple of 3 -> 6
                targetCardCount = Math.floor(targetCardCount / cardsPerRound) * cardsPerRound;

                if (targetCardCount < cardsPerRound) {
                     console.warn(`Game ${gameCode}: Not enough cards (${allActiveCards.length}) for a full round of ${cardsPerRound}.`);
                     // Fallback: use all available if we can't make even one round?
                     // Or just error. Proceeding with 0 cards would be broken.
                     // Proceeding with partial round is better than crash.
                     if (allActiveCards.length > 0) {
                        targetCardCount = allActiveCards.length;
                     }
                }

                shuffledCardIds = shuffled.slice(0, targetCardCount).map(c => c.id);
                console.log(`Game ${gameCode}: Selected ${shuffledCardIds.length} cards for ${gameSession.gameDurationMinutes} minutes game.`);
            } else {
                return NextResponse.json(
                    { error: 'No active cards found in the system.' },
                    { status: 400 }
                );
            }
        }

        // Start the game by setting the timestamp for the first card and saving shuffled cards
        const updatedGame = await prisma.gameSession.update({
            where: { id: gameSession.id },
            data: {
                lastCardStartedAt: new Date(),
                status: 'IN_PROGRESS', // Ensure status is correct
                roundStatus: 'LEADER_ELECTION', // First election before round starts
                currentRound: 1, // Explicitly start at round 1
                shuffledCardIds: shuffledCardIds
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Game started successfully',
            game: updatedGame
        });

    } catch (error) {
        console.error('Error starting game:', error);
        return NextResponse.json(
            { error: 'Failed to start game' },
            { status: 500 }
        );
    }
}
