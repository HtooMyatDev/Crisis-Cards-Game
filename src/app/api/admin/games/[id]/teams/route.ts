import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

/**
 * POST /api/admin/games/[id]/teams
 * Create a new team for a game session
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({
                error: 'Unauthorized. Admin access required.'
            }, { status: 401 });
        }

        const { id } = await params;
        const body = await request.json();
        const { name, color, budget, baseValue } = body;

        if (!name) {
            return NextResponse.json({
                error: 'Team name is required'
            }, { status: 400 });
        }

        // Check for duplicate team names in the same game session
        const existingTeam = await prisma.team.findFirst({
            where: {
                gameSessionId: id,
                name: {
                    equals: name,
                    mode: 'insensitive'
                }
            }
        });

        if (existingTeam) {
            return NextResponse.json({
                error: 'A team with this name already exists in this game'
            }, { status: 400 });
        }

        // Get current team count for order
        const teamCount = await prisma.team.count({
            where: { gameSessionId: id }
        });

        const team = await prisma.team.create({
            data: {
                gameSessionId: id,
                name,
                color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`, // Random color if not provided
                budget: budget || 5000,
                baseValue: baseValue || 5,
                order: teamCount
            }
        });

        return NextResponse.json({
            success: true,
            team
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating team:', error);
        return NextResponse.json({
            error: 'Failed to create team'
        }, { status: 500 });
    }
}

/**
 * DELETE /api/admin/games/[id]/teams/[teamId]
 * Delete a team (only if no players assigned)
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({
                error: 'Unauthorized. Admin access required.'
            }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const teamId = searchParams.get('teamId');

        if (!teamId) {
            return NextResponse.json({
                error: 'Team ID is required'
            }, { status: 400 });
        }

        // Check if team has players
        const playersCount = await prisma.player.count({
            where: { teamId }
        });

        if (playersCount > 0) {
            return NextResponse.json({
                error: 'Cannot delete team with assigned players. Unassign players first.'
            }, { status: 400 });
        }

        await prisma.team.delete({
            where: { id: teamId }
        });

        return NextResponse.json({
            success: true,
            message: 'Team deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting team:', error);
        return NextResponse.json({
            error: 'Failed to delete team'
        }, { status: 500 });
    }
}
