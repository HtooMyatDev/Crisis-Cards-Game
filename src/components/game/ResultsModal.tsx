"use client"
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, X } from 'lucide-react';

interface ResultsModalProps {
    isOpen: boolean;
    onClose: () => void;
    redScoreChange: number;
    blueScoreChange: number;
    selectedResponse?: string;
    autoCloseDelay?: number; // in milliseconds
}

export const ResultsModal: React.FC<ResultsModalProps> = ({
    isOpen,
    onClose,
    redScoreChange,
    blueScoreChange,
    selectedResponse,
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

    const getScoreBgColor = (change: number) => {
        if (change > 0) return 'bg-green-50 border-green-500';
        if (change < 0) return 'bg-red-50 border-red-500';
        return 'bg-gray-50 border-gray-500';
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.8, opacity: 0, y: 20 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        className="relative bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 max-w-2xl w-full"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X size={24} />
                        </button>

                        {/* Title */}
                        <h2 className="text-3xl font-black text-center mb-6 uppercase">
                            Round Results
                        </h2>

                        {/* Selected Response */}
                        {selectedResponse && (
                            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-500 rounded-lg">
                                <p className="text-sm font-bold text-blue-700 mb-1">Decision Made:</p>
                                <p className="text-gray-900 font-medium">{selectedResponse}</p>
                            </div>
                        )}

                        {/* Score Changes */}
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Red Team */}
                            <motion.div
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`p-6 rounded-xl border-4 ${getScoreBgColor(redScoreChange)}`}
                            >
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-600 mb-2">RED TEAM</p>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        {getScoreIcon(redScoreChange)}
                                    </div>
                                    <p className={`text-4xl font-black ${getScoreColor(redScoreChange)}`}>
                                        {redScoreChange > 0 ? '+' : ''}{redScoreChange}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1">
                                        {redScoreChange > 0 ? 'Score Increased!' : redScoreChange < 0 ? 'Score Decreased' : 'No Change'}
                                    </p>
                                </div>
                            </motion.div>

                            {/* Blue Team */}
                            <motion.div
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className={`p-6 rounded-xl border-4 ${getScoreBgColor(blueScoreChange)}`}
                            >
                                <div className="text-center">
                                    <p className="text-sm font-bold text-gray-600 mb-2">BLUE TEAM</p>
                                    <div className="flex items-center justify-center gap-2 mb-2">
                                        {getScoreIcon(blueScoreChange)}
                                    </div>
                                    <p className={`text-4xl font-black ${getScoreColor(blueScoreChange)}`}>
                                        {blueScoreChange > 0 ? '+' : ''}{blueScoreChange}
                                    </p>
                                    <p className="text-xs font-semibold text-gray-500 mt-1">
                                        {blueScoreChange > 0 ? 'Score Increased!' : blueScoreChange < 0 ? 'Score Decreased' : 'No Change'}
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Auto-advance indicator */}
                        <div className="text-center">
                            <p className="text-sm text-gray-500 font-medium">
                                Moving to next card...
                            </p>
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1 overflow-hidden">
                                <motion.div
                                    initial={{ width: "0%" }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: autoCloseDelay / 1000, ease: "linear" }}
                                    className="h-full bg-blue-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
