"use client"
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, X, Crown, CheckCircle } from 'lucide-react';

interface TeamScoreChange {
    teamId: string;
    teamName: string;
    teamColor: string;
    scoreChange: number;
    budgetChange?: number;
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
    impactText,
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
        if (change > 0) return <TrendingUp className="text-[#399B2C]" size={28} />;
        if (change < 0) return <TrendingDown className="text-[#CD302F]" size={28} />;
        return <Minus className="text-[#666] dark:text-[#aaa]" size={28} />;
    };

    const getScoreColor = (change: number) => {
        if (change > 0) return 'text-[#399B2C]';
        if (change < 0) return 'text-[#CD302F]';
        return 'text-[#666] dark:text-[#aaa]';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-[#333]/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative bg-[#FDFBF7] dark:bg-[#3E3E3C] text-[#333] dark:text-[#FDFBF7] border-[4px] border-[#333] dark:border-[#FDFBF7] rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.5)] p-6 sm:p-10 max-w-xl w-full text-center overflow-hidden"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 bg-[#eee] hover:bg-[#ddd] dark:bg-[#555] dark:hover:bg-[#666] text-[#333] dark:text-[#FDFBF7] rounded-full transition-colors border-2 border-[#333] dark:border-[#FDFBF7] z-10"
                            aria-label="Close modal"
                        >
                            <X size={20} />
                        </button>

                        {/* Title - Political/Newspaper Style */}
                        <div className="mb-8 border-b-2 border-[#333] dark:border-[#FDFBF7] pb-4">
                            <h2 className="text-4xl sm:text-5xl font-black text-center uppercase text-[#333] dark:text-[#FDFBF7] font-serif italic tracking-tight">
                                Round Results
                            </h2>
                            <p className="text-xs font-bold uppercase tracking-[0.3em] text-[#666] dark:text-[#aaa] mt-2">
                                Official Report
                            </p>
                        </div>

                        {/* Selected Response */}
                        {selectedResponse && (
                            <div className="mb-8 relative">
                                <div className="relative p-6 bg-white dark:bg-[#2A2A28] border-2 border-[#333] dark:border-[#FDFBF7]/50 rounded-lg">
                                    <div className="flex flex-col items-center">
                                        <p className="text-xs font-black uppercase tracking-widest text-[#666] dark:text-[#aaa] mb-2 border px-2 py-0.5 border-[#333] dark:border-[#FDFBF7] rounded">
                                            Decision Made
                                        </p>
                                        <p className="text-2xl sm:text-3xl font-serif font-bold italic text-[#333] dark:text-[#FDFBF7] mb-4 leading-tight">
                                            &ldquo;{selectedResponse}&rdquo;
                                        </p>

                                        {impactText && (
                                            <div className="mb-4 text-[#555] dark:text-[#ccc] text-sm font-medium leading-relaxed max-w-md mx-auto italic font-serif">
                                                {impactText}
                                            </div>
                                        )}

                                        {selectedResponseEffects && (
                                            <div className="flex flex-wrap justify-center gap-2 mt-2">
                                                {Object.entries(selectedResponseEffects).map(([key, value]) => {
                                                    if (value === 0 || typeof value !== 'number') return null;
                                                    const isPositive = value > 0;
                                                    return (
                                                        <span key={key} className={`text-xs font-bold px-2 py-1 border-2 uppercase tracking-wide
                                                             ${isPositive
                                                                ? 'bg-[#399B2C]/10 text-[#2E7D23] border-[#399B2C] dark:text-[#4ADE80] dark:border-[#4ADE80]'
                                                                : 'bg-[#CD302F]/10 text-[#B91C1C] border-[#CD302F] dark:text-[#F87171] dark:border-[#F87171]'}
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
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 + (index * 0.1) }}
                                    className={`p-4 rounded-lg border-2 border-[#333] dark:border-[#FDFBF7]/30 bg-white dark:bg-[#2A2A28] relative`}
                                >
                                    <div className="flex flex-col items-center">
                                        <p className="text-sm font-black mb-2 uppercase tracking-widest" style={{ color: team.teamColor }}>
                                            {team.teamName}
                                        </p>

                                        {/* Score */}
                                        <div className="flex items-center justify-center gap-2 mb-2">
                                            {getScoreIcon(team.scoreChange)}
                                            <p className={`text-5xl font-serif font-black italic ${getScoreColor(team.scoreChange)}`}>
                                                {team.scoreChange > 0 ? '+' : ''}{team.scoreChange}
                                            </p>
                                        </div>

                                        {team.budgetChange !== undefined && team.budgetChange !== 0 && (
                                            <div className="border-t border-dashed border-[#ccc] dark:border-[#444] w-full pt-2 mt-1">
                                                <div className={`text-xs font-bold uppercase tracking-wider
                                                    ${team.budgetChange > 0 ? 'text-[#399B2C] dark:text-[#4ADE80]' : 'text-[#CD302F] dark:text-[#F87171]'}
                                                `}>
                                                    {team.budgetChange > 0 ? '+' : ''}{team.budgetChange} Funds
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Auto-advance indicator */}
                        <div className="text-center">
                            <div className="flex flex-col items-center gap-2 mb-4">
                                <p className="text-[10px] text-[#666] dark:text-[#aaa] font-bold uppercase tracking-widest animate-pulse">
                                    Next crisis imminent
                                </p>
                                <div className="w-2/3 bg-[#ddd] dark:bg-[#555] h-2 border border-[#999] dark:border-[#666]">
                                    <motion.div
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                                        className="h-full bg-[#333] dark:bg-[#FDFBF7]"
                                    />
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="w-full sm:w-auto px-8 py-3 bg-[#333] hover:bg-[#000] dark:bg-[#FDFBF7] dark:hover:bg-[#EAE8E4] text-white dark:text-[#333] text-sm font-black uppercase tracking-widest border-2 border-transparent transition-all shadow-[4px_4px_0px_0px_#999] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                            >
                                Continue
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
