import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const gameId = id;
        const body = await request.json();
        const { initialBudget, leaderTermLength, gameDurationMinutes } = body;

        // Validate types
        if (
            (initialBudget !== undefined && typeof initialBudget !== 'number') ||
            (leaderTermLength !== undefined && typeof leaderTermLength !== 'number') ||
            (gameDurationMinutes !== undefined && typeof gameDurationMinutes !== 'number')
        ) {
            return NextResponse.json(
                { error: 'Invalid setting values. Must be numbers.' },
                { status: 400 }
            );
        }

        const updatedGame = await prisma.gameSession.update({
            where: { id: gameId },
            data: {
                ...(initialBudget !== undefined && { initialBudget }),
                ...(leaderTermLength !== undefined && { leaderTermLength }),
                ...(gameDurationMinutes !== undefined && { gameDurationMinutes })
            }
        });

        // If budget changed, update all teams that are still at initial budget state
        // (This is a choice - we could alternatively only apply to NEW teams,
        // but the user said "starting game with equal budget")
        if (initialBudget !== undefined) {
            await prisma.team.updateMany({
                where: { gameSessionId: gameId },
                data: { budget: initialBudget, baseValue: initialBudget }
            });
        }

        return NextResponse.json({
            success: true,
            game: updatedGame
        });

    } catch (error) {
        console.error('Error updating game config:', error);
        return NextResponse.json(
            { error: 'Failed to update game configuration' },
            { status: 500 }
        );
    }
}
