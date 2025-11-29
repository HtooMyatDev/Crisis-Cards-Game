import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const game = await prisma.gameSession.findUnique({
            where: {
                id
            },
            include: {
                host: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                players: true
            }
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, game });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    catch (error: any) {
        console.error('Error fetching game:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game details' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const body = await request.json();
        const { status } = body;
        const { id } = await params;

        if (!status) {
            return NextResponse.json(
                { error: 'Status is required' },
                { status: 400 }
            );
        }

        // Prepare update data
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const updateData: any = { status };

        // Set timestamps based on status
        if (status === 'IN_PROGRESS') {
            // Only set startedAt if it's not already set (optional, depends on business logic)
            // For now, we'll update it to track the latest start
            updateData.startedAt = new Date();
        } else if (status === 'COMPLETED') {
            updateData.endedAt = new Date();
        }

        const updatedGame = await prisma.gameSession.update({
            where: { id },
            data: updateData
        });

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

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // First, delete all players associated with this game session
        await prisma.player.deleteMany({
            where: {
                gameSessionId: id
            }
        });

        // Then delete the game session (cascade will handle related records)
        const deletedGame = await prisma.gameSession.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Game session deleted successfully',
            game: deletedGame
        });

    } catch (error) {
        console.error('Error deleting game session:', error);
        return NextResponse.json(
            { error: 'Failed to delete game session' },
            { status: 500 }
        );
    }
}
