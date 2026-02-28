import React from 'react';
import { useGameSounds } from '@/hooks/useGameSounds';
import { LogOut } from 'lucide-react';
import { TopLogo } from './CategoryIcons';

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
        <div className="h-[100dvh] bg-[#FDFAE5] dark:bg-[#3E3E3C] font-sans transition-colors duration-300 relative flex flex-col pb-8 w-full overflow-y-auto overflow-x-hidden no-scrollbar">
            {/* Background - Light Mode */}
            <img
                src="/svg/light/background.svg"
                alt=""
                className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none dark:hidden z-0"
                aria-hidden="true"
            />
            {/* Background - Dark Mode */}
            <img
                src="/svg/dark/background.svg"
                alt=""
                className="absolute inset-x-0 top-0 w-full h-[110vh] object-cover pointer-events-none hidden dark:block z-0"
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

            <div className="relative z-10 max-w-[676px] mx-auto w-full px-4 flex flex-col mt-8 md:mt-12 flex-grow">
                {/* 1. MY IDENTITY SECTION */}
                <div className="w-full flex justify-center mb-6">
                    <div
                        className="w-full relative rounded-[24px] p-2 shadow-xl"
                        style={{ backgroundColor: team?.color || '#CD302F' }}
                    >
                        {/* Inner stroke like the Red Card */}
                        <div className="absolute inset-[10px] rounded-[16px] border-[1px] border-[#FDFAE5]/20 pointer-events-none z-20"></div>

                        {/* Top Logo - Aligned with the high-fidelity design */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30">
                            <TopLogo className="w-20 h-auto drop-shadow-sm" />
                        </div>

                        <div className="relative z-10 w-full flex flex-col items-center justify-center py-14 md:py-20">
                            <div className="text-[#FDFAE5] text-[64px] md:text-[80px] font-serif font-bold italic mb-0 leading-none truncate px-6 drop-shadow-md">
                                {nickname}
                            </div>
                            <div className="text-[#FDFAE5]/90 text-lg md:text-xl font-sans mt-2 font-bold uppercase tracking-[0.2em] relative inline-block">
                                <span className="absolute -left-6 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-[#FDFAE5]/50"></span>
                                {team ? team.name : 'Unassigned'}
                                <span className="absolute -right-6 top-1/2 -translate-y-1/2 w-4 h-[1px] bg-[#FDFAE5]/50"></span>
                            </div>
                        </div>
                    </div>
                </div>


                {/* 2. ALL PLAYERS SECTION */}
                <div className="flex flex-col mb-12 flex-grow">

                    <h2 className="text-[#3F3D39] dark:text-yellow-50 text-3xl md:text-[32px] font-serif font-bold italic mb-4 pl-2 tracking-tight">
                        All Players ({allPlayers.length})
                    </h2>

                    <div className="flex flex-col gap-6 mb-8">

                        {/* Map through Defined Teams first */}
                        {teams.map((t, idx) => {
                            const teamPlayers = allPlayers.filter(p => p.teamId === t.id);

                            return (
                                <div
                                    key={t.id}
                                    className="w-full"
                                >
                                    <div
                                        className="w-full relative rounded-[20px] p-2 shadow-md transition-transform hover:scale-[1.01]"
                                        style={{ backgroundColor: t.color }}
                                    >
                                        <div className="absolute inset-[8px] rounded-[14px] border border-[#FDFAE5]/20 pointer-events-none z-10"></div>

                                        {/* Top Logo Asset */}
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
                                            <TopLogo className="w-12 h-auto" />
                                        </div>

                                        <div className="relative z-10 p-3 pt-4 flex flex-col items-start gap-4">
                                            <div className="text-[#FDFAE5] text-sm font-bold font-sans uppercase tracking-widest pl-1">
                                                {t.name}
                                            </div>

                                            <div className="flex flex-wrap gap-2">
                                                {teamPlayers.length > 0 ? (
                                                    teamPlayers.map(p => (
                                                        <div
                                                            key={p.id}
                                                            className="px-4 py-2 rounded-[6px] bg-[#FDFAE5] shadow-sm flex items-center justify-center transition-colors"
                                                        >
                                                            <span
                                                                className="text-lg font-serif font-bold italic leading-none"
                                                                style={{ color: t.color }}
                                                            >
                                                                {p.nickname} {p.id === playerId && '(You)'}
                                                            </span>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="opacity-60 text-[#FDFAE5] font-serif italic text-sm py-1 pl-1">
                                                        Awaiting agents...
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Unassigned Players (if any) */}
                        {unassignedPlayers.length > 0 && (
                            <div className="w-full">
                                <div className="w-full relative rounded-[14px] p-2 shadow-md bg-stone-500 dark:bg-stone-700">
                                    <div className="absolute inset-[5px] rounded-[9px] border border-[#FDFAE5]/50 pointer-events-none"></div>

                                    <div className="relative z-10 p-3 pt-4 flex flex-col items-start gap-4">
                                        <div className="text-[#FDFAE5] text-sm font-bold font-sans uppercase tracking-widest pl-1">
                                            Unassigned
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {unassignedPlayers.map(p => (
                                                <div
                                                    key={p.id}
                                                    className="px-4 py-2 rounded-[6px] bg-[#FDFAE5] shadow-sm flex items-center justify-center transition-colors"
                                                >
                                                    <span className="text-stone-700 text-lg font-serif font-bold italic leading-none">
                                                        {p.nickname} {p.id === playerId && '(You)'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                    </div>
                </div>

            </div>

            {/* Game Code Display (Footer) */}
            <div className="relative z-10 text-center mt-auto mb-8 opacity-70 w-full">
                <div className="text-[#3F3D39] dark:text-yellow-50 font-[family-name:var(--font-nohemi)] text-sm font-bold">
                    Waiting for host to start...
                </div>
                <div className="text-[#3F3D39] dark:text-yellow-50 font-[family-name:var(--font-perfectly-nostalgic)] text-2xl mt-1 tracking-widest bg-white/20 dark:bg-black/20 inline-block px-4 py-1 rounded-full border border-black/10 dark:border-white/10">
                    Code: {gameCode}
                </div>
            </div>
        </div>
    );
};
