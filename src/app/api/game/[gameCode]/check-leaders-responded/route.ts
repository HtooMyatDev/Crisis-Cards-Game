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

        // Check if all leaders have responded to this card
        const responses = await prisma.playerResponse.findMany({
            where: {
                cardId: parseInt(cardId),
                playerId: {
                    in: leaders.map(l => l.id)
                }
            }
        });

        const allLeadersResponded = responses.length === leaders.length && leaders.length > 0;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const currentRoundStatus = (gameSession as any).roundStatus;

        if (allLeadersResponded && currentRoundStatus !== 'RESULTS_PHASE') {
            await prisma.gameSession.update({
                where: { id: gameSession.id },
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                data: { roundStatus: 'RESULTS_PHASE' } as any
            });
        }

        return NextResponse.json({
            bothLeadersResponded: allLeadersResponded,
            roundStatus: allLeadersResponded ? 'RESULTS_PHASE' : currentRoundStatus
        });
    } catch (error) {
        console.error('Error checking leaders response:', error);
        return NextResponse.json(
            { error: 'Failed to check leaders response' },
            { status: 500 }
        );
    }
}
