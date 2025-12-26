"use client"

import React, { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Users, Clock, Play, Pause, Square, SkipForward,
    Trophy, Target, Loader2,
    AlertCircle, Activity, Eye
} from 'lucide-react';
import { useGamePolling } from '@/hooks/useGamePolling';

interface PlayerData {
    id: number;
    nickname: string;
    team: string | null;
    score: number;
    isConnected: boolean;
    hasResponded: boolean;
    responseId: number | null;
}

interface CardResponse {
    id: number;
    text: string;
    politicalEffect: number;
    economicEffect: number;
    infrastructureEffect: number;
    societyEffect: number;
    environmentEffect: number;
    score?: number;
    cost?: number;
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
        responses: CardResponse[];
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

export default function HostControlPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const gameId = resolvedParams.id;
    const router = useRouter();

    const [hostData, setHostData] = useState<HostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch host data
    const fetchHostData = React.useCallback(async () => {
        try {
            const res = await fetch(`/api/admin/games/${gameId}/host`);

            if (res.status === 403) {
                setError('Only the game host can access this view');
                setLoading(false);
                return;
            }

            if (!res.ok) {
                throw new Error('Failed to fetch host data');
            }

            const data = await res.json();
            setHostData(data);
            setError('');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            console.error('Error fetching host data:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [gameId]);

    // Initial fetch
    useEffect(() => {
        fetchHostData();
    }, [fetchHostData]);

    // Real-time updates (Pusher + Polling Fallback)
    useGamePolling({
        interval: 3000,
        enabled: !!hostData,
        gameCode: hostData?.game.gameCode,
        onPoll: fetchHostData
    });

    // Calculate time left
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

    // Timer countdown
    useEffect(() => {
        if (hostData?.game.status === 'IN_PROGRESS') {
            const timer = setInterval(() => {
                setTimeLeft(prev => Math.max(0, prev - 1));
            }, 1000);
            return () => clearInterval(timer);
        }
    }, [hostData?.game.status]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleGameAction = async (action: 'pause' | 'resume' | 'stop') => {
        const statusMap = {
            pause: 'PAUSED',
            resume: 'IN_PROGRESS',
            stop: 'COMPLETED'
        };

        const previousData = hostData;
        // Optimistic update
        if (hostData) {
            setHostData({
                ...hostData,
                game: {
                    ...hostData.game,
                    // @ts-ignore - status string compatibility
                    status: statusMap[action]
                }
            });
        }

        try {
            const res = await fetch(`/api/admin/games/${hostData?.game.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: statusMap[action] })
            });

            if (!res.ok) throw new Error('Failed to update game status');
            fetchHostData();
        } catch (err) {
            console.error('Error updating game:', err);
            // Revert optimistic update
            setHostData(previousData);
            alert('Failed to update game status');
        }
    };

    const handleNextCard = async () => {
        if (!confirm('Advance to the next card?')) return;

        const previousData = hostData;
        // Optimistic update
        if (hostData) {
            setHostData({
                ...hostData,
                game: {
                    ...hostData.game,
                    currentCardIndex: hostData.game.currentCardIndex + 1
                },
                // Reset player response state visually
                players: hostData.players.map(p => ({ ...p, hasResponded: false, responseId: null }))
            });
        }

        try {
            const res = await fetch(`/api/game/${hostData?.game.gameCode}/next`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to advance card');
            fetchHostData();
        } catch (err) {
            console.error('Error advancing card:', err);
            // Revert optimistic update
            setHostData(previousData);
            alert('Failed to advance to next card');
        }
    };

    const handleAssignPlayer = async (playerId: number, teamId: string) => {
        try {
            const res = await fetch(`/api/admin/games/${hostData?.game.id}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: [{ playerId, teamId }]
                })
            });

            if (!res.ok) throw new Error('Failed to assign player');
            fetchHostData();
        } catch (err) {
            console.error('Error assigning player:', err);
            alert('Failed to assign player');
        }
    };

    const handleStartGame = async () => {
        if (!confirm('Are you sure you want to start the game? Ensure teams are balanced.')) return;

        try {
            const res = await fetch(`/api/game/${hostData?.game.gameCode}/start`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to start game');
            fetchHostData();
        } catch (err) {
            console.error('Error starting game:', err);
            alert('Failed to start game');
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-600 dark:text-gray-400 font-bold">Loading host control...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
                <div className="bg-white dark:bg-gray-800 border-4 border-red-500 dark:border-red-400 rounded-xl p-8 max-w-md">
                    <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-black text-center mb-2 text-black dark:text-white">Access Denied</h2>
                    <p className="text-gray-700 dark:text-gray-300 text-center">{error}</p>
                    <button
                        onClick={() => router.push('/admin/games/manage')}
                        className="mt-6 w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg border-2 border-blue-600 dark:border-blue-400"
                    >
                        Go to Game Management
                    </button>
                </div>
            </div>
        );
    }

    if (!hostData) return null;


    // ----------- TEAM ASSIGNMENT VIEW -----------
    // Show when game is WAITING or IN_PROGRESS without cards started
    if ((hostData.game.status === 'WAITING' || (hostData.game.status === 'IN_PROGRESS' && !hostData.game.lastCardStartedAt))) {
        const unassignedPlayers = hostData.players.filter(p => !p.team);

        return (
            <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 mb-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-3xl font-black text-black dark:text-white mb-2">TEAM ASSIGNMENT</h1>
                                <p className="text-gray-600 dark:text-gray-400">Assign players to teams before starting the game.</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => router.push('/admin/games/manage')}
                                    className="px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg border-2 border-gray-300"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleStartGame}
                                    disabled={hostData.teams.some(t =>
                                        !hostData.players.some(p => p.team === t.name || p.team === t.id)
                                    )}
                                    className="px-6 py-2 bg-green-500 text-white font-bold rounded-lg border-2 border-green-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    <Play size={20} /> START GAME
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Unassigned Players */}
                            <div className="lg:col-span-1 bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border-2 border-gray-200 dark:border-gray-600">
                                <h2 className="font-bold text-lg mb-4 flex items-center justify-between text-black dark:text-white">
                                    <span>Unassigned ({unassignedPlayers.length})</span>
                                    <Users size={20} className="text-gray-400" />
                                </h2>
                                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                                    {unassignedPlayers.map(player => (
                                        <div key={player.id} className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm">
                                            <div className="font-bold mb-2 text-black dark:text-white">{player.nickname}</div>
                                            <div className="grid grid-cols-2 gap-2">
                                                {hostData.teams.map(team => (
                                                    <button
                                                        key={team.id}
                                                        onClick={() => handleAssignPlayer(player.id, team.id)}
                                                        className="px-2 py-1 text-xs font-bold rounded border transition-colors"
                                                        style={{
                                                            backgroundColor: `${team.color}20`,
                                                            color: team.color,
                                                            borderColor: team.color
                                                        }}
                                                    >
                                                        {team.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                    {unassignedPlayers.length === 0 && (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400 italic">
                                            All players assigned!
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Teams */}
                            <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                                {hostData.teams.map(team => {
                                    const teamPlayers = hostData.players.filter(p => p.team === team.name || p.team === team.id);
                                    return (
                                        <div key={team.id} className="bg-white dark:bg-gray-800 rounded-xl border-2 p-4" style={{ borderColor: team.color }}>
                                            <h3 className="font-black text-lg mb-3 flex items-center justify-between" style={{ color: team.color }}>
                                                {team.name.toUpperCase()}
                                                <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-sm text-black dark:text-white">
                                                    {teamPlayers.length}
                                                </span>
                                            </h3>
                                            <div className="space-y-2">
                                                {teamPlayers.map(player => (
                                                    <div key={player.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-100 dark:border-gray-600">
                                                        <span className="font-medium text-black dark:text-white">{player.nickname}</span>
                                                    </div>
                                                ))}
                                                {teamPlayers.length === 0 && (
                                                    <div className="text-center py-4 text-gray-400 text-sm italic">
                                                        No players yet
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    // ----------- MAIN GAME DASHBOARD -----------
    const teamsSortedByScore = [...hostData.teams].sort((a, b) => {
        const statsA = hostData.teamStats[a.name] || { avgScore: 0 };
        const statsB = hostData.teamStats[b.name] || { avgScore: 0 };
        return statsB.avgScore - statsA.avgScore;
    });

    const formatImpact = (val: number) => {
        if (val === 0) return null;
        return val > 0 ? `+${val}` : `${val}`;
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-4 font-sans">
            {/* Top Bar: Status */}
            <header className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-900 border-b-4 border-gray-200 dark:border-gray-800 p-4 mb-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-6">
                    <div className="text-center">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Game Code</span>
                        <span className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-wider font-mono">{hostData.game.gameCode}</span>
                    </div>

                    <div className="h-10 w-[2px] bg-gray-200 dark:bg-gray-800"></div>

                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${hostData.game.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                            {hostData.game.status === 'IN_PROGRESS' ? <Activity size={20} /> : <Pause size={20} />}
                        </div>
                        <div>
                            <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
                            <span className="font-bold text-black dark:text-white">{hostData.game.status}</span>
                        </div>
                    </div>

                    <div className="hidden md:block h-10 w-[2px] bg-gray-200 dark:bg-gray-800"></div>

                    <div className="hidden md:block">
                        <span className="block text-xs font-bold text-gray-400 uppercase tracking-widest">Round</span>
                        <span className="font-bold text-black dark:text-white">Card {hostData.game.currentCardIndex + 1} / {hostData.game.totalCards}</span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3 mt-4 md:mt-0">
                    <div className="flex flex-col items-center mr-4 px-4 border-r-2 border-gray-100 dark:border-gray-800">
                        <span className="text-3xl font-black text-black dark:text-white tabular-nums">{formatTime(timeLeft)}</span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Time Left</span>
                    </div>


                    {hostData.game.status === 'IN_PROGRESS' && (
                        <button onClick={() => handleGameAction('pause')} className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition-colors border-2 border-transparent">
                            <Pause size={20} />
                        </button>
                    )}
                    {hostData.game.status === 'PAUSED' && (
                        <button onClick={() => handleGameAction('resume')} className="p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors shadow-lg shadow-green-500/30">
                            <Play size={20} />
                        </button>
                    )}
                    <button onClick={handleNextCard} className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-lg shadow-blue-500/30 flex items-center gap-2 transition-all hover:scale-105 active:scale-95">
                        <SkipForward size={20} />
                        <span className="hidden sm:inline">Next</span>
                    </button>
                    <button onClick={() => handleGameAction('stop')} className="p-3 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors border-2 border-transparent">
                        <Square size={20} />
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* LEFT COL: Current Crisis (8 cols) */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                    {/* Active Card */}
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden flex-1">
                        <div className="bg-red-500 p-1"></div>
                        <div className="p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                                    <Target size={14} /> Only {formatTime(timeLeft)} remaining
                                </span>
                            </div>

                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 dark:text-white mb-6 leading-tight">
                                {hostData.currentCard.title}
                            </h2>
                            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                                {hostData.currentCard.description}
                            </p>

                            <div className="h-[1px] bg-gray-100 dark:bg-gray-800 mb-8"></div>

                            {/* Response Options Grid */}
                            <div className="grid grid-cols-1 gap-4">
                                {hostData.currentCard.responses.map((response, idx) => (
                                    <div key={response.id} className="group relative bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border-2 border-gray-100 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-500 transition-all cursor-default">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 w-10 h-10 bg-white dark:bg-gray-800 rounded-lg flex items-center justify-center font-black text-lg shadow-sm border border-gray-200 dark:border-gray-700">
                                                {String.fromCharCode(65 + idx)}
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-bold text-lg text-gray-900 dark:text-white mb-3">{response.text}</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {[
                                                        { label: 'Score', val: response.score, color: 'emerald' },
                                                        { label: 'Cost', val: response.cost ? -response.cost : 0, color: 'rose' },
                                                        { label: 'Political', val: response.politicalEffect, color: 'red' },
                                                        { label: 'Economic', val: response.economicEffect, color: 'blue' },
                                                        { label: 'Society', val: response.societyEffect, color: 'yellow' },
                                                        { label: 'Infra', val: response.infrastructureEffect, color: 'gray' },
                                                        { label: 'Env', val: response.environmentEffect, color: 'green' }
                                                    ].map((stat) => (
                                                        (stat.val !== undefined && stat.val !== 0) && (
                                                            <span key={stat.label} className={`
                                                                text-xs font-bold px-2 py-1 rounded border
                                                                ${stat.label === 'Cost' ? 'bg-red-100 text-red-800 border-red-200' :
                                                                    stat.label === 'Score' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                                                                        stat.val > 0
                                                                            ? 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:border-green-800'
                                                                            : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:border-red-800'
                                                                }
                                                            `}>
                                                                {stat.label}: {stat.label === 'Cost' ? `$${Math.abs(stat.val)}` : formatImpact(stat.val)}
                                                            </span>
                                                        )
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COL: Stats sidebar (4 cols) */}
                <div className="lg:col-span-4 space-y-6">

                    {/* Leaderboard Card */}
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center bg-gray-50 dark:bg-gray-900">
                            <h3 className="font-black text-gray-900 dark:text-white flex items-center gap-2">
                                <Trophy size={18} className="text-yellow-500" />
                                TEAM STANDINGS
                            </h3>
                            <span className="text-xs font-bold text-gray-400">AVG SCORE</span>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                            {teamsSortedByScore.map((team, idx) => {
                                const stats = hostData.teamStats[team.name] || { avgScore: 0, playerCount: 0, responseRate: 0 };
                                const teamPlayers = hostData.players.filter(p => p.team === team.name || p.team === team.id);

                                return (
                                    <div key={team.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <div className="font-black text-gray-300 w-4 text-center">{idx + 1}</div>
                                                <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: team.color }}></div>
                                                <span className="font-bold text-gray-900 dark:text-white" style={{ color: team.color }}>{team.name}</span>
                                            </div>
                                            <span className="font-black text-xl text-gray-900 dark:text-white">{stats.avgScore}</span>
                                        </div>

                                        {/* Team Progress Bar */}
                                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1.5 mb-3 overflow-hidden">
                                            <div
                                                className="h-full transition-all duration-500 rounded-full"
                                                style={{
                                                    width: `${stats.responseRate}%`,
                                                    backgroundColor: team.color
                                                }}
                                            />
                                        </div>

                                        {/* Mini Player Icons */}
                                        <div className="flex flex-wrap gap-1">
                                            {teamPlayers.map(p => {
                                                const responseIdx = hostData.currentCard.responses.findIndex(r => r.id === p.responseId);
                                                const responseLetter = responseIdx >= 0 ? String.fromCharCode(65 + responseIdx) : null;
                                                const response = responseLetter ? hostData.currentCard.responses[responseIdx] : null;

                                                return (
                                                    <div
                                                        key={p.id}
                                                        title={`${p.nickname}: ${p.score}pts ${response ? `(Selected ${responseLetter}: ${response.text})` : '(Thinking)'}`}
                                                        className={`
                                                            w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold border cursor-help transition-transform hover:scale-110
                                                            ${p.hasResponded
                                                                ? 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900/30'
                                                                : 'bg-gray-50 text-gray-400 border-gray-200 dark:bg-gray-800 dark:border-gray-700'
                                                            }
                                                        `}
                                                    >
                                                        {p.hasResponded ? responseLetter : p.nickname.substring(0, 1)}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Overall Progress */}
                    <div className="bg-white dark:bg-gray-900 border-2 border-gray-200 dark:border-gray-800 rounded-2xl shadow-sm p-6">
                        <div className="flex justify-between items-end mb-2">
                            <span className="text-xs font-bold text-gray-400 uppercase">Response Progress</span>
                            <span className="text-2xl font-black text-gray-900 dark:text-white">
                                {hostData.respondedCount}<span className="text-gray-300 text-lg">/{hostData.totalPlayers}</span>
                            </span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-4 overflow-hidden mb-2">
                            <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500 relative"
                                style={{ width: `${(hostData.respondedCount / Math.max(hostData.totalPlayers, 1)) * 100}%` }}
                            >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                            </div>
                        </div>
                        <p className="text-xs text-center text-gray-400 font-medium">
                            {hostData.totalPlayers - hostData.respondedCount} players still thinking
                        </p>
                    </div>

                </div>
            </div>
        </div>
    );
}
