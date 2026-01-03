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
        const { initialBudget, initialBaseValue, leaderTermLength, gameDurationMinutes } = body;

        // Validate types
        if (
            (initialBudget !== undefined && typeof initialBudget !== 'number') ||
            (initialBaseValue !== undefined && typeof initialBaseValue !== 'number') ||
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
                ...(initialBaseValue !== undefined && { initialBaseValue }),
                ...(leaderTermLength !== undefined && { leaderTermLength }),
                ...(gameDurationMinutes !== undefined && { gameDurationMinutes })
            }
        });

        // If budget changed, update all teams that are still at initial budget state
        if (initialBudget !== undefined) {
            await prisma.team.updateMany({
                where: { gameSessionId: gameId },
                data: { budget: initialBudget }
            });
        }

        // If base value changed, update all teams
        if (initialBaseValue !== undefined) {
            await prisma.team.updateMany({
                where: { gameSessionId: gameId },
                data: { baseValue: initialBaseValue }
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
