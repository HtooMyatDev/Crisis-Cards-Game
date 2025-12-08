import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

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

        // Start the game by setting the timestamp for the first card
        const updatedGame = await prisma.gameSession.update({
            where: { id: gameSession.id },
            data: {
                lastCardStartedAt: new Date(),
                status: 'IN_PROGRESS' // Ensure status is correct
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
