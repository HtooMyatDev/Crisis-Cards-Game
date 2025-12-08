import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { id } = await params;
        const body = await request.json();
        const { assignments } = body; // Array of { playerId, teamId }

        if (!id) {
            return NextResponse.json(
                { error: 'Game ID is required' },
                { status: 400 }
            );
        }

        if (!assignments || !Array.isArray(assignments)) {
            return NextResponse.json(
                { error: 'Assignments array is required' },
                { status: 400 }
            );
        }

        // Verify game session exists
        const gameSession = await prisma.gameSession.findUnique({
            where: { id }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        // Perform updates in a transaction
        await prisma.$transaction(
            assignments.map((assignment: { playerId: number; teamId: string | null }) =>
                prisma.player.update({
                    where: { id: assignment.playerId },
                    data: {
                        teamId: assignment.teamId,
                        isLeader: false // Reset leader status when reassigning
                    }
                })
            )
        );

        // Fetch updated players
        const updatedPlayers = await prisma.player.findMany({
            where: { gameSessionId: id },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        color: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'asc'
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Players assigned successfully',
            players: updatedPlayers
        });

    } catch (error) {
        console.error('Error assigning players:', error);
        return NextResponse.json(
            { error: 'Failed to assign players' },
            { status: 500 }
        );
    }
}
