import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

/**
 * GET /api/admin/games/[id]
 * Retrieves a specific game session by ID
 *
 * @requires Authentication - User must be logged in
 * @param {string} id - Game session ID
 * @returns {200} Game session details
 * @returns {401} Unauthorized
 * @returns {404} Game not found
 * @returns {500} Server error
 */
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { id } = await params;

        const game = await prisma.gameSession.findUnique({
            where: { id },
            include: {
                host: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                categories: {
                    include: {
                        category: {
                            select: {
                                id: true,
                                name: true,
                                color: true
                            }
                        }
                    }
                },
                players: {
                    select: {
                        id: true,
                        nickname: true,
                        teamId: true,
                        score: true,
                        isConnected: true,
                        joinedAt: true,
                        isLeader: true
                    },
                    orderBy: {
                        joinedAt: 'asc'
                    }
                },
                teams: {
                    include: {
                        players: {
                            select: {
                                id: true,
                                nickname: true
                            }
                        }
                    },
                    orderBy: {
                        order: 'asc'
                    }
                }
            }
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, game });
    } catch (error) {
        console.error('Error fetching game:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game details' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/games/[id]
 * Updates a game session status
 *
 * @requires Authentication - Admin only
 * @param {string} id - Game session ID
 * @body {string} status - New status (WAITING, IN_PROGRESS, PAUSED, COMPLETED)
 * @returns {200} Updated game session
 * @returns {400} Invalid status
 * @returns {401} Unauthorized
 * @returns {500} Server error
 */
export async function PATCH(
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

        const body = await request.json();
        const { status } = body;
        const { id } = await params;

        // Validate status
        const validStatuses = ['WAITING', 'IN_PROGRESS', 'PAUSED', 'COMPLETED'];
        if (!status || !validStatuses.includes(status)) {
            return NextResponse.json(
                { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
                { status: 400 }
            );
        }

        // Prepare update data
        const updateData: {
            status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
            startedAt?: Date;
            endedAt?: Date;
        } = { status };

        // Set timestamps based on status transition
        if (status === 'IN_PROGRESS') {
            // We update startedAt every time it goes to in_progress to track latest session start
            // Alternatively, check if it's null to only set on first start
            updateData.startedAt = new Date();
        } else if (status === 'COMPLETED') {
            updateData.endedAt = new Date();
        }

        const updatedGame = await prisma.gameSession.update({
            where: { id },
            data: updateData
        });

        // Trigger real-time update
        try {
            const { pusherServer } = await import('@/lib/pusher');
            if (updatedGame.gameCode) {
                await pusherServer.trigger(`game-${updatedGame.gameCode}`, 'game-update', {
                    type: 'STATUS_CHANGE',
                    data: {
                        status: updatedGame.status,
                        timestamp: Date.now()
                    }
                });
            }
        } catch (pusherError) {
            console.error('Failed to trigger Pusher event:', pusherError);
        }

        return NextResponse.json({
            success: true,
            message: 'Game status updated successfully',
            game: updatedGame
        });

    } catch (error) {
        console.error('Error updating game status:', error);
        return NextResponse.json(
            { error: 'Failed to update game status' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/games/[id]
 * Deletes a game session and all related data
 *
 * @requires Authentication - Admin only
 * @param {string} id - Game session ID
 * @returns {200} Success message
 * @returns {401} Unauthorized
 * @returns {500} Server error
 */
export async function DELETE(
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

        // Use transaction to ensure clean deletion
        await prisma.$transaction(async (tx) => {
            // 1. Delete all players associated with this game session
            await tx.player.deleteMany({
                where: { gameSessionId: id }
            });

            // 2. Delete the game session
            // Cascade delete in schema should handle related records like GameSessionCategory,
            // Teams, LeaderVotes, etc. but explicit player deletion is safer if no cascade
            await tx.gameSession.delete({
                where: { id }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Game session deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting game session:', error);
        return NextResponse.json(
            { error: 'Failed to delete game session' },
            { status: 500 }
        );
    }
}
