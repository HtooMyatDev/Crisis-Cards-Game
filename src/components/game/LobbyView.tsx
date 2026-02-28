import React, { useState } from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { LogOut } from 'lucide-react';

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    teammates,
    allPlayers = [],
    teams = [],
    onLeaveGame
}) => {
    // Sound Effects
    const { playJoin } = useGameSounds();
    const prevPlayerCount = React.useRef(allPlayers.length);

    React.useEffect(() => {
        if (allPlayers.length > prevPlayerCount.current) {
            playJoin();
        }
        prevPlayerCount.current = allPlayers.length;
    }, [allPlayers.length, playJoin]);

    // Handle Unassigned Players specially
    const unassignedPlayers = allPlayers.filter(p => !p.teamId);
    // Filter teams that actually have players or exist
    // If teams are static, we show them. If dynamic, we map.
    // Usually teams are pre-defined.

    return (
        <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] font-sans transition-colors duration-300 relative flex flex-col pb-20 overflow-hidden">
            {/* Background - Light Mode */}
            {/* <img
                src="/svg/light/background.svg"
                alt=""
                className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                aria-hidden="true"
            /> */}
            {/* Background - Dark Mode */}
            {/* <img
                src="/svg/dark/background.svg"
                alt=""
                className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
                aria-hidden="true"
            /> */}

            {/* Decorative Header Area */}
            <div className="w-full flex justify-center pt-8 pb-4 relative z-20">
                {/* Leave Game Button */}
                <button
                    onClick={onLeaveGame}
                    className="absolute top-8 right-4 md:right-8 text-black/60 dark:text-[#FDFBF7]/60 hover:text-red-500 transition-colors flex items-center gap-2 font-[family-name:var(--font-nohemi)] font-bold z-50"
                >
                    <span className="hidden md:inline">Leave Game</span>
                    <LogOut size={20} />
                </button>

                <div className="flex flex-col items-center gap-4 relative z-20">
                    <img src="/svg/light/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[70px] w-auto dark:hidden" />
                    <img src="/svg/dark/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-[70px] w-auto hidden dark:block" />
                </div>
            </div>
            <div className="relative z-10 max-w-[676px] mx-auto w-full px-4 flex flex-col gap-8 mt-8 md:mt-12">
                {/* 1. MY IDENTITY SECTION */}
                <div className="w-full flex justify-center mb-8">
                    <div
                        className="w-full bg-[#FEFDF9] dark:bg-stone-800 rounded-[12px] border-[4px] border-t-[16px] flex flex-col items-center justify-center py-12 md:py-16 shadow-sm"
                        style={{ borderColor: team?.color || '#16A34A' }}
                    >
                        <div className="text-[#3F3D39] dark:text-yellow-50 text-6xl md:text-8xl font-serif font-bold italic mb-2 leading-none truncate px-4">
                            {nickname}
                        </div>
                        <div className="text-[#A1A1AA] dark:text-stone-400 text-xl md:text-2xl font-sans font-medium">
                            {team ? team.name : 'Unassigned'}
                        </div>
                    </div>
                </div>


                {/* 2. ALL PLAYERS SECTION */}
                <div className="flex flex-col mb-12">

                    <h2 className="text-[#3F3D39] dark:text-yellow-50 text-3xl md:text-[32px] font-serif font-bold italic mb-4 pl-2 tracking-tight">
                        All Players ({allPlayers.length})
                    </h2>

                    <div className="flex flex-col gap-6">

                        {/* Map through Defined Teams first */}
                        {teams.map((t, idx) => {
                            const teamPlayers = allPlayers.filter(p => p.teamId === t.id);

                            return (
                                <div
                                    key={t.id}
                                    className="w-full"
                                >
                                    <div
                                        className="w-full bg-[#FEFDF9] dark:bg-stone-800 rounded-[10px] border-[4px] border-t-[12px] p-4 flex flex-col items-start gap-2 shadow-sm"
                                        style={{ borderColor: t.color }}
                                    >
                                        <div className="text-[#3F3D39] dark:text-yellow-50 text-sm font-bold font-sans">
                                            {t.name}
                                        </div>

                                        <div className="flex flex-wrap gap-2">
                                            {teamPlayers.length > 0 ? (
                                                teamPlayers.map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="px-3 py-1.5 rounded-[4px] border-2 border-[#3F3D39] dark:border-[#FDFBF7] bg-[#FEFDF9] dark:bg-stone-700 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                                    >
                                                        <span className="text-[#3F3D39] dark:text-yellow-50 text-lg font-serif font-bold italic leading-none">
                                                            {p.nickname} {p.id === playerId && '(You)'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="opacity-40 text-[#3F3D39] dark:text-yellow-50 font-serif italic text-sm py-1">
                                                    Empty
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unassigned Players (if any) */}
                        {unassignedPlayers.length > 0 && (
                            <div className="w-full">
                                <div className="w-full bg-[#FEFDF9] dark:bg-stone-800 rounded-[10px] border-[4px] border-t-[12px] p-4 flex flex-col items-start gap-2 shadow-sm border-gray-400 dark:border-gray-500">
                                    <div className="text-[#3F3D39] dark:text-yellow-50 text-sm font-bold font-sans">
                                        Unassigned
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {unassignedPlayers.map(p => (
                                            <div
                                                key={p.id}
                                                className="px-3 py-1.5 rounded-[4px] border-2 border-[#3F3D39] dark:border-[#FDFBF7] bg-[#FEFDF9] dark:bg-stone-700 flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5"
                                            >
                                                <span className="text-[#3F3D39] dark:text-yellow-50 text-lg font-serif font-bold italic leading-none">
                                                    {p.nickname} {p.id === playerId && '(You)'}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

                {/* Game Code Display (Footer) */}
                <div className="relative z-10 text-center mt-8 mb-4 opacity-70">
                    <div className="text-[#3F3D39] dark:text-yellow-50 font-[family-name:var(--font-nohemi)] text-sm font-bold">
                        Waiting for host to start...
                    </div>
                    <div className="text-[#3F3D39] dark:text-yellow-50 font-[family-name:var(--font-perfectly-nostalgic)] text-2xl mt-1 tracking-widest bg-white/20 dark:bg-black/20 inline-block px-4 py-1 rounded-full border border-black/10 dark:border-white/10">
                        Code: {gameCode}
                    </div>
                </div>

            </div>
        </div>
    );
};
