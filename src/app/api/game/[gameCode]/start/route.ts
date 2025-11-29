import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";

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

        // Verify game session
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode.toUpperCase() }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        // Update status to IN_PROGRESS
        // Start the game
        const updatedGame = await prisma.gameSession.update({
            where: { id: gameSession.id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                lastCardStartedAt: new Date(), // Set timer start for first card
                currentCardIndex: 0 // Reset to first card
            }
        });

        return NextResponse.json({ success: true, game: updatedGame });

    } catch (error) {
        console.error('Error starting game:', error);
        return NextResponse.json(
            { error: 'Failed to start game' },
            { status: 500 }
        );
    }
}
