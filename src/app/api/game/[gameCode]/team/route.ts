import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const body = await request.json();
        const { playerId, team } = body;

        if (!gameCode || !playerId || !team) {
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
            where: { id: parseInt(playerId) }
        });

        if (!player || player.gameSessionId !== gameSession.id) {
            return NextResponse.json(
                { error: 'Invalid player' },
                { status: 403 }
            );
        }

        // Check if team already has a leader
        const existingLeader = await prisma.player.findFirst({
            where: {
                gameSessionId: gameSession.id,
                teamId: team,
                isLeader: true
            }
        });

        // First player to join this team becomes the leader
        const isLeader = !existingLeader;

        // Update player team and leader status
        const updatedPlayer = await prisma.player.update({
            where: { id: parseInt(playerId) },
            data: {
                teamId: team,
                isLeader
            },
            include: { team: true }
        });

        return NextResponse.json({
            success: true,
            team: updatedPlayer.team,
            isLeader: updatedPlayer.isLeader
        });

    } catch (error) {
        console.error('Error updating team:', error);
        return NextResponse.json(
            { error: 'Failed to update team' },
            { status: 500 }
        );
    }
}
