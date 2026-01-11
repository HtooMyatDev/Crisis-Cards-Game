import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        await params; // consume params for lint
        const { playerId } = await request.json();

        if (!playerId) {
            return NextResponse.json(
                { error: 'Player ID is required' },
                { status: 400 }
            );
        }

        const id = parseInt(playerId);

        // 1. Get the player to check if they are a leader
        const player = await prisma.player.findUnique({
            where: { id },
            include: { gameSession: true, team: true }
        });

        if (!player) {
            return NextResponse.json(
                { error: 'Player not found' },
                { status: 404 }
            );
        }

        // 2. If player is a leader, we need to reassign leadership
        if (player.isLeader && player.team) {
            // Find other players in the same team, sorted by join time (oldest first)
            const teammates = await prisma.player.findMany({
                where: {
                    gameSessionId: player.gameSessionId,
                    teamId: player.teamId,
                    id: { not: id }, // Exclude the leaving player
                    isConnected: true // Only consider connected players
                },
                orderBy: {
                    joinedAt: 'asc'
                }
            });

            if (teammates.length > 0) {
                // Assign the oldest teammate as the new leader
                const newLeader = teammates[0];
                await prisma.player.update({
                    where: { id: newLeader.id },
                    data: { isLeader: true }
                });
                console.log(`Leadership transferred from ${player.nickname} to ${newLeader.nickname} for team ${player.team?.name}`);
            } else {
                console.log(`No teammates found for team ${player.team?.name}. Team is now leaderless.`);
            }
        }

        // 3. Delete the player (or mark as disconnected if you prefer soft delete)
        // For now, we'll delete them to keep the game clean as per previous logic
        await prisma.player.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error leaving game:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
