"use client"

import React, { useEffect, useState, use } from 'react';
import { useGamePolling } from '@/hooks/useGamePolling';
import { useGameSounds } from '@/hooks/useGameSounds';
import {
    Clock, Trophy, Target, Loader2, AlertCircle, Users
} from 'lucide-react';

interface PlayerData {
    id: number;
    nickname: string;
    team: string | null;
    score: number;
    hasResponded: boolean;
}

interface HostData {
    game: {
        id: string;
        gameCode: string;
        status: string;
        currentCardIndex: number;
        lastCardStartedAt: string | null;
        totalCards: number;
    };
    currentCard: {
        id: number;
        title: string;
        description: string;
        timeLimit: number;
    };
    players: PlayerData[];
    teams: {
        id: string;
        name: string;
        color: string;
    }[];
    teamStats: Record<string, {
        playerCount: number;
        avgScore: number;
        responseRate: number;
    }>;
    totalPlayers: number;
    respondedCount: number;
}

export default function SpectatorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const gameId = resolvedParams.id;

    const [hostData, setHostData] = useState<HostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // Reuse the Host API (it's cached and contains everything we need)
    const fetchHostData = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/games/${gameId}/host`);
            if (!res.ok) {
                if (res.status === 403) throw new Error('Access denied');
                throw new Error('Failed to fetch game data');
            }
            const data = await res.json();
            setHostData(data);
            setError('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error fetching spectator data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    // Initial Load
    useEffect(() => {
        fetchHostData();
    }, [fetchHostData]);

    // Real-time Update
    useGamePolling({
        interval: 3000,
        enabled: !!hostData,
        gameCode: hostData?.game.gameCode,
        onPoll: fetchHostData
    });

    // Timer Logic
    useEffect(() => {
        if (hostData?.game.lastCardStartedAt && hostData?.currentCard) {
            const startTime = new Date(hostData.game.lastCardStartedAt).getTime();
            const now = new Date().getTime();
            const timeLimitSeconds = (hostData.currentCard.timeLimit || 5) * 60;
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(0, timeLimitSeconds - elapsedSeconds);
            setTimeLeft(remaining);
        }
    }, [hostData]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Sound Effects (This is the main audio source for the room)
    const { playJoin, playTick, playNotification, playSuccess } = useGameSounds();

    // Refs for sound triggers
    const prevPlayerCountRef = React.useRef(0);
    const prevCardIndexRef = React.useRef<number | null>(null);
    const prevStatusRef = React.useRef<string | null>(null);

    useEffect(() => {
        if (!hostData) return;

        // Join Sound
        if (hostData.players.length > prevPlayerCountRef.current && prevPlayerCountRef.current > 0) playJoin();
        prevPlayerCountRef.current = hostData.players.length;

        // New Card Sound
        if (prevCardIndexRef.current !== null && hostData.game.currentCardIndex !== prevCardIndexRef.current) playNotification();
        prevCardIndexRef.current = hostData.game.currentCardIndex;

        // Game Over Sound
        if (prevStatusRef.current !== 'COMPLETED' && hostData.game.status === 'COMPLETED') playSuccess();
        prevStatusRef.current = hostData.game.status;

    }, [hostData, playJoin, playNotification, playSuccess]);

    // Tick Sound
    useEffect(() => {
        if (hostData?.game.status === 'IN_PROGRESS') {
            const timer = setInterval(() => {
                setTimeLeft(prev => {
                    const newVal = Math.max(0, prev - 1);
                    if (newVal <= 10 && newVal > 0) playTick();
                    return newVal;
                });
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [hostData?.game.status, playTick]);


    // --- UI RENDER ---

    if (loading) return <div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" size={64} /></div>;
    if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-red-500 font-bold text-2xl"><AlertCircle size={32} className="mr-3" /> {error}</div>;
    if (!hostData) return null;

    const teamsSorted = [...hostData.teams].sort((a, b) => {
        const statsA = hostData.teamStats[a.name] || { avgScore: 0 };
        const statsB = hostData.teamStats[b.name] || { avgScore: 0 };
        return statsB.avgScore - statsA.avgScore;
    });

    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans overflow-hidden flex flex-col">

            {/* Header: High Visibility Info */}
            <header className="flex items-center justify-between px-8 py-6 bg-gray-900 border-b-4 border-gray-800">
                <div className="flex items-center gap-8">
                    <div className="bg-blue-600 px-6 py-2 rounded-xl">
                        <span className="block text-xs font-bold text-blue-200 uppercase tracking-widest mb-1">JOIN AT CRISIS.APP</span>
                        <span className="text-4xl font-black text-white tracking-widest font-mono">{hostData.game.gameCode}</span>
                    </div>
                </div>

                <div className="flex items-center gap-12">
                    <div className="text-center">
                        <span className="block text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">ROUND</span>
                        <span className="text-3xl font-black text-white">{hostData.game.currentCardIndex + 1} <span className="text-gray-600 text-xl">/ {hostData.game.totalCards}</span></span>
                    </div>

                    <div className={`text-center px-8 py-2 rounded-xl border-4 ${timeLeft < 30 ? 'bg-red-900/20 border-red-500' : 'bg-gray-800 border-gray-700'}`}>
                        <span className="block text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">TIME REMAINING</span>
                        <span className={`text-6xl font-black tabular-nums ${timeLeft < 30 ? 'text-red-500' : 'text-white'}`}>
                            {formatTime(timeLeft)}
                        </span>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <main className="flex-1 grid grid-cols-12 gap-8 p-8">

                {/* Left: Current Crisis (Huge) */}
                <div className="col-span-8 flex flex-col justify-center">
                    <div className="bg-gray-900 border-2 border-gray-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-2 h-full bg-red-500"></div>

                        <div className="mb-8">
                            <span className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 px-4 py-2 rounded-full font-bold uppercase tracking-widest text-sm mb-6">
                                <Target size={18} /> Current Crisis
                            </span>
                            <h1 className="text-6xl font-black leading-tight mb-6 text-white drop-shadow-md">
                                {hostData.currentCard.title}
                            </h1>
                            <p className="text-3xl text-gray-300 leading-relaxed font-medium">
                                {hostData.currentCard.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right: Real-time Leaderboard */}
                <div className="col-span-4 flex flex-col gap-6">
                    <div className="bg-gray-900 border-2 border-gray-800 rounded-2xl p-6 flex-1 shadow-xl">
                        <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
                            <Trophy className="text-yellow-500" size={32} /> LIVE STANDINGS
                        </h2>

                        <div className="space-y-4">
                            {teamsSorted.map((team, idx) => {
                                const stats = hostData.teamStats[team.name] || { avgScore: 0, responseRate: 0 };
                                const isLeaders = idx === 0 && stats.avgScore > 0;

                                return (
                                    <div key={team.id} className={`p-4 rounded-xl transition-all duration-500 border-2 ${isLeaders ? 'bg-yellow-900/10 border-yellow-500/50' : 'bg-gray-800 border-gray-700'}`}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="flex items-center gap-4">
                                                <span className={`text-2xl font-black w-8 text-center ${isLeaders ? 'text-yellow-500' : 'text-gray-500'}`}>
                                                    {idx + 1}
                                                </span>
                                                <span className="text-xl font-bold text-white truncate max-w-[150px]" style={{ color: team.color }}>
                                                    {team.name}
                                                </span>
                                            </div>
                                            <span className="text-3xl font-black text-white">{stats.avgScore}</span>
                                        </div>

                                        {/* Response Progress Bar */}
                                        <div className="w-full bg-gray-950 rounded-full h-2 mt-2">
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${stats.responseRate}%`,
                                                    backgroundColor: team.color,
                                                    opacity: stats.responseRate > 0 ? 1 : 0.2
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer: Response Status */}
            <footer className="bg-gray-900 border-t border-gray-800 p-8">
                <div className="max-w-4xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-4 mb-3">
                        <Users className="text-gray-400" />
                        <span className="text-2xl font-bold text-gray-300">
                            {hostData.respondedCount} / {hostData.totalPlayers} Responded
                        </span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-6 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500 relative"
                            style={{ width: `${(hostData.respondedCount / Math.max(1, hostData.totalPlayers)) * 100}%` }}
                        >
                            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
