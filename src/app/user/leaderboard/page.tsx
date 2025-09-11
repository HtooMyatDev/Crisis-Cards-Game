"use client"
import React, { useState } from 'react';
import { Trophy, Medal, Crown, Star, TrendingUp, Users, Target, Award, Calendar } from 'lucide-react';

const UserLeaderboardPage = () => {
    const [activeTab, setActiveTab] = useState('overall');

    const leaderboardData = {
        overall: [
            { rank: 1, name: 'CrisisMaster', score: 2847, games: 45, winRate: 89, level: 12, avatar: 'CM' },
            { rank: 2, name: 'StrategicGenius', score: 2634, games: 38, winRate: 84, level: 11, avatar: 'SG' },
            { rank: 3, name: 'QuickThinker', score: 2456, games: 42, winRate: 81, level: 10, avatar: 'QT' },
            { rank: 4, name: 'Player One', score: 1247, games: 24, winRate: 67, level: 5, avatar: 'P1', isCurrentUser: true },
            { rank: 5, name: 'DecisionMaker', score: 1189, games: 22, winRate: 73, level: 5, avatar: 'DM' },
            { rank: 6, name: 'CrisisSolver', score: 1156, games: 28, winRate: 64, level: 4, avatar: 'CS' },
            { rank: 7, name: 'ProblemSolver', score: 1098, games: 25, winRate: 68, level: 4, avatar: 'PS' },
            { rank: 8, name: 'GameMaster', score: 987, games: 20, winRate: 60, level: 4, avatar: 'GM' },
            { rank: 9, name: 'ThinkFast', score: 876, games: 18, winRate: 56, level: 3, avatar: 'TF' },
            { rank: 10, name: 'CrisisHero', score: 765, games: 15, winRate: 53, level: 3, avatar: 'CH' }
        ],
        monthly: [
            { rank: 1, name: 'StrategicGenius', score: 456, games: 8, winRate: 88, level: 11, avatar: 'SG' },
            { rank: 2, name: 'CrisisMaster', score: 423, games: 7, winRate: 86, level: 12, avatar: 'CM' },
            { rank: 3, name: 'Player One', score: 389, games: 6, winRate: 83, level: 5, avatar: 'P1', isCurrentUser: true },
            { rank: 4, name: 'QuickThinker', score: 367, games: 6, winRate: 83, level: 10, avatar: 'QT' },
            { rank: 5, name: 'DecisionMaker', score: 334, games: 5, winRate: 80, level: 5, avatar: 'DM' }
        ],
        weekly: [
            { rank: 1, name: 'Player One', score: 156, games: 3, winRate: 100, level: 5, avatar: 'P1', isCurrentUser: true },
            { rank: 2, name: 'StrategicGenius', score: 134, games: 2, winRate: 100, level: 11, avatar: 'SG' },
            { rank: 3, name: 'CrisisMaster', score: 128, games: 2, winRate: 100, level: 12, avatar: 'CM' },
            { rank: 4, name: 'QuickThinker', score: 98, games: 2, winRate: 50, level: 10, avatar: 'QT' },
            { rank: 5, name: 'DecisionMaker', score: 87, games: 1, winRate: 100, level: 5, avatar: 'DM' }
        ]
    };

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

    const currentData = leaderboardData[activeTab as keyof typeof leaderboardData];

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
                                    1,247
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
                                    #4
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
                                    67%
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
                                    +2
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
                            <div className="col-span-1 text-center">Level</div>
                        </div>
                    </div>

                    {/* Leaderboard Rows */}
                    <div className="divide-y-2 divide-gray-200 dark:divide-gray-600">
                        {currentData.map((player) => (
                            <div key={player.rank} className={`p-4 transition-colors duration-200 ${
                                player.isCurrentUser
                                    ? 'bg-blue-50 dark:bg-blue-900/20'
                                    : 'dark:bg-gray-800'
                            }`}>
                                <div className="grid grid-cols-12 gap-4 items-center">
                                    {/* Rank */}
                                    <div className="col-span-1 text-center">
                                        {getRankIcon(player.rank)}
                                    </div>

                                    {/* Player Info */}
                                    <div className="col-span-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center font-bold text-sm
                                                ${player.isCurrentUser ? 'bg-blue-500 dark:bg-blue-600 text-white' : getRankColor(player.rank)}`}>
                                                {player.avatar}
                                            </div>
                                            <div>
                                                <p className={`font-bold transition-colors duration-200 ${
                                                    player.isCurrentUser
                                                        ? 'text-blue-700 dark:text-blue-300'
                                                        : 'text-black dark:text-white'
                                                }`}>
                                                    {player.name}
                                                    {player.isCurrentUser && (
                                                        <span className="ml-2 text-xs bg-blue-500 dark:bg-blue-600 text-white px-2 py-1 rounded">
                                                            YOU
                                                        </span>
                                                    )}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Score */}
                                    <div className="col-span-2 text-center">
                                        <p className="font-bold text-black dark:text-white transition-colors duration-200">
                                            {player.score.toLocaleString()}
                                        </p>
                                    </div>

                                    {/* Games */}
                                    <div className="col-span-2 text-center">
                                        <p className="font-semibold text-gray-700 dark:text-gray-300 transition-colors duration-200">
                                            {player.games}
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

                                    {/* Level */}
                                    <div className="col-span-1 text-center">
                                        <div className="bg-yellow-500 dark:bg-yellow-600 border border-black dark:border-gray-600 rounded px-2 py-1 inline-block">
                                            <span className="font-bold text-black dark:text-black text-sm">{player.level}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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
                            <p className="text-yellow-700 dark:text-yellow-400 font-semibold">CrisisMaster - 2,847 points</p>
                        </div>
                        <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-300 dark:border-green-600 rounded-lg p-4 transition-all duration-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Target size={20} className="text-green-600 dark:text-green-400" />
                                <span className="font-bold text-green-800 dark:text-green-300">Best Win Rate</span>
                            </div>
                            <p className="text-green-700 dark:text-green-400 font-semibold">StrategicGenius - 89%</p>
                        </div>
                        <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-300 dark:border-blue-600 rounded-lg p-4 transition-all duration-200">
                            <div className="flex items-center gap-3 mb-2">
                                <Users size={20} className="text-blue-600 dark:text-blue-400" />
                                <span className="font-bold text-blue-800 dark:text-blue-300">Most Active</span>
                            </div>
                            <p className="text-blue-700 dark:text-blue-400 font-semibold">CrisisMaster - 45 games</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserLeaderboardPage;
