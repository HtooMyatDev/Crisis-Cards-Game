import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from 'next/server';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const { searchParams } = new URL(req.url);
        const cardId = searchParams.get('cardId');

        if (!cardId) {
            return NextResponse.json({ error: 'Card ID is required' }, { status: 400 });
        }

        // Get the game session
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode },
            include: {
                players: {
                    where: {
                        isLeader: true
                    }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json({ error: 'Game not found' }, { status: 404 });
        }

        // Get the leaders (should be 2, one for each team)
        const leaders = gameSession.players;

        if (leaders.length < 2) {
            // Not enough leaders yet
            return NextResponse.json({ bothLeadersResponded: false });
        }

        // Check if both leaders have responded to this card
        const responses = await prisma.playerResponse.findMany({
            where: {
                cardId: parseInt(cardId),
                playerId: {
                    in: leaders.map(l => l.id)
                }
            }
        });

        const bothLeadersResponded = responses.length === 2;

        return NextResponse.json({ bothLeadersResponded });
    } catch (error) {
        console.error('Error checking leaders response:', error);
        return NextResponse.json(
            { error: 'Failed to check leaders response' },
            { status: 500 }
        );
    }
}
