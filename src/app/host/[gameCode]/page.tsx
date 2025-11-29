"use client"

import React, { useEffect, useState, use, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Clock, AlertTriangle, CheckCircle, XCircle, Play, Pause, RotateCcw, Save, LogOut, Loader2 } from 'lucide-react';

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
    teamStats: {
        RED: { playerCount: number; avgScore: number; responseRate: number };
        BLUE: { playerCount: number; avgScore: number; responseRate: number };
    };
    totalPlayers: number;
    respondedCount: number;
}

export default function HostControlPage({ params }: { params: Promise<{ gameCode: string }> }) {
    const resolvedParams = use(params);
    const gameCode = resolvedParams.gameCode;
    const router = useRouter();

    const [hostData, setHostData] = useState<HostData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    // Fetch host data
    const fetchHostData = useCallback(async () => {
        try {
            const res = await fetch(`/api/game/${gameCode}/host`);

            if (res.status === 401) {
                router.push(`/auth/signin?callbackUrl=/host/${gameCode}`);
                return;
            }

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
    }, [gameCode, router]);

    useEffect(() => {
        fetchHostData();
        const interval = setInterval(fetchHostData, 3000); // Poll every 3 seconds
        return () => clearInterval(interval);
    }, [gameCode, fetchHostData]);

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
            alert('Failed to update game status');
        }
    };

    const handleNextCard = async () => {
        if (!confirm('Advance to the next card?')) return;

        try {
            const res = await fetch(`/api/game/${gameCode}/next`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to advance card');
            fetchHostData();
        } catch (err) {
            console.error('Error advancing card:', err);
            alert('Failed to advance to next card');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="animate-spin mx-auto mb-4" size={48} />
                    <p className="text-gray-600 font-bold">Loading host control...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
                <div className="bg-white border-4 border-red-500 rounded-xl p-8 max-w-md">
                    <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                    <h2 className="text-2xl font-black text-center mb-2">Access Denied</h2>
                    <p className="text-gray-700 text-center">{error}</p>
                    <button
                        onClick={() => router.push('/admin/games/manage')}
                        className="mt-6 w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg border-2 border-blue-600"
                    >
                        Go to Game Management
                    </button>
                </div>
            </div>
        );
    }

    if (!hostData) return null;

    const progressPercent = hostData.totalPlayers > 0
        ? (hostData.respondedCount / hostData.totalPlayers) * 100
        : 0;

    return (
        <div className="min-h-screen bg-gray-100 p-4">
            {/* Header */}
            <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Users size={32} className="text-yellow-600" />
                            <h1 className="text-3xl font-black">HOST CONTROL</h1>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap">
                            <span className="text-2xl font-black text-blue-600">
                                {hostData.game.gameCode}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-bold border-2 ${hostData.game.status === 'IN_PROGRESS'
                                ? 'bg-green-100 text-green-800 border-green-600'
                                : hostData.game.status === 'PAUSED'
                                    ? 'bg-orange-100 text-orange-800 border-orange-600'
                                    : 'bg-gray-100 text-gray-800 border-gray-600'
                                }`}>
                                {hostData.game.status}
                            </span>
                            <span className="text-gray-600 font-bold">
                                Card {hostData.game.currentCardIndex + 1} of {hostData.game.totalCards}
                            </span>
                        </div>
                    </div>

                    {/* Timer */}
                    <div className="flex items-center gap-3">
                        <div className="text-center">
                            <Clock size={24} className="mx-auto mb-1 text-gray-600" />
                            <div className="text-3xl font-black">
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>

                    {/* Controls */}
                    <div className="flex gap-2 flex-wrap">
                        {hostData.game.status === 'IN_PROGRESS' && (
                            <button
                                onClick={() => handleGameAction('pause')}
                                className="px-4 py-2 bg-orange-500 text-white font-bold rounded-lg border-2 border-orange-600 flex items-center gap-2"
                            >
                                <Pause size={16} /> Pause
                            </button>
                        )}
                        {hostData.game.status === 'PAUSED' && (
                            <button
                                onClick={() => handleGameAction('resume')}
                                className="px-4 py-2 bg-green-500 text-white font-bold rounded-lg border-2 border-green-600 flex items-center gap-2"
                            >
                                <Play size={16} /> Resume
                            </button>
                        )}
                        <button
                            onClick={handleNextCard}
                            className="px-4 py-2 bg-blue-500 text-white font-bold rounded-lg border-2 border-blue-600 flex items-center gap-2"
                        >
                            <RotateCcw size={16} /> Next Card
                        </button>
                        <button
                            onClick={() => handleGameAction('stop')}
                            className="px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-red-600 flex items-center gap-2"
                        >
                            <LogOut size={16} /> End Game
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content - 2 columns */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Current Card */}
                    <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-xl font-black mb-4 flex items-center gap-2">
                            <CheckCircle size={24} className="text-purple-600" />
                            CURRENT CARD
                        </h2>
                        <h3 className="text-2xl font-bold mb-3">{hostData.currentCard.title}</h3>
                        <p className="text-gray-700 mb-4">{hostData.currentCard.description}</p>

                        {/* Response Options */}
                        <div className="space-y-2">
                            <h4 className="font-bold text-sm text-gray-600 uppercase">Response Options:</h4>
                            {hostData.currentCard.responses.map((response, idx) => (
                                <div key={response.id} className="bg-gray-50 border-2 border-gray-300 rounded-lg p-3">
                                    <div className="font-bold mb-2">{String.fromCharCode(65 + idx)}. {response.text}</div>
                                    <div className="flex gap-2 text-xs flex-wrap">
                                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded font-bold min-w-[60px] text-center">
                                            POL: {response.politicalEffect > 0 ? '+' : ''}{response.politicalEffect}
                                        </span>
                                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded font-bold min-w-[60px] text-center">
                                            ECO: {response.economicEffect > 0 ? '+' : ''}{response.economicEffect}
                                        </span>
                                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded font-bold min-w-[60px] text-center">
                                            INF: {response.infrastructureEffect > 0 ? '+' : ''}{response.infrastructureEffect}
                                        </span>
                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded font-bold min-w-[60px] text-center">
                                            SOC: {response.societyEffect > 0 ? '+' : ''}{response.societyEffect}
                                        </span>
                                        <span className="px-2 py-1 bg-teal-100 text-teal-800 rounded font-bold min-w-[60px] text-center">
                                            ENV: {response.environmentEffect > 0 ? '+' : ''}{response.environmentEffect}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Player Responses */}
                    <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-black flex items-center gap-2">
                                <Users size={24} className="text-blue-600" />
                                PLAYER RESPONSES
                            </h2>
                            <div className="text-sm font-bold">
                                {hostData.respondedCount} / {hostData.totalPlayers} responded
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4 bg-gray-200 h-4 rounded-full overflow-hidden border-2 border-black">
                            <div
                                className="bg-green-500 h-full transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>

                        {/* Players Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {hostData.players.map(player => {
                                const selectedResponse = player.responseId
                                    ? hostData.currentCard.responses.find(r => r.id === player.responseId)
                                    : null;
                                const responseIndex = selectedResponse
                                    ? hostData.currentCard.responses.findIndex(r => r.id === player.responseId)
                                    : -1;

                                return (
                                    <div
                                        key={player.id}
                                        className={`p-3 rounded-lg border-2 ${player.team === 'RED'
                                            ? 'bg-red-50 border-red-300'
                                            : player.team === 'BLUE'
                                                ? 'bg-blue-50 border-blue-300'
                                                : 'bg-gray-50 border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {player.hasResponded ? (
                                                    <CheckCircle size={20} className="text-green-600" />
                                                ) : (
                                                    <XCircle size={20} className="text-gray-400" />
                                                )}
                                                <span className="font-bold">{player.nickname}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {player.team && (
                                                    <span className={`px-2 py-0.5 rounded text-xs font-bold ${player.team === 'RED'
                                                        ? 'bg-red-600 text-white'
                                                        : 'bg-blue-600 text-white'
                                                        }`}>
                                                        {player.team}
                                                    </span>
                                                )}
                                                <span className="text-sm text-gray-600">{player.score} pts</span>
                                            </div>
                                        </div>
                                        {player.hasResponded && selectedResponse && (
                                            <div className="mt-2 text-sm font-bold text-gray-700">
                                                → {String.fromCharCode(65 + responseIndex)}: {selectedResponse.text}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Sidebar - 1 column */}
                <div className="space-y-6">
                    {/* Team Stats */}
                    <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-xl font-black mb-4">TEAM STATS</h2>

                        {/* RED Team */}
                        <div className="mb-4 p-4 bg-red-50 border-2 border-red-300 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-red-600">RED TEAM</h3>
                                <Users size={20} className="text-red-600" />
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Players:</span>
                                    <span className="font-bold">{hostData.teamStats.RED.playerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Avg Score:</span>
                                    <span className="font-bold">{hostData.teamStats.RED.avgScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Response Rate:</span>
                                    <span className="font-bold">{hostData.teamStats.RED.responseRate}%</span>
                                </div>
                            </div>
                        </div>

                        {/* BLUE Team */}
                        <div className="p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="font-black text-blue-600">BLUE TEAM</h3>
                                <Users size={20} className="text-blue-600" />
                            </div>
                            <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Players:</span>
                                    <span className="font-bold">{hostData.teamStats.BLUE.playerCount}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Avg Score:</span>
                                    <span className="font-bold">{hostData.teamStats.BLUE.avgScore}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Response Rate:</span>
                                    <span className="font-bold">{hostData.teamStats.BLUE.responseRate}%</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="bg-white border-4 border-black rounded-xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-xl font-black mb-4">QUICK STATS</h2>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-bold">Total Players</span>
                                <span className="text-2xl font-black">{hostData.totalPlayers}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-bold">Responses</span>
                                <span className="text-2xl font-black text-green-600">{hostData.respondedCount}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="text-gray-600 font-bold">Waiting</span>
                                <span className="text-2xl font-black text-orange-600">
                                    {hostData.totalPlayers - hostData.respondedCount}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
