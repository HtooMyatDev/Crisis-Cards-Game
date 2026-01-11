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

        console.log(`[SubmitAPI] Received submission for game: ${gameCode}, player: ${playerId}, card: ${cardId}`);

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

        // Calculate impacts
        const cost = responseOption.cost || 0;
        const economicEffect = responseOption.economicEffect || 0;
        const baseValue = player.team.baseValue || 5;

        // Sum of all effect values associated with the response
        const effectsSum = (responseOption.politicalEffect || 0) +
                         (responseOption.economicEffect || 0) +
                         (responseOption.infrastructureEffect || 0) +
                         (responseOption.societyEffect || 0) +
                         (responseOption.environmentEffect || 0);

        const scoreChange = baseValue + effectsSum;
        const budgetChange = economicEffect - cost;

        await prisma.$transaction(async (tx) => {
            // 1. Record the response
            await tx.playerResponse.create({
                data: {
                    playerId: parseInt(playerId),
                    cardId: parseInt(cardId),
                    responseId: parseInt(responseId)
                }
            });

            // 2. If Leader, apply effects and check for phase transition
            if (player.isLeader) {
                // Update scores for all team members
                await tx.player.updateMany({
                    where: { teamId: player.teamId },
                    data: { score: { increment: scoreChange } }
                });

                // Update team budget
                await tx.team.update({
                    where: { id: player.teamId! },
                    data: { budget: { increment: budgetChange } }
                });

                // Fetch latest game session for consistent lastTurnResult update
                const currentSession = await tx.gameSession.findUnique({
                    where: { id: gameSession.id },
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    select: { lastTurnResult: true, id: true } as any
                });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const currentResults = (currentSession?.lastTurnResult as any) || { teamScoreChanges: [] };

                // Append this team's result
                const newTeamResult = {
                    teamId: player.teamId,
                    teamName: player.team!.name,
                    teamColor: player.team!.color,
                    scoreChange: scoreChange,
                    budgetChange: budgetChange,
                    selectedResponse: responseOption.text,
                    impactDescription: responseOption.impactDescription,
                    selectedResponseEffects: {
                        political: responseOption.politicalEffect,
                        economic: responseOption.economicEffect,
                        infrastructure: responseOption.infrastructureEffect,
                        society: responseOption.societyEffect,
                        environment: responseOption.environmentEffect
                    }
                };

                const updatedResults = {
                    ...currentResults,
                    teamScoreChanges: [...(currentResults.teamScoreChanges || []), newTeamResult]
                };

                // Check if all leaders have responded
                const totalTeams = await tx.team.count({
                    where: { gameSessionId: gameSession.id }
                });

                const leaderResponses = await tx.playerResponse.count({
                    where: {
                        cardId: parseInt(cardId),
                        player: {
                            isLeader: true,
                            gameSessionId: gameSession.id
                        }
                    }
                });

                // Only transition if ALL teams have responded
                const allTeamsResponded = leaderResponses >= totalTeams;

                await tx.gameSession.update({
                    where: { id: gameSession.id },
                    data: {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        lastTurnResult: updatedResults as any,
                        roundStatus: allTeamsResponded ? 'RESULTS_PHASE' : undefined
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });
            }
        });

        // Trigger real-time update
        try {
            const { pusherServer } = await import('@/lib/pusher');
            if (gameCode) {
                await pusherServer.trigger(`game-${gameCode}`, 'game-update', {
                    type: 'RESPONSE_SUBMITTED',
                    data: {
                        playerId: player.id,
                        teamId: player.teamId,
                        isLeader: player.isLeader,
                        timestamp: Date.now()
                    }
                });
            }
        } catch (pusherError) {
            console.error('Failed to trigger Pusher event:', pusherError);
        }

        return NextResponse.json({
            success: true,
            message: player.isLeader ? 'Leader decision recorded & round complete' : 'Vote recorded',
            isLeader: player.isLeader
        });

    } catch (error) {
        console.error('Error submitting response:', error);
        return NextResponse.json(
            { error: 'Failed to submit response' },
            { status: 500 }
        );
    }
}
