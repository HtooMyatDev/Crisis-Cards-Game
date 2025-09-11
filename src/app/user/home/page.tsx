"use client"
import React from 'react';
import { Gamepad2, Trophy, Clock, Users, Play, TrendingUp } from 'lucide-react';
import Link from 'next/link';

const LAST_GAME_KEY = 'ccg_last_game_progress_v1';

const UserHomePage = () => {
    const stats = [
        { label: 'Games Played', value: '24', icon: Gamepad2, color: 'bg-blue-500' },
        { label: 'Win Rate', value: '68%', icon: TrendingUp, color: 'bg-green-500' },
        { label: 'Current Streak', value: '5', icon: Trophy, color: 'bg-yellow-500' },
        { label: 'Total Score', value: '1,247', icon: Users, color: 'bg-purple-500' }
    ];

    const recentGames = [
        { id: 1, result: 'Victory', score: 85, date: '2 hours ago' },
        { id: 2, result: 'Defeat', score: 42, date: '1 day ago' },
        { id: 3, result: 'Victory', score: 91, date: '2 days ago' },
        { id: 4, result: 'Victory', score: 78, date: '3 days ago' }
    ];

    const lastGame = typeof window !== 'undefined' ? (() => {
        try { return JSON.parse(localStorage.getItem(LAST_GAME_KEY) || 'null'); } catch { return null; }
    })() : null;

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-black text-black dark:text-white mb-2 transition-colors duration-200">
                    Welcome back, Player One!
                </h1>
                <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                    Ready for your next crisis challenge?
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Link
                    href="/user/game"
                    className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                        hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 group"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-green-500 dark:bg-green-600 border-4 border-black dark:border-gray-600 rounded-full flex items-center justify-center
                            shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                            <Play size={32} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-black dark:text-white mb-1 transition-colors duration-200">
                                Start New Game
                            </h3>
                            <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                                Jump into a crisis scenario
                            </p>
                        </div>
                    </div>
                </Link>

                {lastGame && (
                    <Link
                        href="/user/game"
                        className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]
                            hover:shadow-none hover:translate-x-[6px] hover:translate-y-[6px] transition-all duration-150 group"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-500 dark:bg-blue-600 border-4 border-black dark:border-gray-600 rounded-full flex items-center justify-center
                                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                                <Clock size={32} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-black dark:text-white mb-1 transition-colors duration-200">
                                    Continue Last Game
                                </h3>
                                <p className="text-gray-600 dark:text-gray-300 font-medium transition-colors duration-200">
                                    {lastGame.title || 'Resume where you left off'}
                                </p>
                            </div>
                        </div>
                    </Link>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 ${stat.color} dark:${stat.color} border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center`}>
                                <stat.icon size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white transition-colors duration-200">
                                    {stat.value}
                                </p>
                                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                    {stat.label}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Games */}
            <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200">
                <div className="flex items-center gap-3 mb-6">
                    <Clock size={24} className="text-black dark:text-white transition-colors duration-200" />
                    <h2 className="text-xl font-bold text-black dark:text-white transition-colors duration-200">
                        Recent Games
                    </h2>
                </div>

                <div className="space-y-3">
                    {recentGames.map((game) => (
                        <div key={game.id} className="flex items-center justify-between p-3 border-2 border-black dark:border-gray-600 rounded-lg
                            bg-gray-50 dark:bg-gray-700 transition-all duration-200">
                            <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center font-bold text-xs
                                    ${game.result === 'Victory'
                                        ? 'bg-green-500 dark:bg-green-600 text-white'
                                        : 'bg-red-500 dark:bg-red-600 text-white'
                                    } transition-colors duration-200
                                `}>
                                    {game.result === 'Victory' ? 'W' : 'L'}
                                </div>
                                <div>
                                    <p className="font-bold text-black dark:text-white transition-colors duration-200">
                                        {game.result}
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-200">
                                        {game.date}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="font-bold text-black dark:text-white transition-colors duration-200">
                                    {game.score} pts
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default UserHomePage;
