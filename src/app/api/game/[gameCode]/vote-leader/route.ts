import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

/**
 * POST /api/game/[gameCode]/vote-leader
 * Allows players to vote for their team leader
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { gameCode: string } }
) {
    try {
        const { playerId, candidateId } = await request.json();

        if (!playerId || !candidateId) {
            return NextResponse.json({
                success: false,
                error: 'Player ID and Candidate ID are required'
            }, { status: 400 });
        }

        // Get game session
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: params.gameCode },
            include: {
                players: {
                    include: {
                        team: true
                    }
                }
            }
        });

        if (!gameSession) {
            return NextResponse.json({
                success: false,
                error: 'Game not found'
            }, { status: 404 });
        }

        // Find voter and candidate
        const voter = gameSession.players.find(p => p.id === playerId);
        const candidate = gameSession.players.find(p => p.id === candidateId);

        if (!voter || !candidate) {
            return NextResponse.json({
                success: false,
                error: 'Player not found'
            }, { status: 404 });
        }

        // Verify same team
        if (voter.teamId !== candidate.teamId || !voter.teamId) {
            return NextResponse.json({
                success: false,
                error: 'Can only vote for players on your team'
            }, { status: 400 });
        }

        // Check if already voted this round
        const existingVote = await prisma.leaderVote.findUnique({
            where: {
                gameSessionId_voterId_round: {
                    gameSessionId: gameSession.id,
                    voterId: playerId,
                    round: gameSession.currentRound
                }
            }
        });

        if (existingVote) {
            return NextResponse.json({
                success: false,
                error: 'You have already voted this round'
            }, { status: 400 });
        }

        // Record vote
        await prisma.leaderVote.create({
            data: {
                gameSessionId: gameSession.id,
                teamId: voter.teamId,
                round: gameSession.currentRound,
                voterId: playerId,
                candidateId: candidateId
            }
        });

        // Check if all team members have voted
        const teamPlayers = gameSession.players.filter(p => p.teamId === voter.teamId);
        const teamVotes = await prisma.leaderVote.findMany({
            where: {
                gameSessionId: gameSession.id,
                teamId: voter.teamId,
                round: gameSession.currentRound
            }
        });

        let leaderElected = false;
        let leader = null;

        if (teamVotes.length === teamPlayers.length) {
            // All voted - tally votes
            const voteCounts: Record<number, number> = {};
            teamVotes.forEach(vote => {
                voteCounts[vote.candidateId] = (voteCounts[vote.candidateId] || 0) + 1;
            });

            // Find winner(s)
            const maxVotes = Math.max(...Object.values(voteCounts));
            const winners = Object.keys(voteCounts).filter(
                id => voteCounts[parseInt(id)] === maxVotes
            ).map(id => parseInt(id));

            // Random selection if tie
            const leaderId = winners[Math.floor(Math.random() * winners.length)];

            // Clear all leaders for this team
            await prisma.player.updateMany({
                where: {
                    teamId: voter.teamId,
                    gameSessionId: gameSession.id
                },
                data: { isLeader: false }
            });

            // Set new leader
            leader = await prisma.player.update({
                where: { id: leaderId },
                data: { isLeader: true }
            });

            leaderElected = true;
        }

        return NextResponse.json({
            success: true,
            voted: true,
            leaderElected,
            leader
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to vote for leader", error);
        return NextResponse.json({
            success: false,
            error: 'Failed to vote. Please try again.'
        }, { status: 500 });
    }
}
