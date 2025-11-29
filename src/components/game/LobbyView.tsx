import React, { useState } from 'react';
import { Gamepad2, User, Loader2, BookOpen } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import { GameInstructions } from '@/components/game/GameInstructions';

interface Player {
    id: number;
    nickname: string;
    team?: string;
    score: number;
    isLeader: boolean;
}

interface LobbyViewProps {
    gameCode: string;
    nickname: string;
    team: 'RED' | 'BLUE' | null;
    teammates: Player[];
    onChangeTeam: () => void;
    onLeaveGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
    gameCode,
    nickname,
    team,
    teammates,
    onChangeTeam,
    onLeaveGame
}) => {
    const [showInstructions, setShowInstructions] = useState(false);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-400 dark:border-yellow-500 transform rotate-45"></div>
                    <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-blue-400 dark:border-blue-500 rounded-full"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8 relative">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <div className="inline-block p-4 bg-green-100 dark:bg-green-900/30 border-4 border-black dark:border-gray-700 rounded-full mb-4">
                                <Gamepad2 size={40} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-2">
                                You&apos;re In!
                            </h1>
                            <p className="text-lg font-bold text-gray-600 dark:text-gray-400">
                                Waiting for host to start...
                            </p>
                        </div>

                        {/* Player Info */}
                        <div className="bg-gray-50 dark:bg-gray-700 border-4 border-black dark:border-gray-600 rounded-xl p-6 mb-6 relative overflow-hidden">
                            <div className={`absolute top-0 left-0 w-full h-2 ${team === 'RED' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 border-2 border-black dark:border-gray-600 rounded-lg flex items-center justify-center ${team === 'RED' ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'}`}>
                                    <User size={24} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Playing as</p>
                                    <p className="text-xl font-black text-black dark:text-white">{nickname}</p>
                                    <div className="flex items-center gap-2">
                                        <p className={`text-sm font-bold ${team === 'RED' ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                            {team} TEAM
                                        </p>
                                        <button
                                            onClick={onChangeTeam}
                                            className="text-xs text-gray-400 dark:text-gray-500 underline hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            (Change)
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teammates List */}
                        {teammates.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Your Teammates ({teammates.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {teammates.map((p, idx) => (
                                        <span key={idx} className={`px-3 py-1 rounded-full text-xs font-bold border-2 border-black dark:border-gray-600 ${team === 'RED' ? 'bg-red-100 dark:bg-red-900/40 text-red-800 dark:text-red-300' : 'bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300'}`}>
                                            {p.nickname} {p.nickname === nickname && '(You)'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Status Indicator */}
                        <div className="flex flex-col items-center justify-center py-8 space-y-4 border-t-4 border-gray-100 dark:border-gray-700">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-black dark:border-gray-600 rounded-full border-t-transparent animate-spin"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-yellow-400 dark:bg-yellow-500 rounded-full"></div>
                                </div>
                            </div>
                            <p className="font-bold text-gray-500 dark:text-gray-400 animate-pulse">
                                See your name on the big screen!
                            </p>
                        </div>

                        {/* Game Code Display */}
                        <div className="mt-6 pt-6 border-t-4 border-black dark:border-gray-700 text-center">
                            <p className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">Game PIN</p>
                            <p className="text-4xl font-black text-black dark:text-white tracking-widest">{gameCode}</p>
                        </div>

                        {/* Leave Game Button */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={onLeaveGame}
                                className="text-xs font-bold text-red-400 dark:text-red-500 hover:text-red-600 dark:hover:text-red-400 underline"
                            >
                                Leave Game
                            </button>
                        </div>

                        {/* How to Play Button */}
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setShowInstructions(true)}
                                className="flex items-center justify-center gap-2 mx-auto text-sm font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
                            >
                                <BookOpen size={16} />
                                How to Play
                            </button>
                        </div>

                        <GameInstructions
                            isOpen={showInstructions}
                            onClose={() => setShowInstructions(false)}
                        />
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
