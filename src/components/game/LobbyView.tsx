import React, { useState } from 'react';
import { Gamepad2, User, BookOpen } from 'lucide-react';
import PageTransition from '@/components/ui/PageTransition';
import { GameInstructions } from '@/components/game/GameInstructions';
import { useGameSounds } from '@/hooks/useGameSounds';

interface Team {
    id: string;
    name: string;
    color: string;
}

interface Player {
    id: number;
    nickname: string;
    teamId?: string | null;
    score: number;
    isLeader: boolean;
}

interface LobbyViewProps {
    gameCode: string;
    nickname: string;
    playerId?: number | null;
    team: Team | null;
    teammates: Player[];
    allPlayers?: Player[];
    teams?: Team[];
    onLeaveGame: () => void;
}

export const LobbyView: React.FC<LobbyViewProps> = ({
    gameCode,
    nickname,
    playerId,
    team,
    teammates,
    allPlayers = [],
    teams = [],
    onLeaveGame
}) => {
    const [showInstructions, setShowInstructions] = useState(false);

    // Sound Effects
    const { playJoin } = useGameSounds();
    const prevPlayerCount = React.useRef(allPlayers.length);

    React.useEffect(() => {
        if (allPlayers.length > prevPlayerCount.current) {
            playJoin();
        }
        prevPlayerCount.current = allPlayers.length;
    }, [allPlayers.length, playJoin]);

    return (
        <PageTransition>
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
                {/* Decorative Background */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-400 dark:border-yellow-500 transform rotate-45"></div>
                    <div className="absolute bottom-20 right-20 w-24 h-24 border-4 border-blue-400 dark:border-blue-500 rounded-full"></div>
                </div>

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 sm:p-8 relative">
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
                            <div className="absolute top-0 left-0 w-full h-2" style={{ backgroundColor: team?.color || 'gray' }}></div>
                            <div className="flex items-center gap-4">
                                <div
                                    className="w-12 h-12 border-2 border-black dark:border-gray-600 rounded-lg flex items-center justify-center"
                                    style={{
                                        backgroundColor: team?.color ? `${team.color}33` : undefined,
                                    }}
                                >
                                    <User size={24} className="text-gray-700 dark:text-gray-300" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Playing as</p>
                                    <p className="text-xl font-black text-black dark:text-white">{nickname}</p>
                                    <div className="flex items-center gap-2">
                                        <p
                                            className="text-sm font-bold"
                                            style={{ color: team?.color || '#6B7280' }}
                                        >
                                            {team ? team.name : 'No Team Assigned'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Teammates List */}
                        {teammates.length > 0 && team && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-2">Your Teammates ({teammates.length})</h3>
                                <div className="flex flex-wrap gap-2">
                                    {teammates.map((p, idx) => (
                                        <span
                                            key={idx}
                                            className="px-3 py-1 rounded-full text-xs font-bold border-2 border-black dark:border-gray-600"
                                            style={{
                                                backgroundColor: `${team.color}33`,
                                                color: team.color
                                            }}
                                        >
                                            {p.nickname} {p.id === playerId && '(You)'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* All Players List */}
                        {allPlayers.length > 0 && (
                            <div className="mb-6">
                                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase mb-3 flex items-center gap-2">
                                    <User size={14} />
                                    All Players ({allPlayers.length})
                                </h3>
                                <div className="space-y-3">
                                    {teams.map(t => {
                                        const teamPlayers = allPlayers.filter(p => p.teamId === t.id);
                                        if (teamPlayers.length === 0) return null;

                                        return (
                                            <div key={t.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 border-2 border-gray-200 dark:border-gray-600">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div
                                                        className="w-3 h-3 rounded-full"
                                                        style={{ backgroundColor: t.color }}
                                                    />
                                                    <span className="text-xs font-bold uppercase" style={{ color: t.color }}>
                                                        {t.name} ({teamPlayers.length})
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {teamPlayers.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="px-2 py-1 rounded text-xs font-medium border"
                                                            style={{
                                                                backgroundColor: `${t.color}26`,
                                                                borderColor: `${t.color}66`,
                                                                color: t.color
                                                            }}
                                                        >
                                                            {p.nickname}{p.id === playerId && ' (You)'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {/* Unassigned Players */}
                                    {(() => {
                                        const unassignedPlayers = allPlayers.filter(p => !p.teamId);
                                        if (unassignedPlayers.length === 0) return null;

                                        return (
                                            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 border-2 border-yellow-200 dark:border-yellow-700/50">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <div className="w-3 h-3 rounded-full bg-yellow-400 animate-pulse" />
                                                    <span className="text-xs font-bold uppercase text-yellow-700 dark:text-yellow-400">
                                                        Waiting for Team Assignment ({unassignedPlayers.length})
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {unassignedPlayers.map((p) => (
                                                        <span
                                                            key={p.id}
                                                            className="px-2 py-1 rounded text-xs font-medium bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-600 shadow-sm"
                                                        >
                                                            {p.nickname}{p.nickname === nickname && ' (You)'}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })()}
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
