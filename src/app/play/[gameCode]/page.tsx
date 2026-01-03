"use client"
import React from 'react';
import { useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameState } from '@/hooks/useGameState';
import { LobbyView } from '@/components/game/LobbyView';
import { LeaderElectionView } from '@/components/game/LeaderElectionView';
import { DecisionPhase } from '@/components/game/DecisionPhase';
import { GameResults } from '@/components/game/GameResults';
import { LeaveGameModal } from '@/components/game/LeaveGameModal';
import { ResultsModal } from '@/components/game/ResultsModal'; // Added import
import { gameService } from '@/services/gameService';
import PageTransition from '@/components/ui/PageTransition';

const GameLobbyPage = () => {
    const params = useParams();
    const gameCode = params.gameCode as string;

    // 1. Session Management Hook
    const {
        nickname,
        playerId,
        isLeader: sessionIsLeader,
        setIsLeader,
        loading: sessionLoading,
        leaveGame
    } = useGameSession(gameCode);

    // 2. Game State Hook
    const {
        gameState,
        team,
        votes,
        isLeader: polledIsLeader,
        mutate // Exposed mutate
    } = useGameState(gameCode, playerId);

    // Sync leader status from polling if valid
    React.useEffect(() => {
        if (polledIsLeader !== undefined) {
            setIsLeader(polledIsLeader);
        }
    }, [polledIsLeader, setIsLeader]);

    const [showLeaveModal, setShowLeaveModal] = React.useState(false);

    // COMBINED LOADING STATE
    if (sessionLoading || !gameState) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-black dark:text-white" size={48} />
            </div>
        );
    }

    // RENDER: GAME COMPLETED -> RESULTS
    if (gameState.status === 'COMPLETED') {
        return (
            <GameResults
                gameCode={gameCode}
                onJoinAnother={leaveGame}
            />
        );
    }

    // RENDER: WAITING -> LOBBY
    if (gameState.status === 'WAITING') {
        const teammates = team ? (gameState.players?.filter(p => p.teamId === team.id) || []) : [];

        return (
            <>
                <LobbyView
                    gameCode={gameCode}
                    nickname={nickname}
                    playerId={playerId}
                    team={team}
                    teammates={teammates}
                    allPlayers={gameState.players || []}
                    teams={gameState.teams || []}
                    onLeaveGame={() => setShowLeaveModal(true)}
                />
                <LeaveGameModal
                    isOpen={showLeaveModal}
                    onClose={() => setShowLeaveModal(false)}
                    onConfirm={leaveGame}
                />
            </>
        );
    }

    // RENDER: IN PROGRESS
    if (gameState.status === 'IN_PROGRESS' && gameState.cards && gameState.cards.length > 0) {

        // Handle Round Results
        if (gameState.roundStatus === 'RESULTS_PHASE') {
            // Get results from the backend storage (lastTurnResult)
            const { lastTurnResult } = gameState;

            const scoreChanges = lastTurnResult?.teamScoreChanges || [];

            // Find the result specific to the player's team to show relevant decision/impact
            const myTeamResult = scoreChanges.find(r => String(r.teamId) === String(team?.id));

            const selectedResponse = myTeamResult?.selectedResponse;
            const selectedEffects = myTeamResult?.selectedResponseEffects;
            const impactText = myTeamResult?.impactDescription;

            return (
                <>
                    {/* Render DecisionPhase as background context */}
                    <DecisionPhase
                        gameState={gameState}
                        playerId={playerId || 0}
                        nickname={nickname}
                        team={team}
                        isLeader={sessionIsLeader}
                        votes={votes}
                        gameCode={gameCode}
                    />
                    <ResultsModal
                        isOpen={true}
                        onClose={async () => {
                            await gameService.advanceGame(gameCode, gameState.currentCardIndex);
                            mutate();
                        }}
                        teamScoreChanges={scoreChanges}
                        selectedResponse={selectedResponse}
                        selectedResponseEffects={selectedEffects}
                        impactText={impactText}
                        autoCloseDelay={5000} // Increased delay to read text
                    />
                </>
            );
        }

        // A. LEADER ELECTION PHASE
        if (gameState.roundStatus === 'LEADER_ELECTION' && team) {
            const teamPlayers = gameState.players?.filter(p => p.teamId === team.id) || [];
            const currentLeader = teamPlayers.find(p => p.isLeader);

            return (
                <ViewWrapper
                    gameCode={gameCode}
                    roundStatus="LEADER_ELECTION"
                    currentCardIndex={gameState.currentCardIndex}
                    currentGameStatus={team.electionStatus}
                >
                    {({ hasVoted, setHasVoted }) => (
                        <LeaderElectionView
                            teamPlayers={teamPlayers.map(p => ({
                                id: p.id,
                                nickname: p.nickname,
                                isLeader: p.isLeader
                            }))}
                            currentPlayerId={playerId || 0}
                            teamColor={team.color}
                            teamName={team.name}
                            electionStatus={team.electionStatus}
                            runoffCandidates={team.runoffCandidates}
                            timerDuration={gameState.leaderElectionTimer || 60}
                            onVote={async (candidateId) => {
                                try {
                                    await gameService.voteForLeader(gameCode, playerId || 0, candidateId);
                                    setHasVoted(true);
                                } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                                    // With runoff logic, we might need to handle specific errors better,
                                    // but for now general error handling is fine.
                                    // If re-vote is needed, the backend resets 'hasVoted' implicitly by clearing votes,
                                    // but frontend state 'hasVoted' needs to be synced.
                                    // This is handled by 'ViewWrapper' resetting on round change,
                                    // BUT for runoff, round doesn't change.
                                    // We need to check if 'hasVoted' should be reset based on electionStatus change.
                                    if (err.message?.includes('already voted')) {
                                        setHasVoted(true);
                                    } else {
                                        throw err;
                                    }
                                }
                            }}
                            hasVoted={hasVoted}
                            // We need to allow resetting hasVoted if we enter Runoff state
                            // This will be handled inside LeaderElectionView or by a key change
                            currentLeader={currentLeader ? {
                                id: currentLeader.id,
                                nickname: currentLeader.nickname,
                                isLeader: currentLeader.isLeader
                            } : null}
                        />
                    )}
                </ViewWrapper>
            );
        }

        // B. DECISION PHASE
        return (
            <DecisionPhase
                gameState={gameState}
                playerId={playerId || 0}
                nickname={nickname}
                team={team}
                isLeader={sessionIsLeader}
                votes={votes}
                gameCode={gameCode}
            />
        );
    }

    // Fallback/Loading
    return (
        <div className="min-h-screen flex items-center justify-center text-white">
            Connecting to game...
        </div>
    );
};

// Helper component to manage view-specific local state (like "hasVoted") impacting re-renders only when needed
// and resetting when round changes
const ViewWrapper = ({
    children,
    gameCode,
    roundStatus,
    currentCardIndex,
    currentGameStatus
}: {
    children: (props: { hasVoted: boolean, setHasVoted: (v: boolean) => void }) => React.ReactNode,
    gameCode: string,
    roundStatus: string,
    currentCardIndex: number,
    currentGameStatus?: string
}) => {
    const [hasVoted, setHasVoted] = React.useState(false);

    React.useEffect(() => {
        setHasVoted(false);
    }, [roundStatus, currentCardIndex, gameCode, currentGameStatus]);

    return <>{children({ hasVoted, setHasVoted })}</>;
};

export default GameLobbyPage;
