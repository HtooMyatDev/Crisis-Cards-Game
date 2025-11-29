"use client"
import React, { useState, useEffect } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Target, Award, Calendar } from 'lucide-react';

interface LeaderboardEntry {
    rank: number;
    nickname: string;
    totalScore: number;
    gamesPlayed: number;
    gamesWon: number;
    winRate: number;
    streak: number;
    avgScore: number;
    isCurrentUser?: boolean;
}

interface UserStats {
    totalPlayers: number;
    rank: number;
    winRate: number;
    rankChange: number;
}

const UserLeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('overall');
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [userStats, setUserStats] = useState<UserStats | null>(null);
    const [loading, setLoading] = useState(true);

    // Fetch leaderboard from API
    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/user/leaderboard');
                if (response.ok) {
                    const data = await response.json();
                    // Handle both old array format (fallback) and new object format
                    if (Array.isArray(data)) {
                        setLeaderboard(data);
                    } else {
                        setLeaderboard(data.leaderboard || []);
                        setUserStats(data.userStats || null);
                    }
                }
            } catch (error) {
                console.error('Failed to fetch leaderboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, [activeTab]);

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown size={24} className="text-yellow-500 dark:text-yellow-400" />;
            case 2:
                return <Medal size={24} className="text-gray-400 dark:text-gray-300" />;
            case 3:
                return <Medal size={24} className="text-amber-600 dark:text-amber-500" />;
            default:
                return <span className="text-lg font-bold text-gray-600 dark:text-gray-300">#{rank}</span>;
        }
    };

    const getRankColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 dark:from-yellow-500 dark:to-yellow-700';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 dark:from-gray-400 dark:to-gray-600';
            case 3:
                return 'bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700';
            default:
                return 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-black dark:text-white mb-2 transition-colors duration-200">
                        Leaderboard
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                        See how you rank against other crisis management experts
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                        transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-500 dark:bg-blue-600 border-2 border-black dark:border-gray-600
                                rounded-full flex items-center justify-center">
                                <Users size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white transition-colors duration-200">
                                    {userStats ? userStats.totalPlayers.toLocaleString() : '-'}
                                </p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                    Total Players
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                        transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-500 dark:bg-green-600 border-2 border-black dark:border-gray-600
                                rounded-full flex items-center justify-center">
                                <Trophy size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white transition-colors duration-200">
                                    {userStats && userStats.rank > 0 ? `#${userStats.rank}` : '-'}
                                </p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                    Your Rank
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                        transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-yellow-500 dark:bg-yellow-600 border-2 border-black dark:border-gray-600
                                rounded-full flex items-center justify-center">
                                <Target size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white transition-colors duration-200">
                                    {userStats ? `${userStats.winRate}%` : '-'}
                                </p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                    Win Rate
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                        transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-purple-500 dark:bg-purple-600 border-2 border-black dark:border-gray-600
                                rounded-full flex items-center justify-center">
                                <TrendingUp size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white transition-colors duration-200">
                                    {userStats ? (userStats.rankChange > 0 ? `+${userStats.rankChange}` : userStats.rankChange) : '-'}
                                </p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                    Rank Change
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 mb-6">
                    {[
                        { id: 'overall', label: 'Overall', icon: Trophy },
                        { id: 'monthly', label: 'This Month', icon: Calendar },
                        { id: 'weekly', label: 'This Week', icon: Star }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 text-white border-blue-800 dark:border-blue-500'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 text-black dark:text-white'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Leaderboard */}
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg
                    shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)]
                    overflow-hidden transition-all duration-200">
                    {/* Header */}
                    <div className="bg-gray-100 dark:bg-gray-700 border-b-2 border-black dark:border-gray-600 p-4
                        transition-colors duration-200">
                        <div className="grid grid-cols-12 gap-4 items-center font-bold text-sm text-black dark:text-white">
                            <div className="col-span-1 text-center">Rank</div>
                            <div className="col-span-4">Player</div>
                            <div className="col-span-2 text-center">Score</div>
                            <div className="col-span-2 text-center">Games</div>
                            <div className="col-span-2 text-center">Win Rate</div>
                            <div className="col-span-1 text-center">Streak</div>
                        </div>
                    </div>

                    {/* Leaderboard Rows */}
                    <div className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                        {loading ? (
                            <div className="p-12 text-center">
                                <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                <p className="text-gray-500 dark:text-gray-400 font-bold">Loading leaderboard...</p>
                            </div>
                        ) : leaderboard.length === 0 ? (
                            <div className="p-12 text-center">
                                <Trophy size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-500 dark:text-gray-400 font-bold">No players yet</p>
                            </div>
                        ) : (
                            leaderboard.map((player: LeaderboardEntry) => (
                                <div key={player.rank} className="p-4 transition-colors duration-200 dark:bg-gray-800">
                                    <div className="grid grid-cols-12 gap-4 items-center">
                                        {/* Rank */}
                                        <div className="col-span-1 text-center">
                                            {getRankIcon(player.rank)}
                                        </div>

                                        {/* Player Info */}
                                        <div className="col-span-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center font-bold text-sm ${getRankColor(player.rank)}`}>
                                                    {player.nickname.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold transition-colors duration-200 text-black dark:text-white">
                                                        {player.nickname}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Score */}
                                        <div className="col-span-2 text-center">
                                            <p className="font-bold text-black dark:text-white transition-colors duration-200">
                                                {player.totalScore.toLocaleString()}
                                            </p>
                                        </div>

                                        {/* Games */}
                                        <div className="col-span-2 text-center">
                                            <p className="font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                                {player.gamesPlayed}
                                            </p>
                                        </div>

                                        {/* Win Rate */}
                                        <div className="col-span-2 text-center">
                                            <div className="flex items-center justify-center gap-1">
                                                <span className="font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                                    {player.winRate}%
                                                </span>
                                                {player.winRate >= 80 && <Award size={16} className="text-yellow-500 dark:text-yellow-400" />}
                                            </div>
                                        </div>

                                        {/* Streak */}
                                        <div className="col-span-1 text-center">
                                            <div className="bg-orange-500 dark:bg-orange-600 border border-black dark:border-gray-600 rounded px-2 py-1 inline-block">
                                                <span className="font-bold text-white text-sm">{player.streak}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Achievement Highlights */}
                <div className="mt-8 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                    transition-all duration-200">
                    <h3 className="text-xl font-bold text-black dark:text-white mb-4 transition-colors duration-200">
                        Top Performers
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-300 dark:border-yellow-600 rounded-lg p-4 transition-all duration-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Crown size={20} className="text-yellow-600 dark:text-yellow-400" />
                                <span className="font-bold text-yellow-800 dark:text-yellow-300">Highest Score</span>
                            </div>
                            <p className="text-yellow-700 dark:text-yellow-400 font-semibold">
                                {leaderboard.length > 0 ? `${leaderboard[0].nickname} - ${leaderboard[0].totalScore.toLocaleString()} pts` : '-'}
                            </p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg p-4 transition-all duration-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Target size={20} className="text-green-600 dark:text-green-400" />
                                <span className="font-bold text-green-800 dark:text-green-300">Best Win Rate</span>
                            </div>
                            <p className="text-green-700 dark:text-green-400 font-semibold">
                                {leaderboard.length > 0
                                    ? (() => {
                                        const best = leaderboard.reduce((p, c) => p.winRate > c.winRate ? p : c);
                                        return `${best.nickname} - ${best.winRate}%`;
                                    })()
                                    : '-'}
                            </p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 transition-all duration-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={20} className="text-blue-600 dark:text-blue-400" />
                                <span className="font-bold text-blue-800 dark:text-blue-300">Most Active</span>
                            </div>
                            <p className="text-blue-700 dark:text-blue-400 font-semibold">
                                {leaderboard.length > 0
                                    ? (() => {
                                        const active = leaderboard.reduce((p, c) => p.gamesPlayed > c.gamesPlayed ? p : c);
                                        return `${active.nickname} - ${active.gamesPlayed} games`;
                                    })()
                                    : '-'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLeaderboardPage;
