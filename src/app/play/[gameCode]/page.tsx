"use client"
import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, User, Gamepad2, AlertTriangle, Clock, CheckCircle } from 'lucide-react'
import { useGamePolling } from '@/hooks/useGamePolling'
import PageTransition, { StaggerContainer, StaggerItem } from '@/components/ui/PageTransition'
import ConfettiEffect, { CelebrationBanner } from '@/components/ui/ConfettiEffect'
import { motion, AnimatePresence } from 'framer-motion'

interface Team {
    id: string;
    name: string;
    color: string;
    budget: number;
}

interface GameState {
    id: string
    gameCode: string
    status: 'WAITING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED'
    currentCardIndex: number
    cards?: GameCard[]
    players?: Player[]
    teams?: Team[]
    lastCardStartedAt?: string | null
}

import { CrisisCard } from '@/components/game/CrisisCard'
import { GameInstructions } from '@/components/game/GameInstructions'
import { LobbyView } from '@/components/game/LobbyView'
import { LeaveGameModal } from '@/components/game/LeaveGameModal'
import { ResultsModal } from '@/components/game/ResultsModal'
import { RoundIndicator } from '@/components/game/RoundIndicator'

interface GameCard {
    id: number;
    title: string;
    description: string;
    timeLimit: number | null;
    political: number;
    economic: number;
    infrastructure: number;
    society: number;
    environment: number;
    category: {
        name: string;
        color: string;
        colorPreset?: {
            backgroundColor: string;
            textColor: string;
            textBoxColor: string;
        };
    };
    responses: CardResponse[];
}

interface CardResponse {
    id: number;
    text: string;
    score?: number;
    politicalEffect?: number;
    economicEffect?: number;
    infrastructureEffect?: number;
    societyEffect?: number;
    environmentEffect?: number;
}

interface Player {
    id: number;
    nickname: string;
    teamId?: string | null;
    score: number;
    isLeader: boolean;
}

interface GameResults {
    gameName: string;
    gameCode: string;
    winnerTeamId: string | null; // null for tie
    teams: Array<{
        id: string;
        name: string;
        color: string;
        score: number;
        players: Array<{ id: number; nickname: string; responsesCount: number }>;
    }>;
}

const GameLobbyPage = () => {
    const params = useParams()
    const router = useRouter()
    const gameCode = params.gameCode as string

    const [nickname, setNickname] = useState('')
    const [gameState, setGameState] = useState<GameState | null>(null)
    const [loading, setLoading] = useState(true)
    const [selectedResponse, setSelectedResponse] = useState<number | null>(null)
    const [timeLeft, setTimeLeft] = useState<number>(30)
    const [gameResults, setGameResults] = useState<GameResults | null>(null)

    const [team, setTeam] = useState<Team | null>(null)
    const [joiningTeam, setJoiningTeam] = useState(false)
    const [isLeader, setIsLeader] = useState(false)
    const [votes, setVotes] = useState<Record<number, number>>({})
    const [showLeaveModal, setShowLeaveModal] = useState(false)
    const [showInstructions, setShowInstructions] = useState(false)

    // Results modal state
    const [showResultsModal, setShowResultsModal] = useState(false)
    const [previousTeamScores, setPreviousTeamScores] = useState<Record<string, number>>({})
    const [teamScoreChanges, setTeamScoreChanges] = useState<Record<string, number>>({})
    const [selectedResponseText, setSelectedResponseText] = useState<string>('')

    useEffect(() => {
        // Retrieve player info from session
        const storedNickname = localStorage.getItem('currentNickname')
        const storedPlayerId = localStorage.getItem('currentPlayerId')

        if (!storedNickname || !storedPlayerId) {
            // If no session, redirect back to join page
            router.push('/play')
            return
        }

        // Validate that the player still exists in the database
        const validatePlayer = async () => {
            try {
                const res = await fetch(`/api/game/${gameCode}/validate-player?playerId=${storedPlayerId}`);
                if (!res.ok) {
                    // Player doesn't exist anymore, clear session and redirect
                    localStorage.removeItem('currentPlayerId');
                    localStorage.removeItem('currentNickname');
                    // Team is now derived from player data, not stored separately
                    router.push(`/play?code=${gameCode}&error=session_expired`);
                    return false;
                }
                const data = await res.json();
                setIsLeader(data.isLeader || false);
                return true;
            } catch (error) {
                console.error('Error validating player:', error);
                return false;
            }
        };

        const initializePlayer = async () => {
            const isValid = await validatePlayer();
            if (!isValid) return;

            setNickname(storedNickname);
            setLoading(false);
        };

        initializePlayer();
    }, [router, gameCode])

    // Polling for game status and votes
    const fetchGameStatusAndVotes = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/game/${gameCode}`)
            if (res.ok) {
                const data = await res.json()
                setGameState(data)

                // Update isLeader status and team from FRESH data (not stale gameState)
                if (data?.players && data?.teams) {
                    const storedPlayerId = localStorage.getItem('currentPlayerId');
                    if (storedPlayerId) {
                        const currentPlayer = data.players.find((p: any) => p.id === parseInt(storedPlayerId));
                        if (currentPlayer) {
                            setIsLeader(currentPlayer.isLeader);

                            // Update current team object
                            if (currentPlayer.teamId) {
                                const currentTeam = data.teams.find((t: any) => t.id === currentPlayer.teamId);
                                if (currentTeam) {
                                    setTeam(currentTeam);
                                }
                            } else {
                                setTeam(null);
                            }

                            // Poll for votes if leader (using fresh data)
                            if (currentPlayer.isLeader && data.status === 'IN_PROGRESS' && data.cards && data.cards.length > 0) {
                                const currentCard = data.cards[data.currentCardIndex % data.cards.length];
                                fetch(`/api/game/${gameCode}/votes?playerId=${storedPlayerId}&cardId=${currentCard.id}`)
                                    .then(res => res.json())
                                    .then(voteData => setVotes(voteData))
                                    .catch(err => console.error('Error fetching votes:', err));
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching game status:', error)
        }
    }, [gameCode]);

    // Use the custom polling hook
    // Poll faster (1s) when game is in progress, slower (3s) otherwise
    const pollInterval = gameState?.status === 'IN_PROGRESS' ? 1000 : 3000;

    useGamePolling({
        interval: pollInterval,
        enabled: true,
        onPoll: fetchGameStatusAndVotes
    });

    // Auto-advance when both team leaders have made their decisions
    const hasAdvancedRef = React.useRef<boolean>(false);

    useEffect(() => {
        const checkBothLeadersResponded = async () => {
            if (gameState?.status !== 'IN_PROGRESS' || !gameState?.cards || !gameState?.players) return;

            const currentCard = gameState.cards[gameState.currentCardIndex % gameState.cards.length];
            if (!currentCard) return;

            // Reset the flag when card changes
            if (gameState.currentCardIndex !== lastCardIndexRef.current) {
                hasAdvancedRef.current = false;
            }

            // Don't advance if we've already triggered advancement for this card
            if (hasAdvancedRef.current) return;

            try {
                // Check if both team leaders have responded
                const res = await fetch(`/api/game/${gameCode}/check-leaders-responded?cardId=${currentCard.id}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.bothLeadersResponded && !hasAdvancedRef.current) {
                        // Mark that we've triggered advancement
                        hasAdvancedRef.current = true;

                        // Advance to next card
                        await fetch(`/api/game/${gameCode}/next`, { method: 'POST' });
                    }
                }
            } catch (error) {
                console.error('Error checking leaders response:', error);
            }
        };

        checkBothLeadersResponded();
    }, [gameCode, gameState?.status, gameState?.currentCardIndex, gameState?.cards, gameState?.players]);

    // Fetch player team separately or check if we can get it from somewhere
    // For now, let's assume we need to check if the player has a team
    // We can add a check in the game status or a separate call
    // Or we can just check local state if we persist it

    // Let's add a check for team
    // Team check is now handled in fetchGameStatusAndVotes

    // Fetch results when game is completed
    useEffect(() => {
        if (gameState?.status === 'COMPLETED' && !gameResults) {
            const fetchResults = async () => {
                try {
                    const res = await fetch(`/api/game/${gameCode}/results`);
                    if (res.ok) {
                        const data = await res.json();
                        setGameResults(data);
                    }
                } catch (error) {
                    console.error('Error fetching results:', error);
                }
            };
            fetchResults();
        }
    }, [gameState?.status, gameCode, gameResults]);

    // Team selection is now handled by admin
    // const handleSelectTeam = ... (removed)

    const handleLeaveGame = async () => {
        // Close modal
        setShowLeaveModal(false);

        try {
            const storedPlayerId = localStorage.getItem('currentPlayerId');
            if (storedPlayerId) {
                // Use sendBeacon for reliable delivery on unload
                const data = JSON.stringify({ playerId: storedPlayerId });
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(`/api/game/${gameCode}/leave`, blob);
            }
        } catch (error) {
            console.error('Error leaving game:', error);
        } finally {
            localStorage.removeItem('currentPlayerId');
            localStorage.removeItem('currentNickname');
            router.push('/play');
        }
    };

    // Handle browser refresh/close
    useEffect(() => {
        const handleBeforeUnload = () => {
            const storedPlayerId = localStorage.getItem('currentPlayerId');
            if (storedPlayerId) {
                const data = JSON.stringify({ playerId: storedPlayerId });
                const blob = new Blob([data], { type: 'application/json' });
                navigator.sendBeacon(`/api/game/${gameCode}/leave`, blob);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [gameCode]);

    // We need a ref to track the last card index to prevent resetting timer on every poll if index hasn't changed
    const lastCardIndexRef = React.useRef<number>(-1);
    const timerRef = React.useRef<NodeJS.Timeout | null>(null);

    // Check if player has already responded to the current card
    const checkExistingResponse = React.useCallback(async () => {
        const playerId = localStorage.getItem('currentPlayerId');
        const currentCard = gameState?.cards?.[gameState?.currentCardIndex % (gameState?.cards?.length || 1)];

        if (!playerId || !currentCard || !gameState) return;

        try {
            const res = await fetch(`/api/game/${gameCode}/check-response?playerId=${playerId}&cardId=${currentCard.id}`);
            if (res.ok) {
                const data = await res.json();
                if (data.hasResponded) {
                    setSelectedResponse(data.responseId);
                }
            }
        } catch (error) {
            console.error('Error checking existing response:', error);
        }
    }, [gameCode, gameState]);

    // Track score changes and show results modal
    const previousCardIndexRef = React.useRef<number>(-1);

    useEffect(() => {
        const checkAndShowScoreChanges = async () => {
            if (gameState?.status === 'IN_PROGRESS' && gameState?.teams) {
                // Create a map of current team scores
                const currentTeamScores: Record<string, number> = {};
                gameState.teams.forEach(t => {
                    currentTeamScores[t.id] = t.budget; // Using budget as score for now, or we can add score to team model
                });

                // Check if card index changed (new card)
                if (gameState.currentCardIndex !== previousCardIndexRef.current && previousCardIndexRef.current !== -1) {
                    console.log('Card changed! Waiting for score update...', {
                        previousIndex: previousCardIndexRef.current,
                        currentIndex: gameState.currentCardIndex
                    });

                    // Wait and poll for updated scores
                    setTimeout(async () => {
                        try {
                            // Fetch fresh game state
                            const res = await fetch(`/api/game/${gameCode}`);
                            if (res.ok) {
                                const freshData = await res.json();

                                const updatedTeamScores: Record<string, number> = {};
                                const scoreChanges: Record<string, number> = {};

                                if (freshData.teams) {
                                    freshData.teams.forEach((t: Team) => {
                                        updatedTeamScores[t.id] = t.budget;
                                        scoreChanges[t.id] = t.budget - (previousTeamScores[t.id] || 0);
                                    });
                                }

                                // Get the response text from the previous card
                                const previousCard = gameState.cards?.[previousCardIndexRef.current % (gameState.cards?.length || 1)];
                                if (previousCard && selectedResponse !== null) {
                                    const response = previousCard.responses.find(r => r.id === selectedResponse);
                                    if (response) {
                                        setSelectedResponseText(response.text);
                                    }
                                }

                                // Always show modal when card changes
                                setTeamScoreChanges(scoreChanges);
                                setShowResultsModal(true);

                                // Update previous scores
                                setPreviousTeamScores(updatedTeamScores);
                            }
                        } catch (error) {
                            console.error('Error fetching updated scores:', error);
                        }
                    }, 1000); // Wait 1 second for backend to process and update scores

                    previousCardIndexRef.current = gameState.currentCardIndex;
                } else if (previousCardIndexRef.current === -1) {
                    // First time initialization
                    setPreviousTeamScores(currentTeamScores);
                    previousCardIndexRef.current = gameState.currentCardIndex;
                }
            }
        };

        checkAndShowScoreChanges();
    }, [gameState?.currentCardIndex, gameState?.teams, gameState?.status, gameState?.cards, selectedResponse, previousTeamScores, gameCode]);

    useEffect(() => {
        if (gameState?.lastCardStartedAt && gameState?.cards) {
            const currentCard = gameState.cards[gameState.currentCardIndex % gameState.cards.length];
            if (currentCard) {
                const startTime = new Date(gameState.lastCardStartedAt).getTime();
                const now = new Date().getTime();
                const timeLimitSeconds = (currentCard.timeLimit || 5) * 60;
                const elapsedSeconds = Math.floor((now - startTime) / 1000);
                const remaining = Math.max(0, timeLimitSeconds - elapsedSeconds);

                setTimeLeft(remaining);

                // If new card, reset selection and check for existing response
                if (gameState.currentCardIndex !== lastCardIndexRef.current) {
                    setSelectedResponse(null);
                    lastCardIndexRef.current = gameState.currentCardIndex;

                    // Check if player has already responded to this card
                    checkExistingResponse();
                }
            }
        }
    }, [gameState?.currentCardIndex, gameState?.cards, gameState?.lastCardStartedAt, checkExistingResponse]);

    useEffect(() => {
        if (gameState?.status === 'IN_PROGRESS') {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Auto-advance when timer hits 0
                        // Only the host should trigger this ideally, but for now any client can trigger it safely
                        // We'll add a check to prevent multiple calls
                        if (prev === 1) {
                            fetch(`/api/game/${gameCode}/next`, { method: 'POST' })
                                .catch(err => console.error('Auto-advance failed', err));
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [gameState?.status, gameCode]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (loading || !gameState) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <Loader2 className="animate-spin text-black dark:text-white" size={48} />
            </div>
        )
    }

    // GAME RESULTS SCREEN
    if (gameState.status === 'COMPLETED' && gameResults) {
        const winnerTeam = gameResults.teams.find(t => t.id === gameResults.winnerTeamId);
        const winnerText = winnerTeam ? `${winnerTeam.name} Wins!` : 'It\'s a Tie!';
        const winnerColor = winnerTeam ? winnerTeam.color : '#808080';

        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 flex items-center justify-center">
                <div className="max-w-4xl w-full">
                    {/* Winner Banner */}
                    <div className="border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 mb-6" style={{ backgroundColor: winnerColor }}>
                        <h1 className="text-5xl font-black text-white text-center uppercase mb-4">
                            🏆 {winnerText} 🏆
                        </h1>
                        <div className="flex justify-center gap-8 text-white flex-wrap">
                            {gameResults.teams.map((team, idx) => (
                                <React.Fragment key={team.id}>
                                    <div className="text-center">
                                        <div className="text-6xl font-black">{team.score}</div>
                                        <div className="text-xl font-bold">{team.name}</div>
                                    </div>
                                    {idx < gameResults.teams.length - 1 && (
                                        <div className="text-6xl font-black self-center">-</div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>

                    {/* Team Lists */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {gameResults.teams.map(team => (
                            <div key={team.id} className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6">
                                <h2 className="text-2xl font-black mb-4 flex items-center gap-2" style={{ color: team.color }}>
                                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: team.color }}></div>
                                    {team.name}
                                </h2>
                                <div className="space-y-2">
                                    {team.players.map((player, idx) => (
                                        <div key={player.id} className="flex justify-between items-center p-3 rounded-lg border-2" style={{ borderColor: `${team.color}40`, backgroundColor: `${team.color}10` }}>
                                            <span className="font-bold">#{idx + 1} {player.nickname}</span>
                                            <span className="text-sm text-white px-3 py-1 rounded-full font-bold" style={{ backgroundColor: team.color }}>
                                                {player.responsesCount} responses
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Game Info */}
                    <div className="mt-6 text-center text-gray-600 dark:text-gray-400">
                        <p className="font-bold">Game: {gameResults.gameName}</p>
                        <p>Code: {gameResults.gameCode}</p>
                    </div>

                    {/* All Participants */}
                    <div className="mt-8 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <h2 className="text-2xl font-black text-center mb-6 flex items-center justify-center gap-2 text-black dark:text-white">
                            <User size={28} />
                            All Participants
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {gameResults.teams.flatMap(t => t.players.map(p => ({ ...p, team: t })))
                                .sort((a, b) => b.responsesCount - a.responsesCount)
                                .map((player, idx) => (
                                    <div
                                        key={player.id}
                                        className="p-3 rounded-lg border-2"
                                        style={{
                                            borderColor: `${player.team.color}40`,
                                            backgroundColor: `${player.team.color}10`
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-gray-500">#{idx + 1}</span>
                                                <span className="font-bold text-gray-900 dark:text-gray-100">{player.nickname}</span>
                                            </div>
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: player.team.color }} />
                                        </div>
                                        <div className="mt-2 text-sm text-gray-700 dark:text-gray-300 font-medium">
                                            {player.responsesCount} responses
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </div>

                    {/* Join Another Game Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={() => {
                                localStorage.removeItem('currentPlayerId');
                                localStorage.removeItem('currentNickname');
                                // Team is now derived
                                router.push('/play');
                            }}
                            className="px-8 py-4 bg-green-500 text-white font-black text-xl rounded-lg border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-200 flex items-center gap-3 mx-auto"
                        >
                            <Gamepad2 size={28} />
                            Join Another Game
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Show lobby for all players in WAITING status (whether assigned to team or not)
    // This allows unassigned players to see who else has joined while waiting for team assignment

    // WAITING STATE
    if (gameState.status === 'WAITING') {
        const teammates = team ? (gameState.players?.filter(p => p.teamId === team.id) || []) : [];

        return (
            <PageTransition>
                <LobbyView
                    gameCode={gameCode}
                    nickname={nickname}
                    team={team}
                    teammates={teammates}
                    allPlayers={gameState.players || []}
                    teams={gameState.teams || []}
                    onLeaveGame={() => setShowLeaveModal(true)}
                />
                {/* Leave Game Modal */}
                <LeaveGameModal
                    isOpen={showLeaveModal}
                    onClose={() => setShowLeaveModal(false)}
                    onConfirm={handleLeaveGame}
                />
            </PageTransition>
        )
    }

    // IN PROGRESS STATE
    if (gameState.status === 'IN_PROGRESS' && gameState.cards && gameState.cards.length > 0) {
        const currentCard = gameState.cards[gameState.currentCardIndex % gameState.cards.length];

        return (
            <div className="min-h-screen bg-gray-900 p-4 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Background Effects */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-gray-800 to-transparent opacity-50 pointer-events-none"></div>

                <div className="w-full max-w-4xl relative z-10">
                    {/* Game Header with Scores */}
                    <div className="flex items-center justify-center gap-4 mb-8 flex-wrap">
                        {gameState.teams?.map(t => (
                            <div key={t.id} className="flex flex-col items-center">
                                <div className="text-white font-black text-2xl px-6 py-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,0.3)] border-2" style={{ backgroundColor: t.color, borderColor: t.color }}>
                                    ${t.budget}
                                </div>
                                <span className="font-bold text-xs mt-1 tracking-widest uppercase" style={{ color: t.color }}>{t.name}</span>
                            </div>
                        ))}

                        {/* Timer */}
                        <div className="flex flex-col items-center gap-2 mx-4">
                            <div className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 transition-all duration-300 ${timeLeft <= 10 ? 'bg-red-600 border-red-400 animate-pulse' : 'bg-gray-800 border-gray-600'}`}>
                                <Clock size={20} className={timeLeft <= 10 ? 'text-white' : 'text-gray-400'} />
                                <span className="font-mono font-black text-xl text-white">{formatTime(timeLeft)}</span>
                            </div>
                        </div>

                        {/* Round Progress Indicator */}
                        <RoundIndicator
                            currentRound={Math.floor(gameState.currentCardIndex / 3) + 1}
                            currentCardIndex={gameState.currentCardIndex}
                            cardsPerRound={3}
                        />
                    </div>

                    {/* Leader Indicator */}
                    {isLeader && (
                        <div className="mb-6 flex justify-center">
                            <div className="flex items-center gap-2 bg-yellow-400 text-black px-4 py-1 rounded-full font-black text-sm border-2 border-yellow-200 shadow-lg animate-bounce">
                                <span>👑</span>
                                <span>YOU ARE THE LEADER</span>
                            </div>
                        </div>
                    )}

                    {/* Main Card Component */}
                    <div className="flex justify-center">
                        <CrisisCard
                            title={currentCard.title}
                            description={currentCard.description}
                            timeLimit={currentCard.timeLimit}
                            political={currentCard.political}
                            economic={currentCard.economic}
                            infrastructure={currentCard.infrastructure}
                            society={currentCard.society}
                            environment={currentCard.environment}
                            responses={currentCard.responses}
                            categoryName={currentCard.category.name}
                            categoryColor={currentCard.category.color}
                            colorPreset={currentCard.category.colorPreset}
                            selectedResponseId={selectedResponse}
                            onSelectResponse={(id) => {
                                // Logic to submit response
                                if (timeLeft === 0 || selectedResponse !== null) return;
                                setSelectedResponse(id);

                                // Submit logic duplicated here or extracted
                                const submitResponse = async (responseId: number) => {
                                    try {
                                        const playerId = localStorage.getItem('currentPlayerId');
                                        if (!playerId) return;

                                        await fetch(`/api/game/${gameCode}/submit`, {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                playerId,
                                                cardId: currentCard.id,
                                                responseId
                                            })
                                        });
                                    } catch (error) {
                                        console.error('Error submitting response:', error);
                                    }
                                };
                                submitResponse(id);
                            }}
                            disabled={timeLeft === 0 || selectedResponse !== null}
                            isLeader={isLeader}
                            votes={votes}
                            timeLeft={timeLeft}
                        />
                    </div>

                    {/* Status Messages */}
                    <div className="mt-8 text-center min-h-[60px]">
                        {!isLeader && !selectedResponse && (
                            <p className="text-gray-400 font-bold animate-pulse">
                                Vote to help your Leader decide!
                            </p>
                        )}
                        {selectedResponse && (
                            <p className="text-green-400 font-bold text-lg">
                                {isLeader ? "Decision Submitted!" : "Vote Cast! Waiting for Leader..."}
                            </p>
                        )}
                        {timeLeft === 0 && !selectedResponse && (
                            <p className="text-red-400 font-bold text-lg">Time&apos;s Up!</p>
                        )}
                    </div>

                    {/* Leave Game Button */}
                    <div className="mt-4 flex justify-center gap-4">
                        <button
                            onClick={() => setShowInstructions(true)}
                            className="text-xs font-bold text-blue-500 hover:text-blue-400 underline transition-colors"
                        >
                            How to Play
                        </button>
                        <button
                            onClick={() => setShowLeaveModal(true)}
                            className="text-xs font-bold text-gray-600 hover:text-red-400 underline transition-colors"
                        >
                            Leave Game
                        </button>
                    </div>

                    <GameInstructions
                        isOpen={showInstructions}
                        onClose={() => setShowInstructions(false)}
                    />

                    {/* Leave Game Modal */}
                    <LeaveGameModal
                        isOpen={showLeaveModal}
                        onClose={() => setShowLeaveModal(false)}
                        onConfirm={handleLeaveGame}
                    />

                    {/* Results Modal */}
                    <ResultsModal
                        isOpen={showResultsModal}
                        onClose={() => setShowResultsModal(false)}
                        teamScoreChanges={gameState?.teams?.map(t => ({
                            teamId: t.id,
                            teamName: t.name,
                            teamColor: t.color,
                            scoreChange: teamScoreChanges[t.id] || 0
                        })) || []}
                        selectedResponse={selectedResponseText}
                        autoCloseDelay={4000}
                    />
                </div>
            </div>
        );
    }

    return (
        <PageTransition>
            <ConfettiEffect trigger={gameState.status === 'COMPLETED' && gameResults !== null} variant="win" />
            {gameResults && gameResults.winnerTeamId && (
                <CelebrationBanner
                    message={`${gameResults.teams.find(t => t.id === gameResults.winnerTeamId)?.name || 'Winning Team'} WINS!`}
                    show={true}
                />
            )}
            {gameResults && !gameResults.winnerTeamId && (
                <CelebrationBanner
                    message="IT'S A TIE!"
                    show={true}
                />
            )}
            <div className="min-h-screen bg-gray-100 p-2 sm:p-4 md:p-6 flex items-center justify-center">
                <p className="text-xl font-bold text-gray-500">Loading game state...</p>
            </div>
        </PageTransition>
    )
}

export default GameLobbyPage
