"use client"
import React, { useEffect, useState } from 'react';
import { Gamepad2, Users, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/app/actions/auth';

interface UserStats {
    gamesHosted: number;
    gamesPlayed: number;
    completedGames: number;
    totalScore: number;
}

const UserHomePage = () => {
    const router = useRouter();
    const [gameCode, setGameCode] = useState('');
    const [joining, setJoining] = useState(false);
    const [error, setError] = useState('');
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loadingStats, setLoadingStats] = useState(true);

    const fetchUserStats = async () => {
        try {
            const res = await fetch('/api/user/stats');
            if (res.ok) {
                const data = await res.json();
                setUserStats(data.stats);
            }
        } catch (error) {
            console.error('Failed to fetch user stats', error);
        } finally {
            setLoadingStats(false);
        }
    };

    useEffect(() => {
        fetchUserStats();
    }, []);

    const handleJoinGame = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!gameCode.trim()) return;

        setJoining(true);
        setError('');

        try {
            const user = await getCurrentUser();
            const nickname = user ? user.name : `Agent-${Math.floor(Math.random() * 1000)}`;

            const res = await fetch('/api/game/join', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    gameCode,
                    nickname
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to join game');
            }

            sessionStorage.setItem('currentPlayerId', data.playerId.toString());
            sessionStorage.setItem('currentNickname', data.nickname);
            router.push(`/live/${data.gameCode}`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to join game');
            setJoining(false);
        }
    };

    // ... (keep existing stats and lastGame logic if needed, or remove if irrelevant)

    return (
        <div className="p-6">
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-4xl font-black text-black mb-2 tracking-tight">
                    AGENT DASHBOARD
                </h1>
                <p className="text-gray-600 font-bold">
                    Welcome back, Agent. Ready for your next mission?
                </p>
            </div>

            {/* Quick Actions Grid */}
            <div className="mb-8">
                {/* Join Game Card - Kahoot Style */}
                <div className="bg-blue-600 rounded-xl p-6 text-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] border-4 border-black relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-110"></div>

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-4">
                            <Gamepad2 size={32} className="text-white" />
                            <h2 className="text-2xl font-black uppercase tracking-wider">Join Mission</h2>
                        </div>

                        <p className="mb-6 font-medium text-blue-100 max-w-md">
                            Enter the secure access code to join an active crisis simulation.
                        </p>

                        <form onSubmit={handleJoinGame} className="flex flex-col sm:flex-row gap-3 max-w-lg">
                            <input
                                type="text"
                                value={gameCode}
                                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                                placeholder="GAME PIN"
                                className="flex-1 bg-white text-black font-black text-xl px-6 py-4 rounded-lg border-4 border-black focus:outline-none focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:text-gray-300 uppercase tracking-widest"
                                disabled={joining}
                            />
                            <button
                                type="submit"
                                disabled={joining || !gameCode.trim()}
                                className="bg-black text-white font-black text-xl px-8 py-4 rounded-lg border-4 border-black hover:bg-gray-900 active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {joining ? (
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        ENTER <ArrowRight size={24} />
                                    </>
                                )}
                            </button>
                        </form>
                        {error && (
                            <p className="mt-3 text-red-200 font-bold bg-red-900/30 inline-block px-3 py-1 rounded">
                                ! {error}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* User Stats Card */}
            <div className="bg-white border-4 border-black rounded-lg p-6
                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] mb-8">
                <div className="flex items-center gap-3 mb-6">
                    <Users size={24} className="text-purple-500" />
                    <h2 className="text-xl font-bold text-black">Your Statistics</h2>
                </div>
                {loadingStats ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    </div>
                ) : userStats ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 border-2 border-blue-600 rounded-lg p-4">
                            <p className="text-sm font-bold text-blue-600 mb-1">Games Hosted</p>
                            <p className="text-3xl font-black text-black">{userStats.gamesHosted}</p>
                        </div>
                        <div className="bg-indigo-50 border-2 border-indigo-600 rounded-lg p-4">
                            <p className="text-sm font-bold text-indigo-600 mb-1">Games Played</p>
                            <p className="text-3xl font-black text-black">{userStats.gamesPlayed || 0}</p>
                        </div>
                        <div className="bg-green-50 border-2 border-green-600 rounded-lg p-4">
                            <p className="text-sm font-bold text-green-600 mb-1">Completed</p>
                            <p className="text-3xl font-black text-black">{userStats.completedGames}</p>
                        </div>
                        <div className="bg-purple-50 border-2 border-purple-600 rounded-lg p-4">
                            <p className="text-sm font-bold text-purple-600 mb-1">Total Score</p>
                            <p className="text-3xl font-black text-black">{userStats.totalScore}</p>
                        </div>
                        <div className="bg-orange-50 border-2 border-orange-600 rounded-lg p-4">
                            <p className="text-sm font-bold text-orange-600 mb-1">Win Rate</p>
                            <p className="text-3xl font-black text-black">
                                {userStats.gamesHosted > 0 ? Math.round((userStats.completedGames / userStats.gamesHosted) * 100) : 0}%
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No stats available</p>
                )}
            </div>

        </div>
    );
};

export default UserHomePage;
