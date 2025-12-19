import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;

        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode.toUpperCase() },
            include: {
                teams: true,
                players: {
                    include: {
                        team: true,
                        responses: {
                            include: {
                                response: true
                            }
                        }
                    }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        // Calculate team results
        const teamResults = gameSession.teams.map(team => {
            const teamPlayers = gameSession.players.filter(p => p.teamId === team.id);
            const score = teamPlayers.reduce((sum, p) => sum + (p.score || 0), 0);

            return {
                id: team.id,
                name: team.name,
                color: team.color,
                score,
                budget: team.budget,
                players: teamPlayers.map(p => ({
                    id: p.id,
                    nickname: p.nickname,
                    score: p.score,
                    isLeader: p.isLeader,
                    responsesCount: p.responses.length
                }))
            };
        });

        // Determine winner(s)
        // Determine winner(s)
        const sortedTeams = [...teamResults].sort((a, b) => b.score - a.score);
        const winningScore = sortedTeams.length > 0 ? sortedTeams[0].score : 0;
        // Winner is highest score (even if 0 or negative), tie if multiple teams share top score
        const winners = teamResults.filter(t => t.score === winningScore);

        return NextResponse.json({
            gameName: gameSession.name,
            gameCode: gameSession.gameCode,
            status: gameSession.status,
            teams: teamResults,
            winners: winners.map(w => ({ id: w.id, name: w.name })),
            totalPlayers: gameSession.players.length,
            totalTeams: gameSession.teams.length
        });

    } catch (error) {
        console.error('Error fetching game results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game results' },
            { status: 500 }
        );
    }
}
