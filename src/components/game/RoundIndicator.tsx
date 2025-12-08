import React from 'react';
import { motion } from 'framer-motion';

interface RoundIndicatorProps {
    currentRound: number;
    currentCardIndex: number;
    cardsPerRound: number;
    totalRounds?: number;
}

export const RoundIndicator: React.FC<RoundIndicatorProps> = ({
    currentRound,
    currentCardIndex,
    cardsPerRound = 3,
    totalRounds
}) => {
    // Calculate card position within current round
    const cardInRound = (currentCardIndex % cardsPerRound) + 1;
    const progress = (cardInRound / cardsPerRound) * 100;

    return (
        <div className="flex flex-col items-center gap-2">
            {/* Round Number */}
            <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
                    Round
                </span>
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 text-white px-4 py-1 rounded-full font-black text-lg shadow-lg border-2 border-blue-400 dark:border-blue-500">
                    {currentRound}
                    {totalRounds && (
                        <span className="text-sm font-medium opacity-90">
                            /{totalRounds}
                        </span>
                    )}
                </div>
            </div>

            {/* Card Progress */}
            <div className="flex flex-col items-center gap-1 w-full max-w-xs">
                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                    Card {cardInRound} of {cardsPerRound}
                </span>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden border border-gray-300 dark:border-gray-600">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700"
                    />
                </div>

                {/* Card Dots Indicator */}
                <div className="flex gap-1.5 mt-1">
                    {Array.from({ length: cardsPerRound }).map((_, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ scale: 0.8 }}
                            animate={{
                                scale: idx < cardInRound ? 1 : 0.8,
                                opacity: idx < cardInRound ? 1 : 0.4
                            }}
                            className={`w-2 h-2 rounded-full ${idx < cardInRound
                                    ? 'bg-blue-500 dark:bg-blue-400'
                                    : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};
