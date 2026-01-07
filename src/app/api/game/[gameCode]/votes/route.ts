import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get('playerId');
        const cardId = searchParams.get('cardId');

        if (!playerId || !cardId) {
            return NextResponse.json(
                { error: 'Player ID and Card ID are required' },
                { status: 400 }
            );
        }

        const id = parseInt(playerId);
        const cId = parseInt(cardId);

        // 1. Get the requesting player to know their team
        const player = await prisma.player.findUnique({
            where: { id },
            select: { team: true, gameSessionId: true }
        });

        if (!player || !player.team) {
            return NextResponse.json(
                { error: 'Player not found or not in a team' },
                { status: 404 }
            );
        }

        // 2. Count votes for this card from the same team
        // We group by responseId and count
        const votes = await prisma.playerResponse.groupBy({
            by: ['responseId'],
            where: {
                cardId: cId,
                player: {
                    gameSessionId: player.gameSessionId,
                    teamId: player.team.id,
                    isLeader: false // EXCLUDE leader's own vote/decision from the "suggestion" counts
                }
            },
            _count: {
                responseId: true
            }
        });

        // 3. Format response: { [responseId]: count }
        const voteCounts: Record<number, number> = {};
        votes.forEach(v => {
            voteCounts[v.responseId] = v._count.responseId;
        });

        return NextResponse.json(voteCounts);

    } catch (error) {
        console.error('Error fetching votes:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
