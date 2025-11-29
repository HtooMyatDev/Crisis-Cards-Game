"use client"
import React, { useState, useEffect } from 'react';
import {
    History,
    Calendar,
    Users,
    Trophy,
    Target,
    Clock,
    TrendingUp,
    Search,
    ChevronDown,
    Award,
    XCircle,
    CheckCircle
} from 'lucide-react';

interface GameHistory {
    id: string;
    gameCode: string;
    date: string;
    duration: string;
    players: number;
    score: number;
    result: 'won' | 'lost' | 'completed';
    categories: string[];
    cardsPlayed: number;
}

const GameHistoryPage = () => {
    const [filter, setFilter] = useState<'all' | 'won' | 'lost' | 'completed'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<'date' | 'score' | 'duration'>('date');
    const [gameHistory, setGameHistory] = useState<GameHistory[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch game history from API
    useEffect(() => {
        const fetchGameHistory = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/user/history');
                if (response.ok) {
                    const data = await response.json();
                    setGameHistory(data);
                }
            } catch (error) {
                console.error('Failed to fetch game history:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchGameHistory();
    }, []);

    const filteredGames = gameHistory
        .filter(game => {
            if (filter !== 'all' && game.result !== filter) return false;
            if (searchTerm && !game.gameCode.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            if (sortBy === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sortBy === 'score') return b.score - a.score;
            if (sortBy === 'duration') return parseInt(b.duration) - parseInt(a.duration);
            return 0;
        });

    const stats = {
        totalGames: gameHistory.length,
        totalWins: gameHistory.filter(g => g.result === 'won').length,
        totalScore: gameHistory.reduce((sum, g) => sum + g.score, 0),
        avgScore: gameHistory.length > 0
            ? Math.round(gameHistory.reduce((sum, g) => sum + g.score, 0) / gameHistory.length)
            : 0
    };

    const getResultIcon = (result: string) => {
        switch (result) {
            case 'won':
                return <CheckCircle className="text-green-500" size={20} />;
            case 'lost':
                return <XCircle className="text-red-500" size={20} />;
            default:
                return <Award className="text-blue-500" size={20} />;
        }
    };

    const getResultColor = (result: string) => {
        switch (result) {
            case 'won':
                return 'bg-green-50 border-green-600 dark:bg-green-900/20 dark:border-green-500';
            case 'lost':
                return 'bg-red-50 border-red-600 dark:bg-red-900/20 dark:border-red-500';
            default:
                return 'bg-blue-50 border-blue-600 dark:bg-blue-900/20 dark:border-blue-500';
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-black text-black dark:text-white mb-2 tracking-tight">
                        GAME HISTORY
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300 font-bold">
                        Track your past missions and performance
                    </p>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-500 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
                                <History size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white">{stats.totalGames}</p>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Games</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-green-500 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white">{stats.totalWins}</p>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Victories</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-purple-500 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
                                <Target size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white">{stats.totalScore.toLocaleString()}</p>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Total Score</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-4
                        shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)]">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-orange-500 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center">
                                <TrendingUp size={24} className="text-white" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-black dark:text-white">{stats.avgScore}</p>
                                <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">Avg Score</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-6
                    shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] mb-6">

                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by game code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg
                                    bg-white dark:bg-gray-700 text-black dark:text-white font-medium
                                    focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Filter Buttons */}
                        <div className="flex gap-2 flex-wrap">
                            {['all', 'won', 'lost', 'completed'].map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f as 'all' | 'won' | 'lost' | 'completed')}
                                    className={`px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm capitalize
                                        shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                        hover:shadow-none hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                                        ${filter === f
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-white dark:bg-gray-700 text-black dark:text-white'
                                        }`}
                                >
                                    {f}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'date' | 'score' | 'duration')}
                                className="px-4 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                    bg-white dark:bg-gray-700 text-black dark:text-white
                                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8 appearance-none"
                            >
                                <option value="date">Sort by Date</option>
                                <option value="score">Sort by Score</option>
                                <option value="duration">Sort by Duration</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                {/* Game History List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-12
                            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] text-center">
                            <div className="w-12 h-12 border-4 border-black dark:border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                            <p className="text-gray-500 dark:text-gray-400 font-bold">Loading game history...</p>
                        </div>
                    ) : filteredGames.length === 0 ? (
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-600 rounded-lg p-12
                            shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] dark:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.1)] text-center">
                            <History size={48} className="mx-auto mb-4 text-gray-400" />
                            <p className="text-gray-500 dark:text-gray-400 font-bold">No games found</p>
                        </div>
                    ) : (
                        filteredGames.map((game) => (
                            <div
                                key={game.id}
                                className={`border-2 rounded-lg p-6
                                    shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]
                                    hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150
                                    ${getResultColor(game.result)}`}
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    {/* Left Section */}
                                    <div className="flex items-start gap-4">
                                        <div className="mt-1">
                                            {getResultIcon(game.result)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-black text-black dark:text-white">
                                                    {game.gameCode}
                                                </h3>
                                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                                                    ${game.result === 'won' ? 'bg-green-500 text-white' :
                                                        game.result === 'lost' ? 'bg-red-500 text-white' :
                                                            'bg-blue-500 text-white'}`}>
                                                    {game.result}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                                                <div className="flex items-center gap-1">
                                                    <Calendar size={14} />
                                                    {new Date(game.date).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock size={14} />
                                                    {game.duration}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Users size={14} />
                                                    {game.players} players
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Target size={14} />
                                                    {game.cardsPlayed} cards
                                                </div>
                                            </div>
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {game.categories.map((category, idx) => (
                                                    <span
                                                        key={idx}
                                                        className="px-2 py-1 bg-white dark:bg-gray-700 border border-black dark:border-gray-600
                                                            rounded text-xs font-semibold text-black dark:text-white"
                                                    >
                                                        {category}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Section - Score */}
                                    <div className="text-right md:text-center">
                                        <p className="text-3xl font-black text-black dark:text-white">
                                            {game.score}
                                        </p>
                                        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300">
                                            POINTS
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default GameHistoryPage;
