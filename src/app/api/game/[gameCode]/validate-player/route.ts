import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get('playerId');

        if (!playerId) {
            return NextResponse.json(
                { error: 'Missing playerId' },
                { status: 400 }
            );
        }

        // Check if player exists and belongs to this game
        const player = await prisma.player.findUnique({
            where: { id: parseInt(playerId) },
            include: {
                gameSession: true,
                team: true
            }
        });

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        if (player.gameSession.gameCode !== gameCode.toUpperCase()) {
            return NextResponse.json(
                { error: 'Player does not belong to this game' },
                { status: 403 }
            );
        }

        return NextResponse.json({
            valid: true,
            playerId: player.id,
            nickname: player.nickname,
            team: player.team,
            isLeader: player.isLeader
        });

    } catch (error) {
        console.error('Error validating player:', error);
        return NextResponse.json(
            { error: 'Failed to validate player' },
            { status: 500 }
        );
    }
}
