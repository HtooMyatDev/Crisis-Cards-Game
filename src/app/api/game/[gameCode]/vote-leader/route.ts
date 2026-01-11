import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";
import { redis } from "@/lib/redis";

/**
 * POST /api/game/[gameCode]/vote-leader
 * Allows players to vote for their team leader
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;
        const { playerId, candidateId } = await request.json();

        if (!playerId || !candidateId) {
            return NextResponse.json({
                success: false,
                error: 'Player ID and Candidate ID are required'
            }, { status: 400 });
        }

        // Get game session
        const gameSession = await prisma.gameSession.findUnique({
            where: { gameCode: gameCode },
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

            if (winners.length > 1) {
                // TIE detected - Trigger Runoff
                // Update Team: Set Status = RUNOFF, Update Candidates, Increment Count
                await prisma.team.update({
                    where: { id: voter.teamId },
                    data: {
                        electionStatus: 'RUNOFF',
                        runoffCandidates: winners,
                        runoffCount: { increment: 1 }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });

                // Clear votes for this round to allow re-voting
                await prisma.leaderVote.deleteMany({
                    where: {
                        gameSessionId: gameSession.id,
                        teamId: voter.teamId,
                        round: gameSession.currentRound
                    }
                });

                // RESET TIMER so players have time to vote again
                await prisma.gameSession.update({
                    where: { id: gameSession.id },
                    data: { lastCardStartedAt: new Date() }
                });

                // INVALIDATE CACHE so frontend sees runoff immediately
                if (redis) {
                    await redis.del(`game_player_view:${gameCode}`);
                }

                return NextResponse.json({
                    success: true,
                    voted: true,
                    leaderElected: false,
                    runoff: true,
                    candidates: winners,
                    message: 'Tie detected. Runoff election started.'
                }, { status: 200 });

            } else {
                // Winner elected
                const leaderId = winners[0];

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

                // Update team election status
                await prisma.team.update({
                    where: { id: voter.teamId },
                    data: {
                        lastLeaderElectionRound: gameSession.currentRound,
                        electionStatus: 'COMPLETED',
                        runoffCandidates: Prisma.JsonNull,
                        runoffCount: 0 // Reset count for next time
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });

                leaderElected = true;

                // Check if ALL teams in this session now have a leader
                // We only care about teams that matter (have players)
                const allTeams = await prisma.team.findMany({
                    where: { gameSessionId: gameSession.id },
                    include: { players: true }
                });

                const allTeamsHaveLeaders = allTeams.every(t =>
                    t.players.length === 0 || t.players.some(p => p.isLeader)
                );

                if (allTeamsHaveLeaders) {
                    await prisma.gameSession.update({
                        where: { id: gameSession.id },
                        data: {
                            roundStatus: 'DECISION_PHASE',
                            lastCardStartedAt: new Date() // Start timer now
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        } as any
                    });
                }

                // INVALIDATE CACHE so frontend sees leader elected
                if (redis) {
                    await redis.del(`game_player_view:${gameCode}`);
                }
            }
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
