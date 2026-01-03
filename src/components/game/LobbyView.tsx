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

    const getTeamBorderColor = (teamName?: string) => {
        // Simple mapping based on team name or fallback to a standard color
        if (!teamName) return 'border-[#333]';
        const lower = teamName.toLowerCase();
        if (lower.includes('vermont') || lower.includes('green')) return 'border-green-600';
        if (lower.includes('yangon') || lower.includes('blue')) return 'border-blue-600';
        if (lower.includes('york') || lower.includes('yellow')) return 'border-yellow-500';
        return 'border-[#333]'; // Default
    };

    return (
        <PageTransition>
            <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] flex flex-col items-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
                {/* Decorative Background - Reuse from Join Page for consistency */}
                <div className="absolute top-10 flex flex-col items-center gap-2">
                    <h2 className="text-3xl font-serif italic text-black/80 dark:text-[#FDFAE5]">Cards of Crisis</h2>
                    {/* Color bar placeholder */}
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-0.5 border-2 border-[#333] dark:border-[#FDFAE5] px-2 py-1 rounded-full bg-transparent items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] z-0"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937] z-10"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3] z-20"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936] z-30"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F44336] z-40"></div>
                    </div>
                </div>


                <div className="w-full max-w-lg relative z-10 mt-32">

                    {/* My Player Card */}
                    <div className={`bg-white dark:bg-[#FDFAE5] border-[6px] rounded-2xl p-8 mb-12 text-center shadow-lg transition-colors ${team ? '' : 'border-[#333] dark:border-[#FDFAE5]'}`}
                        style={{ borderColor: team?.color }}>

                        {/* Team Color Strip at top (optional based on design, but good for feedback) */}
                        {team && (
                            <div className="absolute top-0 left-0 w-full h-4 rounded-t-lg" style={{ backgroundColor: team.color }}></div>
                        )}

                        <h1 className="text-6xl font-serif italic text-[#333] dark:text-[#3E3E3C] mb-2 tracking-tight">
                            {nickname}
                        </h1>
                        <p className="text-xl text-[#666] dark:text-[#3E3E3C]/70 font-medium">
                            {team ? team.name : 'Waiting for team...'}
                        </p>
                    </div>

                    {/* All Players List */}
                    <div className="mb-8">
                        <h3 className="text-3xl font-serif italic text-[#333] dark:text-[#FDFAE5] mb-4">
                            All Players ({allPlayers.length})
                        </h3>

                        <div className="space-y-4">
                            {/* Group by Teams */}
                            {teams.map(t => {
                                const teamPlayers = allPlayers.filter(p => p.teamId === t.id);
                                if (teamPlayers.length === 0) return null;

                                return (
                                    <div key={t.id} className="bg-white dark:bg-[#FDFAE5] border-[4px] rounded-xl overflow-hidden shadow-sm"
                                        style={{ borderColor: t.color }}>
                                        {/* Team Header */}
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-[#FDFAE5] border-b-2" style={{ borderColor: `${t.color}33`, color: t.color }}>
                                            <span className="text-sm font-bold uppercase tracking-wider text-[#333] dark:text-[#3E3E3C]">{t.name}</span>
                                        </div>

                                        {/* Player Chips */}
                                        <div className="p-4 flex flex-wrap gap-2">
                                            {teamPlayers.map(p => (
                                                <div key={p.id} className="border-[3px] border-[#333] dark:border-[#3E3E3C] rounded-lg px-3 py-1 font-serif italic font-bold text-lg bg-white dark:bg-[#FDFAE5] text-[#333] dark:text-[#3E3E3C] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(62,62,60,1)]">
                                                    {p.nickname} {p.id === playerId && '(You)'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}

                            {/* Unassigned Players */}
                            {(() => {
                                const unassigned = allPlayers.filter(p => !p.teamId);
                                if (unassigned.length === 0) return null;
                                return (
                                    <div className="bg-white dark:bg-[#FDFAE5] border-[4px] border-[#666] dark:border-[#FDFAE5] rounded-xl overflow-hidden shadow-sm border-dashed">
                                        <div className="px-4 py-2 bg-gray-50 dark:bg-[#FDFAE5] border-b-2 border-[#666] dark:border-[#3E3E3C]/20">
                                            <span className="text-sm font-bold uppercase tracking-wider text-[#666] dark:text-[#3E3E3C]">Unassigned</span>
                                        </div>
                                        <div className="p-4 flex flex-wrap gap-2">
                                            {unassigned.map(p => (
                                                <div key={p.id} className="border-[2px] border-[#666] dark:border-[#3E3E3C] rounded-lg px-3 py-1 text-gray-500 dark:text-[#3E3E3C] font-medium bg-gray-50 dark:bg-[#FDFAE5]">
                                                    {p.nickname} {p.id === playerId && '(You)'}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )
                            })()}
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="fixed bottom-6 left-0 right-0 text-center pointer-events-none">
                    {/* Game Code - Discreetly shown as in mock */}
                </div>

                {/* Footer Logos */}
                <div className="absolute bottom-6 right-6 flex items-center gap-6 opacity-80 pointer-events-none hidden md:flex">
                    <span className="text-xs font-bold text-[#333] dark:text-[#FDFAE5]">Game PIN: {gameCode}</span>
                    <div className="h-4 w-[1px] bg-[#333] dark:bg-[#FDFAE5]"></div>

                    <div className="flex flex-col items-center">
                        <div className="w-6 h-6 rotate-45 bg-[#EBA937] overflow-hidden grid grid-cols-2">
                            <div className="bg-[#EBA937]"></div>
                            <div className="bg-white/30 rounded-full scale-150 transform -translate-x-1 translate-y-1"></div>
                        </div>
                        <span className="text-[8px] font-bold text-[#333] dark:text-[#FDFAE5] mt-1 leading-tight text-center">the<br />change<br />lab</span>
                    </div>
                    <div className="h-6 w-[1px] bg-[#333] dark:bg-[#FDFAE5]"></div>
                    <div className="flex flex-col items-center">
                        <span className="text-sm font-serif italic font-bold text-[#333] dark:text-[#FDFAE5]">Cards of Crisis</span>
                        <div className="flex gap-0.5 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-[#4CAF50] rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-[#EBA937] rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-[#2196F3] rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-[#ED8936] rounded-full"></div>
                            <div className="w-1.5 h-1.5 bg-[#F44336] rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
};
