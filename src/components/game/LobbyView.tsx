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
        <div className="min-h-screen bg-[#FDFAE5] dark:bg-[#3E3E3C] font-sans transition-colors duration-300 relative flex flex-col pb-20">
            {/* Background - Light Mode */}
            <img
                src="/svg/light/background.svg"
                alt=""
                className="absolute inset-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                aria-hidden="true"
            />
            {/* Background - Dark Mode */}
            <img
                src="/svg/dark/background.svg"
                alt=""
                className="absolute inset-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
                aria-hidden="true"
            />

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

            <div className="relative z-10 max-w-[676px] mx-auto w-full px-4 flex flex-col gap-8 mt-8 md:mt-12 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">

                {/* 1. MY IDENTITY SECTION */}
                <div className="w-full flex flex-col relative group hover:-translate-y-1 transition-transform duration-300">
                    {/* Top Bar */}
                    <div
                        className="w-full h-5 rounded-tl-[10px] rounded-tr-[10px] border-l-[5px] border-r-[5px] border-t-[5px]"
                        style={{
                            backgroundColor: team?.color || '#16A34A', // Default green if no team
                            borderColor: team?.color || '#16A34A'
                        }}
                    />

                    {/* Main Content Box */}
                    <div
                        className="w-full h-52 bg-stone-700 rounded-bl-[10px] rounded-br-[10px] outline outline-[5px] flex flex-col justify-center px-8 md:px-12 relative shadow-2xl"
                        style={{ outlineColor: team?.color || '#16A34A' }}
                    >
                        {/* Inner bg to hide stone if outline has spacing? No, outline is solid. */}

                        <div className="text-yellow-50 text-2xl md:text-3xl font-normal font-[family-name:var(--font-nohemi)] opacity-50 mb-2 leading-none">
                            {team ? team.name : 'Unassigned'}
                        </div>
                        <div className="text-yellow-50 text-6xl md:text-8xl font-black font-[family-name:var(--font-perfectly-nostalgic)] leading-[0.9] tracking-tight truncate">
                            {nickname}
                        </div>
                    </div>
                </div>


                {/* 2. ALL PLAYERS SECTION */}
                <div className="bg-stone-800/20 dark:bg-black/20 p-6 rounded-2xl border border-stone-800/10 dark:border-white/5 backdrop-blur-sm">
                    <h2 className="text-[#3F3D39] dark:text-yellow-50 text-3xl md:text-4xl font-black font-[family-name:var(--font-perfectly-nostalgic)] mb-8 pl-2">
                        All Players ({allPlayers.length})
                    </h2>

                    <div className="flex flex-col gap-6">

                        {/* Map through Defined Teams first */}
                        {teams.map((t, idx) => {
                            const teamPlayers = allPlayers.filter(p => p.teamId === t.id);

                            return (
                                <div
                                    key={t.id}
                                    className="w-full opacity-0 animate-[slideUp_0.5s_ease-out_forwards]"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Team Header Bar */}
                                    <div
                                        className="w-full h-2 rounded-tl-[10px] rounded-tr-[10px] border-l-[5px] border-r-[5px] border-t-[5px]"
                                        style={{
                                            backgroundColor: t.color,
                                            borderColor: t.color
                                        }}
                                    />

                                    {/* Team Content Box */}
                                    <div
                                        className="w-full min-h-[6rem] bg-stone-700 rounded-bl-[10px] rounded-br-[10px] outline outline-[5px] p-6 flex flex-col justify-center items-start gap-3"
                                        style={{ outlineColor: t.color }}
                                    >
                                        <div className="text-yellow-50 text-base font-medium font-[family-name:var(--font-nohemi)] opacity-90">
                                            {t.name}
                                        </div>

                                        <div className="flex flex-wrap gap-3">
                                            {teamPlayers.length > 0 ? (
                                                teamPlayers.map(p => (
                                                    <div
                                                        key={p.id}
                                                        className="px-3 py-2 rounded-[3px] outline outline-[3px] outline-yellow-50 inline-flex justify-center items-center bg-transparent group hover:bg-yellow-50/10 transition-colors"
                                                    >
                                                        <span className="text-yellow-50 text-lg md:text-xl font-black font-[family-name:var(--font-perfectly-nostalgic)] leading-none pt-0.5">
                                                            {p.nickname} {p.id === playerId && '(You)'}
                                                        </span>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="opacity-30 text-yellow-50 font-[family-name:var(--font-nohemi)] italic text-sm pl-1">
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
                                {/* Header Bar */}
                                <div className="w-full h-2 rounded-tl-[10px] rounded-tr-[10px] border-l-[5px] border-r-[5px] border-t-[5px] border-stone-500 bg-stone-500" />

                                {/* Content Box */}
                                <div className="w-full min-h-[6rem] bg-stone-700 rounded-bl-[10px] rounded-br-[10px] outline outline-[5px] outline-stone-500 p-6 flex flex-col justify-center items-start gap-3">
                                    <div className="text-yellow-50 text-base font-medium font-[family-name:var(--font-nohemi)] opacity-90">
                                        Unassigned
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        {unassignedPlayers.map(p => (
                                            <div
                                                key={p.id}
                                                className="px-3 py-2 rounded-[3px] outline outline-[3px] outline-yellow-50 inline-flex justify-center items-center bg-transparent hover:bg-yellow-50/10"
                                            >
                                                <span className="text-yellow-50 text-lg md:text-xl font-black font-[family-name:var(--font-perfectly-nostalgic)] leading-none pt-0.5">
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
