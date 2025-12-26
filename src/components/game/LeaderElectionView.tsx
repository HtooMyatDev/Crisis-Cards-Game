import React, { useState } from 'react'
import { Crown, User, CheckCircle, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

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
}

export const LeaderElectionView: React.FC<LeaderElectionViewProps> = ({
    teamPlayers,
    currentPlayerId,
    teamColor,
    teamName,
    onVote,
    hasVoted,
    currentLeader
}) => {
    const [selectedCandidate, setSelectedCandidate] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const autoVoteAttempted = React.useRef(false);

    // Auto-vote for solo players
    React.useEffect(() => {
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-8 flex items-center justify-center">
            <div className="w-full max-w-3xl">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-2 sm:gap-3 mb-4">
                        <Crown className="text-yellow-400 w-8 h-8 sm:w-12 sm:h-12" />
                        <h1 className="text-3xl sm:text-5xl font-black text-white">
                            ELECT YOUR LEADER
                        </h1>
                        <Crown className="text-yellow-400 w-8 h-8 sm:w-12 sm:h-12" />
                    </div>
                    <p className="text-xl text-white/60 font-bold">
                        Team <span style={{ color: teamColor }}>{teamName}</span>
                    </p>
                    <p className="text-sm text-white/40 mt-2 font-medium">
                        Vote for who will make the final decisions for your team this round
                    </p>
                </motion.div>

                {/* Current Leader Status */}
                {currentLeader && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-4 rounded-xl bg-yellow-400/10 border-2 border-yellow-400/30 text-center"
                    >
                        <p className="text-yellow-400 font-bold text-sm uppercase tracking-wider">
                            Current Leader: {currentLeader.nickname}
                        </p>
                    </motion.div>
                )}

                {/* Voting Status */}
                {hasVoted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mb-8 p-6 rounded-xl bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center gap-3"
                    >
                        <CheckCircle className="text-green-400" size={24} />
                        <p className="text-green-400 font-black text-lg">
                            VOTE RECORDED
                        </p>
                    </motion.div>
                )}

                {/* Candidate List */}
                <div className="grid gap-4">
                    {teamPlayers
                        .filter(player => player.id !== currentPlayerId)
                        .map((player, index) => {
                            const isSelected = selectedCandidate === player.id

                            return (
                                <motion.button
                                    key={player.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => handleVote(player.id)}
                                    disabled={hasVoted || isSubmitting}
                                    className={`
                                    relative p-6 rounded-xl border-4 transition-all duration-300
                                    ${hasVoted
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:scale-105 cursor-pointer'
                                        }
                                    ${isSelected
                                            ? 'border-green-400 bg-green-500/20 shadow-lg shadow-green-500/50'
                                            : 'border-white/20 bg-white/5 hover:border-white/40'
                                        }
                                `}
                                    style={{
                                        borderColor: isSelected ? '#4ade80' : undefined
                                    }}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-16 h-16 rounded-full flex items-center justify-center border-4 border-white/30"
                                                style={{ backgroundColor: teamColor }}
                                            >
                                                {player.isLeader ? (
                                                    <Crown className="text-white" size={28} />
                                                ) : (
                                                    <User className="text-white" size={28} />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <p className="text-2xl font-black text-white">
                                                    {player.nickname}
                                                </p>
                                                {player.isLeader && (
                                                    <p className="text-xs text-yellow-400 font-bold uppercase tracking-wider mt-1">
                                                        Current Leader
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <CheckCircle className="text-green-400" size={32} />
                                        )}
                                    </div>
                                </motion.button>
                            )
                        })}

                    {/* Solo Player Message */}
                    {teamPlayers.length === 1 && teamPlayers[0].id === currentPlayerId && (
                        <div className="text-center p-8 bg-white/5 rounded-xl border-2 border-dashed border-white/20">
                            <p className="text-white/60 text-lg">
                                You are the only member of this team.
                            </p>
                            <p className="text-yellow-400 font-bold mt-2">
                                Automatically designating you as Leader...
                            </p>
                            <Loader2 className="animate-spin inline-block mt-4 text-white/50" />
                        </div>
                    )}
                </div>

                {/* Waiting Message */}
                {hasVoted && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 text-center"
                    >
                        <p className="text-white/60 font-bold animate-pulse">
                            Waiting for all team members to vote...
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    )
}
