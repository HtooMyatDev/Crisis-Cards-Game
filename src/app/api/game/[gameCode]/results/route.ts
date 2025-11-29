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
                players: {
                    include: {
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

        // Calculate team scores
        const redPlayers = gameSession.players.filter(p => p.team === 'RED');
        const bluePlayers = gameSession.players.filter(p => p.team === 'BLUE');

        const redScore = redPlayers.reduce((sum, p) => sum + p.responses.length, 0);
        const blueScore = bluePlayers.reduce((sum, p) => sum + p.responses.length, 0);

        // Determine winner
        let winner: 'RED' | 'BLUE' | 'TIE';
        if (redScore > blueScore) {
            winner = 'RED';
        } else if (blueScore > redScore) {
            winner = 'BLUE';
        } else {
            winner = 'TIE';
        }

        return NextResponse.json({
            gameName: gameSession.name,
            gameCode: gameSession.gameCode,
            status: gameSession.status,
            winner,
            scores: {
                red: redScore,
                blue: blueScore
            },
            teams: {
                red: redPlayers.map(p => ({
                    id: p.id,
                    nickname: p.nickname,
                    responsesCount: p.responses.length
                })),
                blue: bluePlayers.map(p => ({
                    id: p.id,
                    nickname: p.nickname,
                    responsesCount: p.responses.length
                }))
            },
            totalPlayers: gameSession.players.length,
            totalResponses: redScore + blueScore
        });

    } catch (error) {
        console.error('Error fetching game results:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game results' },
            { status: 500 }
        );
    }
}
