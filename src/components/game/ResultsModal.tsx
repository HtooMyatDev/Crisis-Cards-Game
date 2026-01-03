"use client"
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

interface TeamScoreChange {
    teamId: string;
    teamName: string;
    teamColor: string;
    scoreChange: number;
    budgetChange?: number; // Added optional budget change
}

interface ResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    teamScoreChanges: TeamScoreChange[];
    selectedResponse?: string;
    selectedResponseEffects?: {
        political?: number;
        economic?: number;
        infrastructure?: number;
        society?: number;
        environment?: number;
    };
    impactText?: string;
    autoCloseDelay?: number; // in milliseconds
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
    isOpen,
    onClose,
    teamScoreChanges,
    selectedResponse,
    selectedResponseEffects,
    impactText, // New prop
    autoCloseDelay = 4000
}) => {
    useEffect(() => {
        if (isOpen && autoCloseDelay > 0) {
            const timer = setTimeout(() => {
                onClose();
            }, autoCloseDelay);

            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDelay, onClose]);

    const getScoreIcon = (change: number) => {
        if (change > 0) return <TrendingUp className="text-green-500" size={32} />;
        if (change < 0) return <TrendingDown className="text-red-500" size={32} />;
        return <Minus className="text-gray-500" size={32} />;
    };

    const getScoreColor = (change: number) => {
        if (change > 0) return 'text-green-500';
        if (change < 0) return 'text-red-500';
        return 'text-gray-500';
    };

    const getScoreBgColor = (change: number, teamColor: string) => {
        // We can use the team color for the border/bg tint
        // But for score changes, green/red is usually better to indicate positive/negative
        // Let's mix them or just use the standard green/red for the card background
        if (change > 0) return 'bg-[#0f172a] border-2 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.1)]';
        if (change < 0) return 'bg-[#0f172a] border-2 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.1)]';
        return 'bg-[#0f172a] border-2 border-gray-700';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-[family-name:var(--font-roboto)]">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-[#0B0F19] text-white border border-white/5 rounded-2xl shadow-2xl p-6 sm:p-10 max-w-2xl w-full text-center overflow-hidden"
                    >
                        {/* Background Glow */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
                        {/* Close Button implementation remains same... */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-full border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all z-10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        {/* Title */}
                        {/* Title */}
                        {/* Title */}
                        <h2 className="text-3xl sm:text-5xl font-black text-center mb-8 uppercase text-white tracking-widest font-russo drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                            Round Results
                        </h2>

                        {/* Selected Response */}
                        {selectedResponse && (
                            <div className="mb-8 relative group">
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
                                <div className="relative p-6 bg-[#0f172a] border border-blue-500/30 rounded-xl overflow-hidden">
                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 h-16 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]" />

                                    <div className="flex flex-col items-center">
                                        <p className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest">
                                            Decision Made
                                        </p>
                                        <p className="text-3xl font-bold text-white mb-6 font-russo tracking-wide leading-tight">
                                            {selectedResponse}
                                        </p>

                                        {impactText && (
                                            <div className="mb-4 text-gray-400 italic text-sm md:text-base font-medium max-w-lg mx-auto">
                                                &quot;{impactText}&quot;
                                            </div>
                                        )}

                                        {selectedResponseEffects && (
                                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                                {Object.entries(selectedResponseEffects).map(([key, value]) => {
                                                    if (value === 0 || typeof value !== 'number') return null;
                                                    const isPositive = value > 0;
                                                    return (
                                                        <span key={key} className={`text-[10px] font-black px-2 py-1 rounded bg-black/40 border border-white/5 uppercase tracking-wider
                                                             ${isPositive ? 'text-green-400' : 'text-red-400'}
                                                         `}>
                                                            {key}: {isPositive ? '+' : ''}{value}
                                                        </span>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Score Changes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                            {teamScoreChanges.map((team, index) => (
                                <motion.div
                                    key={team.teamId}
                                    initial={{ x: index % 2 === 0 ? -20 : 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + (index * 0.1) }}
                                    className={`p-6 rounded-xl border relative overflow-hidden ${getScoreBgColor(team.scoreChange, team.teamColor)}`}
                                >
                                    <div className="relative z-10">
                                        <p className="text-md font-black mb-2 uppercase tracking-wide" style={{ color: team.teamColor }}>
                                            {team.teamName}
                                        </p>
                                        <div className="flex flex-col items-center justify-center gap-1">
                                            {/* Score */}
                                            <div className="flex items-center gap-2">
                                                {getScoreIcon(team.scoreChange)}
                                                <p className={`text-6xl font-black ${getScoreColor(team.scoreChange)} font-russo drop-shadow-md tracking-tighter`}>
                                                    {team.scoreChange > 0 ? '+' : ''}{team.scoreChange}
                                                </p>
                                            </div>

                                            {team.budgetChange !== undefined && team.budgetChange !== 0 && (
                                                <div className={`mt-3 font-bold px-3 py-1.5 rounded bg-[#1e293b] text-sm
                                                    ${team.budgetChange > 0 ? 'text-green-400' : 'text-red-400'}
                                                `}>
                                                    {team.budgetChange > 0 ? '+' : ''}{team.budgetChange} Funds
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Auto-advance indicator */}
                        <div className="text-center space-y-4">
                            <div className="flex flex-col items-center gap-2">
                                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium animate-pulse">
                                    Next crisis imminent...
                                </p>
                                <div className="w-full max-w-xs bg-gray-200 dark:bg-white/10 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                                        className="h-full bg-blue-500 dark:bg-blue-400"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-[#1e293b] hover:bg-[#334155] text-white text-xs font-black uppercase tracking-[0.25em] rounded-lg border border-white/20 shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
                            >
                                Continue Immediately
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
