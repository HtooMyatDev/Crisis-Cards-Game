import React, { useEffect, useState } from 'react';
import { Gamepad2, User, Crown } from 'lucide-react';
import { gameService } from '@/services/gameService';

interface GameResultsData {
    gameName: string;
    gameCode: string;
    winners: Array<{ id: string; name: string }>;
    teams: Array<{
        id: string;
        name: string;
        color: string;
        score: number;
        players: Array<{ id: number; nickname: string; responsesCount: number; team?: { id: string; name: string; color: string } }>;
    }>;
}

interface GameResultsProps {
    gameCode: string;
    onJoinAnother: () => void;
}

export const GameResults: React.FC<GameResultsProps> = ({ gameCode, onJoinAnother }) => {
    const [results, setResults] = useState<GameResultsData | null>(null);

    useEffect(() => {
        const loadResults = async () => {
            try {
                const data = await gameService.fetchResults(gameCode);
                setResults(data);
            } catch (error) {
                console.error('Error loading results:', error);
            }
        };
        loadResults();
    }, [gameCode]);

    if (!results) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] flex items-center justify-center text-gray-900 dark:text-white font-[family-name:var(--font-roboto)] transition-colors duration-500">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-gray-300 dark:border-white/20 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
                    <span className="uppercase tracking-widest opacity-60">Calculating Outcome...</span>
                </div>
            </div>
        );
    }

    const isTie = results.winners.length !== 1;
    const winnerTeam = !isTie ? null : results.teams.find(t => t.id === results.winners[0].id);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0B0F19] text-gray-900 dark:text-white p-4 md:p-8 font-[family-name:var(--font-roboto)] relative overflow-hidden transition-colors duration-500">
            {/* Background decorative elements */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/5 dark:bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[800px] h-[400px] bg-purple-500/5 dark:bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header / Winner Display */}
                <div className="text-center mb-16 pt-8">
                    {isTie ? (
                        <>
                            <h1 className="text-6xl md:text-8xl font-[family-name:var(--font-russo)] uppercase tracking-wider mb-2 text-transparent bg-clip-text bg-gradient-to-b from-gray-700 to-gray-900 dark:from-gray-100 dark:to-gray-400 drop-shadow-2xl">
                                Stalemate
                            </h1>
                            <p className="text-xl text-gray-500 dark:text-gray-400 uppercase tracking-[0.3em] font-bold">The crisis remains unresolved</p>
                        </>
                    ) : (
                        <>
                            <div className="flex justify-center mb-6">
                                <Crown className="w-20 h-20 text-yellow-500 dark:text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)] animate-bounce" />
                            </div>
                            <h1 className="text-6xl md:text-9xl font-[family-name:var(--font-russo)] uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 via-yellow-500 to-yellow-700 drop-shadow-2xl">
                                Victory
                            </h1>
                            <p className="text-2xl font-[family-name:var(--font-russo)] uppercase tracking-widest text-gray-600 dark:text-white/80">
                                Team <span style={{ color: winnerTeam?.color }} className="drop-shadow-lg filter brightness-90 dark:brightness-100">{winnerTeam?.name}</span> dominates
                            </p>
                        </>
                    )}
                </div>

                {/* Teams Showcase */}
                <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-20">
                    {results.teams.map((team) => {
                        const isWinner = results.winners.some(w => w.id === team.id);

                        return (
                            <div
                                key={team.id}
                                className={`relative group rounded-3xl p-1 transition-all duration-500 ${isWinner ? 'scale-105 z-10' : 'opacity-80 hover:opacity-100 hover:scale-[1.02]'}`}
                            >
                                {/* Glow Border */}
                                <div className="absolute inset-0 rounded-3xl opacity-20 group-hover:opacity-40 transition-opacity bg-gradient-to-b from-black/10 dark:from-white/20 to-transparent" style={{ backgroundColor: team.color }}></div>

                                <div className="relative h-full bg-white dark:bg-[#131B2C] border border-gray-200 dark:border-white/5 rounded-[1.4rem] overflow-hidden flex flex-col shadow-xl dark:shadow-2xl">
                                    {/* Team Header */}
                                    <div className="relative p-6 md:p-8 flex items-center justify-between overflow-hidden">
                                        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: team.color }}></div>
                                        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gray-900/10 dark:via-white/10 to-transparent" />

                                        <div className="relative z-10">
                                            <h2 className="text-3xl font-[family-name:var(--font-russo)] uppercase tracking-wider mb-1 text-gray-900 dark:text-white truncate max-w-[200px]">{team.name}</h2>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: team.color }} />
                                                <span className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest">Team Stats</span>
                                            </div>
                                        </div>

                                        <div className="relative z-10 flex flex-col items-end">
                                            <span className="text-6xl font-[family-name:var(--font-russo)] text-gray-900 dark:text-white leading-none drop-shadow-sm">{team.score}</span>
                                            <span className="text-gray-500 dark:text-white/40 text-xs font-bold uppercase tracking-widest mt-1">Total Score</span>
                                        </div>
                                    </div>

                                    {/* Player List */}
                                    <div className="p-6 md:p-8 space-y-3 bg-gray-50 dark:bg-black/20 flex-grow">
                                        {team.players.map((player, idx) => (
                                            <div key={player.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-white/5 group-hover:border-gray-300 dark:group-hover:border-white/10 shadow-sm dark:shadow-none">
                                                <div className="flex items-center gap-4">
                                                    <span className="w-6 h-6 flex items-center justify-center rounded bg-gray-200 dark:bg-white/10 text-xs font-bold text-gray-600 dark:text-white/60 font-mono">#{idx + 1}</span>
                                                    <span className="font-bold text-lg text-gray-900 dark:text-white/90">{player.nickname}</span>
                                                </div>
                                                <div className="px-3 py-1 rounded-full bg-gray-200 dark:bg-black/40 text-xs font-bold text-gray-600 dark:text-white/50 border border-gray-300 dark:border-white/5 uppercase tracking-wide">
                                                    {player.responsesCount} acts
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {isWinner && (
                                        <div className="absolute top-0 right-8 -translate-y-1/2 flex justify-center z-20">
                                            <div className="bg-yellow-500 text-black text-xs font-black uppercase px-3 py-1 rounded-full shadow-[0_0_15px_rgba(234,179,8,0.6)] flex items-center gap-1">
                                                <Crown size={12} fill="black" /> Champion
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Actions */}
                <div className="flex justify-center pb-12">
                    <button
                        onClick={onJoinAnother}
                        className="group relative px-12 py-6 bg-gray-900 dark:bg-white text-white dark:text-black font-[family-name:var(--font-russo)] text-xl uppercase tracking-widest hover:bg-yellow-400 dark:hover:bg-yellow-400 hover:text-black transition-all duration-300 hover:scale-105 shadow-xl"
                        style={{ clipPath: 'polygon(10% 0, 100% 0, 100% 70%, 90% 100%, 0 100%, 0 30%)' }}
                    >
                        <span className="relative z-10 flex items-center gap-3">
                            <Gamepad2 size={24} />
                            Start New Operation
                        </span>
                        <div className="absolute inset-0 bg-white/20 blur-lg opacity-0 group-hover:opacity-50 transition-opacity" />
                    </button>
                </div>

                {/* Meta info small */}
                <div className="text-center text-gray-400 dark:text-white/20 text-xs font-mono uppercase tracking-widest pb-8">
                    Operation Code: <span className="text-gray-600 dark:text-white/40">{results.gameCode}</span>
                </div>
            </div>
        </div>
    );
};
