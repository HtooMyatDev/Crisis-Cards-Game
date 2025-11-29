import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const body = await request.json();
        const { playerId, cardId, responseId } = body;

        if (!gameCode || !playerId || !cardId || !responseId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
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

        // Verify player belongs to this game
        const player = await prisma.player.findUnique({
            where: { id: parseInt(playerId) },
            include: { gameSession: true }
        });

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const isLeader = (player as any)?.isLeader;

        console.log('Submit validation:', {
            playerId,
            playerFound: !!player,
            playerGameSessionId: player?.gameSessionId,
            gameSessionId: gameSession.id,
            match: player?.gameSessionId === gameSession.id,
            isLeader: isLeader
        });

        if (!player || player.gameSession.gameCode !== gameCode) {
            return NextResponse.json(
                { error: 'Invalid player or game code' },
                { status: 404 }
            );
        }

        // ALLOW ALL PLAYERS TO SUBMIT (Votes vs Final Decision)
        // We no longer block non-leaders. Their submission counts as a vote.
        // The frontend will distinguish the UX.

        // Check if already responded
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const existingResponse = await (prisma as any).playerResponse.findUnique({
            where: {
                playerId_cardId: {
                    playerId: parseInt(playerId),
                    cardId: parseInt(cardId)
                }
            }
        });

        if (existingResponse) {
            return NextResponse.json(
                { error: 'Already responded to this card' },
                { status: 409 }
            );
        }

        // Record response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const response = await (prisma as any).playerResponse.create({
            data: {
                playerId: parseInt(playerId),
                cardId: parseInt(cardId),
                responseId: parseInt(responseId)
            }
        });

        return NextResponse.json({ success: true, responseId: response.id });

    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}
