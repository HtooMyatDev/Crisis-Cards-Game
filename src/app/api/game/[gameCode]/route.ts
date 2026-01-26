import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        const { gameCode } = await params;

        if (!gameCode) {
            return NextResponse.json(
                { error: 'Game code is required' },
                { status: 400 }
            );
        }

        const { getOrSetCache } = await import('@/lib/redis');

        // Cache this heavy player view for 2 seconds (absorbs high concurrency)
        const responseData = await getOrSetCache(`game_player_view:${gameCode}`, async () => {
            // Fetch game session with basic info and card IDs to determine current card
            const gameSession = await prisma.gameSession.findUnique({
                where: {
                    gameCode: gameCode.toUpperCase()
                },
                select: {
                    id: true,
                    gameCode: true,
                    status: true,
                    gameMode: true,
                    currentCardIndex: true,
                    lastCardStartedAt: true,
                    shuffledCardIds: true,
                    roundStatus: true,
                    currentRound: true,
                    leaderElectionTimer: true, // Re-trigger check
                    lastTurnResult: true,
                    players: {
                        select: {
                            id: true,
                            nickname: true,
                            score: true,
                            teamId: true,
                            team: {
                                select: {
                                    id: true,
                                    name: true,
                                    color: true,
                                    budget: true,
                                    electionStatus: true,
                                    runoffCandidates: true,
                                    runoffCount: true
                                }
                            },
                            isLeader: true,
                            isConnected: true
                        }
                    },
                    teams: {
                        select: {
                            id: true,
                            name: true,
                            color: true,
                            budget: true,
                            baseValue: true,
                            order: true,
                            electionStatus: true,
                            runoffCandidates: true,
                            runoffCount: true
                        },
                        orderBy: {
                            order: 'asc'
                        }
                    },
                    categories: {
                        select: {
                            category: {
                                select: {
                                    cards: {
                                        where: {
                                            status: 'Active',
                                            isArchived: false
                                        },
                                        select: {
                                            id: true
                                        },
                                        orderBy: {
                                            id: 'asc'
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!gameSession) return null;

             // --- LAZY TIMEOUT CHECK ---
             // If we are in LEADER_ELECTION and time has passed, force resolution
             if (gameSession.status === 'IN_PROGRESS'
                && gameSession.roundStatus === 'LEADER_ELECTION'
                && gameSession.lastCardStartedAt) {

                const elapsed = Date.now() - gameSession.lastCardStartedAt.getTime();
                // Default 60s if not set
                const limit = (gameSession.leaderElectionTimer || 60) * 1000;

                // Add 3s buffer for network latency/clock skew to avoid premature closing
                if (elapsed > limit + 3000) {
                    const updated = await resolveElectionTimeout(
                        gameSession.id,
                        gameSession.leaderElectionTimer || 60,
                        gameSession.currentRound
                    );

                    if (updated) {
                         // Refetch to return fresh state
                         return await prisma.gameSession.findUnique({
                             where: { id: gameSession.id }, // Use ID for speed
                             select: { // SAME SELECT AS ABOVE - keeping it consistent
                                id: true,
                                gameCode: true,
                                status: true,
                                gameMode: true,
                                currentCardIndex: true,
                                lastCardStartedAt: true,
                                shuffledCardIds: true,
                                roundStatus: true,
                                lastTurnResult: true,
                                players: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        score: true,
                                        teamId: true,
                                        team: { select: { id: true, name: true, color: true, budget: true, electionStatus: true, runoffCandidates: true, runoffCount: true } },
                                        isLeader: true,
                                        isConnected: true
                                    }
                                },
                                teams: {
                                    select: {
                                        id: true,
                                        name: true,
                                        color: true,
                                        budget: true,
                                        baseValue: true,
                                        order: true,
                                        electionStatus: true,
                                        runoffCandidates: true,
                                        runoffCount: true
                                    },
                                    orderBy: { order: 'asc' }
                                },
                                categories: {
                                    select: {
                                        category: {
                                            select: {
                                                cards: {
                                                    where: { status: 'Active', isArchived: false },
                                                    select: { id: true },
                                                    orderBy: { id: 'asc' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                         });
                    }
                }
            }
            // ---------------------------

            // --- LAZY DECISION TIMEOUT CHECK ---
            // If we are in DECISION_PHASE and time has passed, force submission
            if (gameSession.status === 'IN_PROGRESS'
                && gameSession.roundStatus === 'DECISION_PHASE'
                && gameSession.lastCardStartedAt) {

                const elapsed = Date.now() - gameSession.lastCardStartedAt.getTime();

                // Get current card's time limit
                let timeLimit = 60; // Default
                if (gameSession.shuffledCardIds && gameSession.shuffledCardIds.length > 0) {
                     const currentCardId = gameSession.shuffledCardIds[gameSession.currentCardIndex % gameSession.shuffledCardIds.length];
                     const card = await prisma.card.findUnique({ where: { id: currentCardId }, select: { timeLimit: true }});
                     if (card?.timeLimit) {
                         timeLimit = card.timeLimit;
                     }
                }

                const limitMs = timeLimit * 1000;

                 // Add 3s buffer
                if (elapsed > limitMs + 3000) {
                    const updated = await resolveDecisionTimeout(gameSession.id, gameSession.currentCardIndex, gameSession.shuffledCardIds);

                    if (updated) {
                         // Refetch to return fresh state (Results Phase)
                         return await prisma.gameSession.findUnique({
                             where: { id: gameSession.id },
                             select: { // SAME SELECT AS ABOVE
                                id: true,
                                gameCode: true,
                                status: true,
                                gameMode: true,
                                currentCardIndex: true,
                                lastCardStartedAt: true,
                                shuffledCardIds: true,
                                roundStatus: true,
                                lastTurnResult: true,
                                players: {
                                    select: {
                                        id: true,
                                        nickname: true,
                                        score: true,
                                        teamId: true,
                                        team: { select: { id: true, name: true, color: true, budget: true, electionStatus: true, runoffCandidates: true, runoffCount: true } },
                                        isLeader: true,
                                        isConnected: true
                                    }
                                },
                                teams: {
                                    select: {
                                        id: true,
                                        name: true,
                                        color: true,
                                        budget: true,
                                        baseValue: true,
                                        order: true,
                                        electionStatus: true,
                                        runoffCandidates: true,
                                        runoffCount: true
                                    },
                                    orderBy: { order: 'asc' }
                                },
                                categories: {
                                    select: {
                                        category: {
                                            select: {
                                                cards: {
                                                    where: { status: 'Active', isArchived: false },
                                                    select: { id: true },
                                                    orderBy: { id: 'asc' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                         });
                    }
                }
            }
            // ---------------------------

            // Prepare response based on game status
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const data: any = {
                status: gameSession.status,
                gameMode: gameSession.gameMode,
                currentCardIndex: gameSession.currentCardIndex,
                lastCardStartedAt: gameSession.lastCardStartedAt,
                players: gameSession.players,
                teams: gameSession.teams,
                roundStatus: gameSession.roundStatus,
                lastTurnResult: gameSession.lastTurnResult,
            };

            // If game is in progress, fetch ONLY the current card
            if (gameSession.status === GameStatus.IN_PROGRESS) {
                let currentCardId: number | null = null;

                // Use shuffledCardIds to determine current card
                if (gameSession.shuffledCardIds && gameSession.shuffledCardIds.length > 0) {
                    currentCardId = gameSession.shuffledCardIds[gameSession.currentCardIndex % gameSession.shuffledCardIds.length];
                } else {
                    console.warn(`Game ${gameCode}: shuffledCardIds is empty, cannot determine current card`);
                }

                if (currentCardId) {
                    // Fetch full details for the current card
                    const currentCard = await prisma.card.findUnique({
                        where: { id: currentCardId },
                        select: {
                            id: true,
                            title: true,
                            description: true,
                            timeLimit: true,
                            category: {
                                select: {
                                    name: true,
                                    color: true,
                                    colorPreset: {
                                        select: {
                                            backgroundColor: true,
                                            textColor: true,
                                            textBoxColor: true
                                        }
                                    }
                                }
                            },
                            cardResponses: {
                                select: {
                                    id: true,
                                    text: true,
                                    score: true,
                                    cost: true,
                                    politicalEffect: true,
                                    economicEffect: true,
                                    infrastructureEffect: true,
                                    societyEffect: true,
                                    environmentEffect: true
                                },
                                orderBy: {
                                    order: 'asc'
                                }
                            }
                        }
                    });

                    if (currentCard) {
                        data.cards = [{
                            id: currentCard.id,
                            title: currentCard.title,
                            description: currentCard.description,
                            timeLimit: currentCard.timeLimit,
                            // Defaults for legacy frontend support if needed or remove if frontend is updated
                            political: 0,
                            economic: 0,
                            infrastructure: 0,
                            society: 0,
                            environment: 0,
                            category: {
                                name: currentCard.category.name,
                                color: currentCard.category.color,
                                colorPreset: currentCard.category.colorPreset ? {
                                    backgroundColor: currentCard.category.colorPreset.backgroundColor,
                                    textColor: currentCard.category.colorPreset.textColor,
                                    textBoxColor: currentCard.category.colorPreset.textBoxColor
                                } : undefined
                            },
                            responses: currentCard.cardResponses.map((r) => ({
                                id: r.id,
                                text: r.text,
                                score: r.score,
                                cost: r.cost,
                                politicalEffect: r.politicalEffect,
                                economicEffect: r.economicEffect,
                                infrastructureEffect: r.infrastructureEffect,
                                societyEffect: r.societyEffect,
                                environmentEffect: r.environmentEffect
                            }))
                        }];
                    } else {
                        data.cards = [];
                    }
                } else {
                    data.cards = [];
                }
            }
            return data;
        }, 2); // 2 second cache

        if (!responseData) {
             return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(responseData);

    } catch (error) {
        console.error('Error fetching game status:', error);
        return NextResponse.json(
            {
                error: 'Failed to fetch game status',
                details: error instanceof Error ? error.message : String(error)
            },
            { status: 500 }
        );
    }
}

// Helper to resolve expired elections
// Returns true if state was modified
async function resolveElectionTimeout(gameSessionId: string, leaderElectionTimer: number, currentRound: number) {
    const teams = await prisma.team.findMany({
        where: {
            gameSessionId: gameSessionId,
            electionStatus: { in: ['OPEN', 'RUNOFF'] }
        },
        include: { players: true }
    });

    if (teams.length === 0) return false;

    let updated = false;
    let timerResetNeeded = false;

    for (const team of teams) {
        // Skip empty teams
        if (team.players.length === 0) continue;

        const votes = await prisma.leaderVote.findMany({
            where: {
                gameSessionId: gameSessionId,
                teamId: team.id,
                round: currentRound
            }
        });

        const voteCounts: Record<number, number> = {};
        votes.forEach(v => {
            voteCounts[v.candidateId] = (voteCounts[v.candidateId] || 0) + 1;
        });

        // Determine potential winners
        // If NO votes, pick random candidate from team
        let winners: number[] = [];
        if (votes.length === 0) {
            const randomIndex = Math.floor(Math.random() * team.players.length);
            winners = [team.players[randomIndex].id];
        } else {
            const maxVotes = Math.max(...Object.values(voteCounts));
            const candidateIds = Object.keys(voteCounts).map(Number);
            winners = candidateIds.filter(id => voteCounts[id] === maxVotes);

            // If runoff candidates exist, strictly limit to them?
            // Usually the logic handles it by filtering display, but backend should ideally respect it.
            // But if generic resolution, just taking max votes is fine.
        }

        // Resolution Logic
        if (team.electionStatus === 'OPEN') {
            if (winners.length > 1) {
                // TIE -> RUNOFF
                await prisma.team.update({
                    where: { id: team.id },
                    data: {
                        electionStatus: 'RUNOFF',
                        runoffCandidates: winners
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });

                // Clear votes for runoff
                await prisma.leaderVote.deleteMany({
                    where: {
                        gameSessionId: gameSessionId,
                        teamId: team.id,
                        round: currentRound
                    }
                });

                updated = true;
                timerResetNeeded = true; // Give time for runoff
            } else {
                // WINNER -> COMPLETED
                const winnerId = winners[0];
                await applyLeaderSelection(team.id, gameSessionId, winnerId, currentRound);
                updated = true;
            }
        } else if (team.electionStatus === 'RUNOFF') {
            // Updated Logic: If tie in runoff, CONTINUE runoff (don't pick random)
            if (winners.length > 1) {
                // TIE -> REPEAT RUNOFF
                await prisma.team.update({
                    where: { id: team.id },
                    data: {
                        electionStatus: 'RUNOFF',
                        runoffCandidates: winners, // Narrow down if possible
                        runoffCount: { increment: 1 }
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });

                // Clear votes for NEXT runoff attempt
                await prisma.leaderVote.deleteMany({
                    where: {
                        gameSessionId: gameSessionId,
                        teamId: team.id,
                        round: currentRound
                    }
                });

                updated = true;
                timerResetNeeded = true; // Reset timer for new attempt
            } else {
                // WINNER FOUND IN RUNOFF
                const finalWinnerId = winners[0];
                await applyLeaderSelection(team.id, gameSessionId, finalWinnerId, currentRound);
                updated = true;
                // No timer reset needed if we found a winner, logic below handles it
            }
        }
    }

    if (updated) {
        // If runoff triggered, reset timer
        if (timerResetNeeded) {
             await prisma.gameSession.update({
                where: { id: gameSessionId },
                data: { lastCardStartedAt: new Date() }
            });
        } else {
            // Check if ALL teams are done now
            const allTeams = await prisma.team.findMany({
                where: { gameSessionId: gameSessionId },
                include: { players: true }
            });

            const allDone = allTeams.every(t =>
                t.players.length === 0 || t.electionStatus === 'COMPLETED' || t.players.some(p => p.isLeader)
            );

            if (allDone) {
                 await prisma.gameSession.update({
                    where: { id: gameSessionId },
                    data: {
                        roundStatus: 'DECISION_PHASE',
                        lastCardStartedAt: new Date()
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    } as any
                });
            }
        }
    }

    return updated;
}

// Helper to commit leader selection
async function applyLeaderSelection(teamId: string, gameSessionId: string, leaderId: number, currentRound: number) {
     // Clear old leaders
     await prisma.player.updateMany({
        where: {
            teamId: teamId,
            gameSessionId: gameSessionId
        },
        data: { isLeader: false }
    });

    // Set new leader
    await prisma.player.update({
        where: { id: leaderId },
        data: { isLeader: true }
    });

    // Update team status
    await prisma.team.update({
        where: { id: teamId },
        data: {
            lastLeaderElectionRound: currentRound,
            electionStatus: 'COMPLETED',
            runoffCandidates: [], // Clear runoff candidates using empty array instead of JsonNull to avoid type issues if mapped
            runoffCount: 0
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any
    });
}

// Helper to resolve expired decision phases
async function resolveDecisionTimeout(gameSessionId: string, currentCardIndex: number, shuffledCardIds: number[]) {
    // 1. Identify current card
    if (!shuffledCardIds || shuffledCardIds.length === 0) return false;
    const cardId = shuffledCardIds[currentCardIndex % shuffledCardIds.length];

    // 2. Identify teams that haven't responded
    const teams = await prisma.team.findMany({
        where: { gameSessionId: gameSessionId },
        include: { players: { where: { isLeader: true } } }
    });

    if (teams.length === 0) return false;

    let updated = false;

    for (const team of teams) {
        // Find leader (or any player if no leader? Logic assumes leader exists by this phase)
        const leader = team.players[0]; // Should be isLeader=true
        if (!leader) continue;

        // Check if response exists
        const response = await prisma.playerResponse.findUnique({
            where: {
                playerId_cardId: {
                    playerId: leader.id,
                    cardId: cardId
                }
            }
        });

        if (!response) {
            console.log(`[Timeout] Auto-submitting for Team ${team.name} (Leader: ${leader.nickname})`);

            // AUTO-SUBMIT RANDOM RESPONSE
            // Fetch validation data
            const card = await prisma.card.findUnique({
                where: { id: cardId },
                include: { cardResponses: true }
            });

            if (card && card.cardResponses.length > 0) {
                // Pick random
                const randomResponse = card.cardResponses[Math.floor(Math.random() * card.cardResponses.length)];

                // Execute submission logic (replicated from submit/route.ts or could be factored out)
                // For simplicity/safety, we'll do the core transactional update here

                 const cost = randomResponse.cost || 0;
                 const baseValueChange = (randomResponse.politicalEffect || 0) +
                                  (randomResponse.economicEffect || 0) +
                                  (randomResponse.infrastructureEffect || 0) +
                                  (randomResponse.societyEffect || 0) +
                                  (randomResponse.environmentEffect || 0);

                const playerTurnScore = (team.baseValue || 0) + baseValueChange;
                const budgetChange = -cost;

                await prisma.$transaction(async (tx) => {
                     // 1. Record response
                     await tx.playerResponse.create({
                        data: {
                            playerId: leader.id,
                            cardId: cardId,
                            responseId: randomResponse.id
                        }
                    });

                    // 2. Apply effects
                    await tx.player.updateMany({
                        where: { teamId: team.id },
                        data: { score: { increment: playerTurnScore } }
                    });

                    await tx.team.update({
                        where: { id: team.id },
                        data: {
                            budget: { increment: budgetChange },
                            baseValue: { increment: baseValueChange }
                        }
                    });

                    // 3. Update Result History
                    const currentSession = await tx.gameSession.findUnique({
                        where: { id: gameSessionId },
                         // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        select: { lastTurnResult: true } as any
                    });

                     // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const currentResults = (currentSession?.lastTurnResult as any) || { teamScoreChanges: [] };

                    const newTeamResult = {
                        teamId: team.id,
                        teamName: team.name,
                        teamColor: team.color,
                        scoreChange: playerTurnScore,
                        baseValueChange: baseValueChange,
                        budgetChange: budgetChange,
                        selectedResponse: randomResponse.text + " (Auto-selected)",
                        impactDescription: randomResponse.impactDescription,
                        selectedResponseEffects: {
                            political: randomResponse.politicalEffect,
                            economic: randomResponse.economicEffect,
                            infrastructure: randomResponse.infrastructureEffect,
                            society: randomResponse.societyEffect,
                            environment: randomResponse.environmentEffect
                        }
                    };

                    const updatedResults = {
                        ...currentResults,
                        teamScoreChanges: [...(currentResults.teamScoreChanges || []), newTeamResult]
                    };

                    await tx.gameSession.update({
                        where: { id: gameSessionId },
                        data: {
                             // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            lastTurnResult: updatedResults as any
                        } as any
                    });
                });

                updated = true;
            }
        }
    }

    if (updated) {
        // Check if ALL teams have now responded
        // Actually, since we loop through ALL teams above and ensure a response,
        // after this loop, ALL teams MUST have a response (either existing or auto-submitted).
        // So we can safely transition.

        await prisma.gameSession.update({
            where: { id: gameSessionId },
            data: {
                roundStatus: 'RESULTS_PHASE'
            }
        });

        // Trigger generic update event if possible?
        // The frontend polling will pick up the status change next tick.
    }

    return updated;
}
