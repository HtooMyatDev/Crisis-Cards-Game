import React from 'react';
import { CheckCircle } from 'lucide-react';
import { CreatedGame } from '@/types/game';

interface GameSuccessModalProps {
    isOpen: boolean;
    game: CreatedGame | null;
    onStartHosting: (gameId: string) => void;
}

/**
 * Success modal displayed after creating a game session
 * Shows game details and provides action to start hosting
 */
export const GameSuccessModal: React.FC<GameSuccessModalProps> = ({
    isOpen,
    game,
    onStartHosting
}) => {
    if (!isOpen || !game) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 dark:bg-black/70 backdrop-blur-sm animate-in fade-in duration-300"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
        >
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] max-w-md w-full p-8 animate-in zoom-in-95 duration-300">
                {/* Success Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-green-400 dark:bg-green-600 rounded-full blur-xl opacity-50 animate-pulse" aria-hidden="true"></div>
                        <div className="relative p-4 bg-green-500 dark:bg-green-600 border-4 border-black dark:border-gray-700 rounded-full">
                            <CheckCircle size={48} className="text-white" strokeWidth={3} aria-hidden="true" />
                        </div>
                    </div>
                </div>

                {/* Title */}
                <h2
                    id="success-modal-title"
                    className="text-3xl font-black text-center mb-2 text-gray-900 dark:text-white"
                >
                    🎮 Game Created!
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                    Your crisis card game session is ready to play
                </p>

                {/* Game Details */}
                <div className="space-y-4 mb-6">
                    <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 border-2 border-black dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Session Name</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">{game.name}</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/30 border-2 border-black dark:border-gray-700 rounded-lg p-4">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Game Code</p>
                        <div className="flex items-center justify-center gap-2 bg-white dark:bg-gray-900 border-2 border-black dark:border-gray-700 rounded-lg p-3">
                            <span
                                className="font-mono text-3xl font-black text-gray-900 dark:text-white tracking-wider"
                                aria-label={`Game code: ${game.gameCode}`}
                            >
                                {game.gameCode}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2">
                            Share this code with players to join
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center">
                    {/* Simple Done Button */}
                    <button
                        onClick={() => window.location.href = '/admin/games/manage'}
                        className="px-8 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium border border-gray-300 dark:border-gray-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                        aria-label="Close modal"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
