import React, { useState, useEffect, useMemo } from 'react'
import { Crown, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import PageTransition from '@/components/ui/PageTransition'

interface Player {
    id: number
    nickname: string
    isLeader: boolean
}

interface LeaderElectionViewProps {
    teamPlayers: Player[]
    currentPlayerId: number
    teamColor: string
    teamName: string
    onVote: (candidateId: number) => Promise<void>
    hasVoted: boolean
    currentLeader?: Player | null
    electionStatus?: 'OPEN' | 'RUNOFF' | 'COMPLETED'
    runoffCandidates?: number[]
    timerDuration?: number
}

export const LeaderElectionView: React.FC<LeaderElectionViewProps> = ({
    teamPlayers,
    currentPlayerId,
    teamColor,
    teamName,
    onVote,
    hasVoted,
    currentLeader,
    electionStatus = 'OPEN',
    runoffCandidates = [],
    timerDuration = 60
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState(timerDuration)
    const autoVoteAttempted = React.useRef(false);

    // Timer Logic
    useEffect(() => {
        setTimeLeft(timerDuration);

        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [timerDuration, electionStatus]);

    // Auto-vote on Timeout
    useEffect(() => {
        if (timeLeft === 0 && !hasVoted && !isSubmitting) {
            // Auto-vote for self if possible, otherwise random
            // If in runoff, vote for first candidate
            let candidateId = currentPlayerId;

            if (electionStatus === 'RUNOFF' && runoffCandidates && runoffCandidates.length > 0) {
                candidateId = runoffCandidates[0]; // Vote for first runoff candidate
            } else if (!teamPlayers.some(p => p.id === candidateId)) {
                // If current player isn't in lista (weird), pick first available
                if (teamPlayers.length > 0) candidateId = teamPlayers[0].id;
            }

            console.log("Timer expired, auto-voting for:", candidateId);
            handleVote(candidateId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, hasVoted, isSubmitting, currentPlayerId, electionStatus, runoffCandidates]);

    // Filter candidates for Runoff
    const displayPlayers = useMemo(() => {
        if (electionStatus === 'RUNOFF' && runoffCandidates && runoffCandidates.length > 0) {
            return teamPlayers.filter(p => runoffCandidates.includes(p.id));
        }
        return teamPlayers;
    }, [teamPlayers, electionStatus, runoffCandidates]);

    // Auto-vote for solo players
    useEffect(() => {
        if (teamPlayers.length === 1 && teamPlayers[0].id === currentPlayerId && !hasVoted && !isSubmitting && !autoVoteAttempted.current) {
            autoVoteAttempted.current = true;
            handleVote(currentPlayerId);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [teamPlayers.length, currentPlayerId, hasVoted, isSubmitting]);

    const handleVote = async (candidateId: number) => {
        if (hasVoted || isSubmitting) return

        setSelectedCandidate(candidateId)
        setIsSubmitting(true)

        try {
            await onVote(candidateId)
        } catch (error) {
            console.error('Error voting for leader:', error)
            setSelectedCandidate(null)
        } finally {
            setIsSubmitting(false)
        }
    }

    // RENDER: COMPLETED STATE (Waiting for other teams)
    if (electionStatus === 'COMPLETED') {
        return (
            <PageTransition>
                <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] p-4 sm:p-8 flex items-center justify-center font-sans transition-colors duration-300">
                    <div className="text-center">
                        {/* Header Logo */}
                        <div className="flex flex-col items-center gap-2 mb-16">
                            <h2 className="text-3xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                            {/* 5 Color bar with border */}
                            <div className="flex -space-x-0.5 border-2 border-[#333] dark:border-[#FDFBF7] px-2 py-1 rounded-full bg-transparent items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] z-0"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937] z-10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3] z-20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936] z-30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F44336] z-40"></div>
                            </div>
                        </div>

                        <h2 className="text-5xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-4">Leader Elected</h2>

                        {currentLeader && (
                            <div className="bg-white dark:bg-[#FDFBF7] border-[4px] border-[#333] dark:border-[#FDFBF7] rounded-xl p-8 max-w-md mx-auto mb-8 shadow-lg">
                                <div className="text-xl font-bold uppercase tracking-widest mb-2" style={{ color: teamColor }}>{teamName}</div>
                                <div className="text-4xl font-serif font-bold text-[#333]">{currentLeader.nickname}</div>
                                <div className="text-sm text-[#666] font-medium mt-2">Representative</div>
                            </div>
                        )}

                        <div className="flex items-center justify-center gap-2 text-[#666] dark:text-[#FDFBF7]/70 animate-pulse">
                            <Loader2 className="animate-spin" size={20} />
                            <span className="font-bold uppercase tracking-wider">Waiting for other teams...</span>
                        </div>
                    </div>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] p-4 sm:p-8 flex flex-col items-center font-sans relative overflow-hidden transition-colors duration-300">

                {/* Header Logo */}
                <div className="mt-8 mb-12 flex flex-col items-center gap-2">
                    <h2 className="text-3xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-0.5 border-2 border-[#333] dark:border-[#FDFBF7] px-2 py-1 rounded-full bg-transparent items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] z-0"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937] z-10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3] z-20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936] z-30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F44336] z-40"></div>
                    </div>
                </div>

                <div className="w-full max-w-3xl text-center relative z-10">
                    {/* Title */}
                    <div className="mb-12">
                        <h1 className="text-6xl md:text-8xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-4 tracking-tight leading-none">
                            {electionStatus === 'RUNOFF' ? 'Tie Breaker' : 'Cast Your Vote'}
                        </h1>
                        <p className="text-lg md:text-2xl text-[#555] dark:text-[#FDFBF7]/80 font-medium font-sans">
                            {electionStatus === 'RUNOFF'
                                ? 'Voting ended in a tie. Re-vote for one of the top candidates!'
                                : 'Elect your leader for 3 rounds (1 term)'}
                        </p>
                    </div>

                    {/* Timer */}
                    {/* Show a subtle timer - maybe top right or just numbers? */}
                    <div className="absolute top-0 right-0 md:right-[-2rem] md:top-[-1rem]">
                        <div className={`
                             text-4xl font-black font-serif italic
                             ${timeLeft < 10 ? 'text-red-500 animate-pulse' : 'text-[#333]/20 dark:text-[#FDFBF7]/20'}
                         `}>
                            {timeLeft}s
                        </div>
                    </div>

                    {/* Status Messages */}
                    {hasVoted && (
                        <div className="mb-8 inline-flex items-center gap-2 bg-[#333] dark:bg-[#FDFBF7] text-white dark:text-[#333] px-6 py-2 rounded-full shadow-lg">
                            <CheckCircle size={20} />
                            <span className="font-bold uppercase tracking-wider text-sm">Vote Recorded</span>
                        </div>
                    )}

                    {/* Candidate Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        {displayPlayers.map((player, index) => {
                            const isSelected = selectedCandidate === player.id

                            return (
                                <motion.button
                                    key={player.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleVote(player.id)}
                                    disabled={hasVoted || isSubmitting}
                                    className={`
                                        relative group p-6 rounded-xl border-[3px] transition-all duration-300 bg-white dark:bg-[#FDFBF7]
                                        ${hasVoted
                                            ? 'opacity-60 cursor-not-allowed border-[#ddd] dark:border-[#3E3E3C]/20'
                                            : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                                        }
                                        ${isSelected
                                            ? 'border-[#333] dark:border-[#3E3E3C] bg-[#f0f0f0] dark:bg-white shadow-none ring-2 ring-[#333] ring-offset-2'
                                            : 'border-[#ddd] dark:border-transparent hover:border-[#333] dark:hover:border-[#3E3E3C]'
                                        }
                                    `}
                                >
                                    <div className="flex flex-col items-center gap-3">
                                        {/* Avatar Placeholder */}
                                        <div className="w-16 h-16 rounded-full bg-[#eee] flex items-center justify-center text-2xl font-serif italic font-bold text-[#333]">
                                            {player.nickname.charAt(0)}
                                        </div>

                                        <div>
                                            <div className="text-xl font-bold text-[#333] font-serif italic">
                                                {player.nickname} {player.id === currentPlayerId && '(You)'}
                                            </div>
                                            {player.isLeader && electionStatus !== 'RUNOFF' && (
                                                <div className="text-xs font-bold text-[#D97706] uppercase tracking-wider mt-1 flex items-center justify-center gap-1">
                                                    <Crown size={12} /> Incumbent
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute top-3 right-3 text-green-600">
                                            <CheckCircle size={24} />
                                        </div>
                                    )}
                                </motion.button>
                            )
                        })}
                    </div>

                    {/* Solo Player State */}
                    {teamPlayers.length === 1 && teamPlayers[0].id === currentPlayerId && (
                        <div className="mt-8 text-[#666] dark:text-[#FDFBF7]/60 font-medium">
                            <Loader2 className="animate-spin inline-block mr-2" size={16} />
                            Auto-selecting you as leader...
                        </div>
                    )}

                </div>
            </div>
        </PageTransition>
    )
}
