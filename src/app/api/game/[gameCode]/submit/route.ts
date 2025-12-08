import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const body = await request.json();
        const { playerId, cardId, responseId } = body;

        if (!gameCode || !playerId || !cardId || !responseId) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Verify game session with team data
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode.toUpperCase() },
            include: {
                teams: true
            }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game session not found' },
                { status: 404 }
            );
        }

        // Verify player belongs to this game
        const player = await prisma.player.findUnique({
            where: { id: parseInt(playerId) },
            include: {
                gameSession: true,
                team: true
            }
        });

        if (!player || player.gameSession.gameCode !== gameCode) {
            return NextResponse.json(
                { error: 'Invalid player or game code' },
                { status: 404 }
            );
        }

        if (!player.team) {
            return NextResponse.json(
                { error: 'Player not assigned to a team' },
                { status: 400 }
            );
        }

        // Get response option with cost
        const responseOption = await prisma.cardResponse.findUnique({
            where: { id: parseInt(responseId) }
        });

        if (!responseOption) {
            return NextResponse.json(
                { error: 'Response option not found' },
                { status: 404 }
            );
        }

        // Check if already responded
        const existingResponse = await prisma.playerResponse.findUnique({
            where: {
                playerId_cardId: {
                    playerId: parseInt(playerId),
                    cardId: parseInt(cardId)
                }
            }
        });

        if (existingResponse) {
            return NextResponse.json(
                { error: 'Already responded to this card' },
                { status: 409 }
            );
        }

        // Calculate new budget (cost is negative, so we add it)
        const newBudget = player.team.budget + responseOption.cost;
        const isDebt = newBudget < 0;

        // Update team budget
        await prisma.team.update({
            where: { id: player.teamId! },
            data: { budget: newBudget }
        });

        // Calculate score with team base value
        const baseValue = player.team.baseValue;
        const effectValues = {
            political: responseOption.politicalEffect,
            economic: responseOption.economicEffect,
            infrastructure: responseOption.infrastructureEffect,
            society: responseOption.societyEffect,
            environment: responseOption.environmentEffect
        };

        // Total effect is sum of all effects plus base value
        const totalEffect = Object.values(effectValues).reduce((sum, val) => sum + val, 0);
        const scoreChange = baseValue + totalEffect;

        // Update player score
        await prisma.player.update({
            where: { id: parseInt(playerId) },
            data: { score: player.score + scoreChange }
        });

        // Record response
        const response = await prisma.playerResponse.create({
            data: {
                playerId: parseInt(playerId),
                cardId: parseInt(cardId),
                responseId: parseInt(responseId)
            }
        });

        return NextResponse.json({
            success: true,
            responseId: response.id,
            consequence: {
                cost: responseOption.cost,
                effects: effectValues,
                baseValue,
                scoreChange,
                newBudget,
                isDebt
            }
        });

    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}
