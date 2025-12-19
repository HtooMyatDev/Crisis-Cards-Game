"use client"
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

interface TeamScoreChange {
    teamId: string;
    teamName: string;
    teamColor: string;
    scoreChange: number;
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
        if (change > 0) return 'bg-green-50 dark:bg-green-900/20 border-green-500';
        if (change < 0) return 'bg-red-50 dark:bg-red-900/20 border-red-500';
        return 'bg-gray-50 dark:bg-gray-800 border-gray-500';
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
                        className="relative bg-white dark:bg-gray-900/90 dark:backdrop-blur-xl text-black dark:text-white border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl p-8 max-w-2xl w-full text-center"
                    >
                        {/* Close Button implementation remains same... */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-white/10 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-800 dark:text-gray-200 hover:text-red-600 dark:hover:text-red-400 rounded-full border border-transparent hover:border-red-200 dark:hover:border-red-800 transition-all z-10"
                            aria-label="Close modal"
                        >
                            <X size={24} />
                        </button>

                        {/* Title */}
                        <h2 className="text-4xl font-black text-center mb-8 uppercase text-gray-900 dark:text-white tracking-wider font-[family-name:var(--font-russo)] drop-shadow-md">
                            Round Results
                        </h2>

                        {/* Selected Response */}
                        {selectedResponse && (
                            <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-xl relative overflow-hidden group">
                                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
                                <p className="text-sm font-bold text-blue-600 dark:text-blue-300 mb-2 uppercase tracking-wide">Decision Made</p>
                                <p className="text-2xl text-gray-900 dark:text-white font-bold leading-tight mb-4">{selectedResponse}</p>

                                {impactText && (
                                    <div className="mb-4 p-4 bg-white/60 dark:bg-[#0B0F19]/40 rounded-lg italic text-gray-700 dark:text-gray-300 border-l-4 border-blue-500 text-sm md:text-base">
                                        &quot;{impactText}&quot;
                                    </div>
                                )}

                                {selectedResponseEffects && (
                                    <div className="flex flex-wrap justify-center gap-3 mt-4 pt-4 border-t border-blue-100 dark:border-white/10">
                                        {Object.entries(selectedResponseEffects).map(([key, value]) => {
                                            if (value === 0 || typeof value !== 'number') return null;
                                            const isPositive = value > 0;
                                            return (
                                                <span key={key} className={`text-xs font-black px-3 py-1.5 rounded-md border shadow-sm
                                                    ${isPositive
                                                        ? 'bg-green-100 dark:bg-green-500/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-500/30'
                                                        : 'bg-red-100 dark:bg-red-500/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-500/30'
                                                    }`}>
                                                    {key.toUpperCase()}: {isPositive ? '+' : ''}{value}
                                                </span>
                                            );
                                        })}
                                    </div>
                                )}
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
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getScoreIcon(team.scoreChange)}
                                        </div>
                                        <p className={`text-5xl font-black ${getScoreColor(team.scoreChange)} font-[family-name:var(--font-russo)] drop-shadow-sm`}>
                                            {team.scoreChange > 0 ? '+' : ''}{team.scoreChange}
                                        </p>
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

                            {/* Manual Continue Button - Fixes the "stuck" issue */}
                            <button
                                onClick={onClose}
                                className="px-8 py-3 bg-white dark:bg-white/10 hover:bg-gray-50 dark:hover:bg-white/20 text-gray-900 dark:text-white text-sm font-black uppercase tracking-widest rounded-lg border border-gray-200 dark:border-white/20 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 active:translate-y-0"
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
