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
                <div className="space-y-3">
                    {/* Primary Actions Row */}
                    <div className="grid grid-cols-2 gap-3">
                        {/* Copy Game Code */}
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(game.gameCode);
                            }}
                            className="px-4 py-3 bg-purple-500 hover:bg-purple-600 text-white font-bold border-2 border-purple-600 dark:border-purple-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400"
                            aria-label="Copy game code to clipboard"
                        >
                            <span className="flex items-center justify-center gap-2 text-sm">
                                📋 Copy Code
                            </span>
                        </button>

                        {/* View Game Details */}
                        <button
                            onClick={() => window.location.href = `/admin/games/${game.id}`}
                            className="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold border-2 border-blue-600 dark:border-blue-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                            aria-label="View game details"
                        >
                            <span className="flex items-center justify-center gap-2 text-sm">
                                👁️ View Details
                            </span>
                        </button>
                    </div>

                    {/* Start Hosting - Full Width */}
                    <button
                        onClick={() => onStartHosting(game.id)}
                        className="w-full px-6 py-4 bg-green-500 hover:bg-green-600 text-white font-bold border-2 border-green-600 dark:border-green-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] dark:shadow-[4px_4px_0px_0px_rgba(34,197,94,1)] hover:shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 dark:focus:ring-green-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                        aria-label="Start hosting the game"
                    >
                        <span className="flex items-center justify-center gap-2">
                            🎯 Start Hosting Game
                        </span>
                    </button>

                    {/* View All Sessions */}
                    <button
                        onClick={() => window.location.href = '/admin/games/manage'}
                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                        aria-label="View all game sessions"
                    >
                        <span className="flex items-center justify-center gap-2 text-sm">
                            📊 View All Sessions
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};
