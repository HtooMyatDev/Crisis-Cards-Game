import React, { useState, useEffect, useMemo } from 'react'
import { Crown, CheckCircle, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
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
    runoffCount?: number
    timerDuration?: number
    currentCardIndex?: number
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
    runoffCount = 0,
    timerDuration = 60,
    currentCardIndex = 0
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [timeLeft, setTimeLeft] = useState(timerDuration)
    const [showTransition, setShowTransition] = useState(true)
    const autoVoteAttempted = React.useRef(false);

    // Transition Logic
    useEffect(() => {
        // Only show "Term Ended" transition if it's an OPEN election AND not the very first one (currentCardIndex > 0)
        if (electionStatus === 'OPEN' && currentCardIndex > 0) {
            setShowTransition(true);
            const timer = setTimeout(() => setShowTransition(false), 2000);
            return () => clearTimeout(timer);
        } else {
            setShowTransition(false);
        }
    }, [electionStatus, currentCardIndex]);

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
            // Auto-vote for self if possible (User preferred old behavior)
            // If in runoff, likely forced to vote for first candidate or still valid logic needed?
            // Reverting to simpler "vote for self" or "vote for first available" if self not found.
            let candidateId = currentPlayerId;

            if (electionStatus === 'RUNOFF' && runoffCandidates && runoffCandidates.length > 0) {
                // If in runoff and I'm not in it, arguably I should vote for someone else?
                // But sticking to "old behavior" usually implies self-preservation or default.
                // If default behavior was "vote for self", let's try that.
                // If strictly "old behavior":
                if (!runoffCandidates.includes(currentPlayerId)) {
                    candidateId = runoffCandidates[0];
                }
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
                <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] p-4 sm:p-8 flex items-center justify-center font-sans transition-colors duration-300 relative overflow-hidden">
                    {/* Background - Light Mode */}
                    <img
                        src="/svg/light/background.svg"
                        alt=""
                        className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                        aria-hidden="true"
                    />
                    {/* Background - Dark Mode */}
                    <img
                        src="/svg/dark/background.svg"
                        alt=""
                        className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
                        aria-hidden="true"
                    />

                    <div className="text-center relative z-10 w-full max-w-lg mx-auto bg-white/40 dark:bg-black/20 p-8 rounded-3xl backdrop-blur-sm border border-black/5 dark:border-white/5">
                        <div className="flex flex-col items-center gap-4 mb-12">
                            <img src="/svg/light/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[60px] w-auto dark:hidden" />
                            <img src="/svg/dark/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[60px] w-auto hidden dark:block" />
                        </div>

                        <h2 className="text-5xl font-serif text-stone-700 dark:text-[#FDFBF7] mb-4">Leader Elected</h2>

                        {currentLeader && (
                            <div className="bg-white dark:bg-[#FDFBF7] border-[4px] border-stone-700 dark:border-[#FDFBF7] rounded-xl p-8 max-w-md mx-auto mb-8 shadow-lg">
                                <div className="text-xl font-bold uppercase tracking-widest mb-2" style={{ color: teamColor }}>{teamName}</div>
                                <div className="text-4xl font-serif font-bold text-stone-700">{currentLeader.nickname}</div>
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
            <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] flex flex-col items-center relative overflow-x-hidden transition-colors duration-300">
                {/* Background - Light Mode */}
                <img
                    src="/svg/light/background.svg"
                    alt=""
                    className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                    aria-hidden="true"
                />
                {/* Background - Dark Mode */}
                <img
                    src="/svg/dark/background.svg"
                    alt=""
                    className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
                    aria-hidden="true"
                />

                {/* Decorative Header Area */}
                <div className="relative w-full max-w-[1440px] h-auto flex flex-col items-center justify-start pt-12 sm:pt-20 pb-12 z-10">

                    <div className="flex flex-col items-center gap-4 mb-8">
                        <img src="/svg/light/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[80px] w-auto dark:hidden" />
                        <img src="/svg/dark/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[80px] w-auto hidden dark:block" />
                    </div>

                    {/* Main Title */}
                    <div className="text-center z-10 px-4">
                        <h1 className="text-6xl sm:text-7xl md:text-8xl font-black font-serif text-stone-700 leading-tight mb-4 tracking-tight">
                            {electionStatus === 'RUNOFF' ? `Tie Breaker ${runoffCount > 0 ? `#${runoffCount}` : ''}` : 'Cast Your Vote'}
                        </h1>
                        <p className="text-lg sm:text-2xl md:text-3xl text-stone-700 font-medium font-sans">
                            {electionStatus === 'RUNOFF'
                                ? 'Voting ended in a tie. Re-vote for one of the top candidates!'
                                : 'Elect your leader for 3 rounds (1 term)'}
                        </p>
                    </div>
                </div>


                {/* Content Area */}
                <div className="w-full max-w-5xl px-4 sm:px-8 pb-12 relative z-10 flex flex-col items-center">

                    <AnimatePresence>
                        {showTransition && electionStatus === 'OPEN' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm pointer-events-none"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    exit={{ scale: 1.1, opacity: 0 }}
                                    className="text-center"
                                >
                                    <h2 className="text-6xl font-serif text-[#FDFBF7] mb-2">Term Ended</h2>
                                    <p className="text-2xl text-[#FDFBF7]/80 font-sans uppercase tracking-widest">Election Time</p>
                                </motion.div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Timer - Positioned absolutely or integrated? Let's keep it clear but stylish */}
                    <div className="mb-8">
                        <div className={`
                             text-4xl font-black font-serif
                             ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-stone-300 dark:text-[#FDFBF7]/20'}
                         `}>
                            {timeLeft}s
                        </div>
                    </div>

                    {/* Status Messages */}
                    {hasVoted && (
                        <div className="mb-8 inline-flex items-center gap-2 bg-stone-800 dark:bg-[#FDFBF7] text-white dark:text-[#333] px-6 py-2 rounded-full shadow-lg">
                            <CheckCircle size={20} />
                            <span className="font-bold uppercase tracking-wider text-sm">Vote Recorded</span>
                        </div>
                    )}

                    {/* Candidate Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-4xl">
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
                                        flex flex-col items-center text-center
                                        ${hasVoted
                                            ? 'opacity-60 cursor-not-allowed border-[#ddd] dark:border-[#3E3E3C]/20'
                                            : 'cursor-pointer hover:-translate-y-1 hover:shadow-xl'
                                        }
                                        ${isSelected
                                            ? 'border-stone-800 dark:border-[#3E3E3C] bg-stone-50 dark:bg-white shadow-none ring-2 ring-stone-800 ring-offset-2'
                                            : 'border-[#ddd] dark:border-transparent hover:border-stone-600 dark:hover:border-[#3E3E3C]'
                                        }
                                    `}
                                >
                                    {/* Avatar Placeholder */}
                                    <div className="w-20 h-20 rounded-full bg-stone-200 mb-4 flex items-center justify-center text-2xl font-serif font-bold text-stone-700">
                                        {player.nickname.charAt(0)}
                                    </div>

                                    <div className="text-xl font-bold text-stone-800 font-serif">
                                        {player.nickname}
                                    </div>
                                    {player.id === currentPlayerId && <span className="text-xs text-stone-500 font-sans uppercase tracking-wider">(You)</span>}

                                    {player.isLeader && electionStatus !== 'RUNOFF' && (
                                        <div className="text-xs font-bold text-amber-600 uppercase tracking-wider mt-2 flex items-center justify-center gap-1">
                                            <Crown size={12} /> Incumbent
                                        </div>
                                    )}

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
                        <div className="mt-8 text-stone-500 dark:text-[#FDFBF7]/60 font-medium">
                            <Loader2 className="animate-spin inline-block mr-2" size={16} />
                            Auto-selecting you as leader...
                        </div>
                    )}

                </div>
            </div>
        </PageTransition>
    )
}
