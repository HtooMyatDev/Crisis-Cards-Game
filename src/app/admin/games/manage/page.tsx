"use client"
import React, { useState } from 'react';
import {
    Search,
    Plus,
    Play,
    Pause,
    Square,
    Users,
    Clock,
    Calendar,
    Eye,
    Gamepad2,
    Trophy,
    Target,
    Timer
} from 'lucide-react';

const GameSessionsManagement = () => {
    const [sessions, setSessions] = useState([
        {
            id: 1,
            name: "Crisis Management Training #1",
            status: "Active",
            players: 8,
            maxPlayers: 12,
            duration: "45 minutes",
            startTime: "2024-03-15 14:30",
            endTime: "2024-03-15 15:15",
            gameMode: "Team Challenge",
            difficulty: "Medium",
            completedCards: 23,
            totalCards: 50,
            creator: "John Admin"
        },
        {
            id: 2,
            name: "Emergency Response Drill",
            status: "Completed",
            players: 15,
            maxPlayers: 15,
            duration: "60 minutes",
            startTime: "2024-03-15 10:00",
            endTime: "2024-03-15 11:00",
            gameMode: "Solo Practice",
            difficulty: "Hard",
            completedCards: 42,
            totalCards: 42,
            creator: "Sarah Johnson"
        },
        {
            id: 3,
            name: "New Employee Orientation",
            status: "Scheduled",
            players: 0,
            maxPlayers: 20,
            duration: "30 minutes",
            startTime: "2024-03-16 09:00",
            endTime: "2024-03-16 09:30",
            gameMode: "Group Learning",
            difficulty: "Easy",
            completedCards: 0,
            totalCards: 25,
            creator: "Mike Wilson"
        },
        {
            id: 4,
            name: "Advanced Crisis Scenarios",
            status: "Paused",
            players: 6,
            maxPlayers: 10,
            duration: "90 minutes",
            startTime: "2024-03-15 13:00",
            endTime: "2024-03-15 14:30",
            gameMode: "Team Challenge",
            difficulty: "Expert",
            completedCards: 18,
            totalCards: 75,
            creator: "Admin"
        },
        {
            id: 5,
            name: "Quick Assessment Test",
            status: "Active",
            players: 3,
            maxPlayers: 5,
            duration: "15 minutes",
            startTime: "2024-03-15 15:00",
            endTime: "2024-03-15 15:15",
            gameMode: "Time Trial",
            difficulty: "Medium",
            completedCards: 8,
            totalCards: 20,
            creator: "Lisa Chen"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Active': return 'bg-green-100 text-green-800 border-green-300';
            case 'Completed': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'Scheduled': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'Paused': return 'bg-orange-100 text-orange-800 border-orange-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case 'Easy': return 'bg-green-50 text-green-700 border-green-200';
            case 'Medium': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'Hard': return 'bg-orange-50 text-orange-700 border-orange-200';
            case 'Expert': return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active': return <Play size={14} className="text-green-600" />;
            case 'Completed': return <Square size={14} className="text-blue-600" />;
            case 'Scheduled': return <Calendar size={14} className="text-yellow-600" />;
            case 'Paused': return <Pause size={14} className="text-orange-600" />;
            default: return <Clock size={14} className="text-gray-600" />;
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch = session.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.creator.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.gameMode.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSessionAction = (sessionId: number, action: string) => {
        setSessions(sessions.map(session => {
            if (session.id === sessionId) {
                switch (action) {
                    case 'start':
                        return { ...session, status: 'Active' };
                    case 'pause':
                        return { ...session, status: 'Paused' };
                    case 'stop':
                        return { ...session, status: 'Completed' };
                    default:
                        return session;
                }
            }
            return session;
        }));
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Game Sessions</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and monitor active crisis card game sessions</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-3 py-2 sm:px-4 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm sm:text-base whitespace-nowrap"
                >
                    <Plus size={16} className="inline-block mr-2" />
                    <span className="hidden sm:inline">Create New Session</span>
                    <span className="sm:hidden">Create</span>
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <Play size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'Active').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Active Sessions</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                            <Users size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.reduce((acc, s) => acc + s.players, 0)}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Total Players</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-yellow-500 border-2 border-black rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'Scheduled').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Scheduled</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'Completed').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Completed</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search sessions..."
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium text-sm sm:text-base min-w-0 sm:min-w-[120px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    title="Filter sessions by status"
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Paused">Paused</option>
                    <option value="Completed">Completed</option>
                </select>
            </div>

            {/* Sessions Grid */}
            <div className="space-y-4">
                {filteredSessions.map((session) => (
                    <div key={session.id} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">

                        {/* Mobile Layout */}
                        <div className="block lg:hidden">
                            {/* Header with status */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <Gamepad2 size={18} className="text-blue-600 flex-shrink-0" />
                                    <h3 className="font-bold text-base sm:text-lg truncate">{session.name}</h3>
                                </div>
                            </div>

                            {/* Status badges */}
                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(session.status)}`}>
                                    {getStatusIcon(session.status)}
                                    <span>{session.status}</span>
                                </span>
                                <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(session.difficulty)}`}>
                                    {session.difficulty}
                                </span>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Users size={14} className="text-gray-500" />
                                        <span className="text-sm font-medium">{session.players}/{session.maxPlayers}</span>
                                    </div>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Target size={14} className="text-gray-500" />
                                        <span className="text-sm font-medium">{session.completedCards}/{session.totalCards}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full border-r border-blue-600 transition-all duration-300"
                                            style={{ width: `${(session.completedCards / session.totalCards) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Timer size={14} className="text-gray-500" />
                                        <span className="text-sm font-medium">{session.duration}</span>
                                    </div>
                                    <p className="text-xs text-gray-600 mb-1">Mode: {session.gameMode}</p>
                                    <p className="text-xs text-gray-600">By: {session.creator}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 justify-end">
                                {session.status === 'Scheduled' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'start')}
                                        className="px-3 py-2 bg-green-500 text-white font-medium rounded border-2 border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                        title="Start Session"
                                    >
                                        <Play size={14} />
                                    </button>
                                )}
                                {session.status === 'Active' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'pause')}
                                        className="px-3 py-2 bg-orange-500 text-white font-medium rounded border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:shadow-[1px_1px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                        title="Pause Session"
                                    >
                                        <Pause size={14} />
                                    </button>
                                )}
                                {(session.status === 'Active' || session.status === 'Paused') && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'stop')}
                                        className="px-3 py-2 bg-red-500 text-white font-medium rounded border-2 border-red-600 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] hover:shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                        title="Stop Session"
                                    >
                                        <Square size={14} />
                                    </button>
                                )}
                                <button
                                    className="px-3 py-2 bg-blue-500 text-white font-medium rounded border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                    title="View Details"
                                >
                                    <Eye size={14} />
                                </button>
                            </div>
                        </div>

                        {/* Desktop Layout */}
                        <div className="hidden lg:grid lg:grid-cols-12 gap-4 items-center">
                            {/* Session Info */}
                            <div className="xl:col-span-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gamepad2 size={20} className="text-blue-600 flex-shrink-0" />
                                    <h3 className="font-bold text-lg">{session.name}</h3>
                                </div>
                                <div className="flex items-center gap-2 mb-2 flex-wrap">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium border flex items-center gap-1 ${getStatusColor(session.status)}`}>
                                        {getStatusIcon(session.status)}
                                        <span>{session.status}</span>
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs font-medium border ${getDifficultyColor(session.difficulty)}`}>
                                        {session.difficulty}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 truncate">Mode: {session.gameMode}</p>
                                <p className="text-sm text-gray-600 truncate">Created by: {session.creator}</p>
                            </div>

                            {/* Players & Progress */}
                            <div className="xl:col-span-3">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-gray-500 flex-shrink-0" />
                                        <span className="text-sm font-medium">{session.players}/{session.maxPlayers} players</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Target size={16} className="text-gray-500 flex-shrink-0" />
                                        <span className="text-sm font-medium">{session.completedCards}/{session.totalCards} cards</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 border border-gray-300">
                                        <div
                                            className="bg-blue-500 h-2 rounded-full border-r border-blue-600 transition-all duration-300"
                                            style={{ width: `${(session.completedCards / session.totalCards) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Timing */}
                            <div className="xl:col-span-3">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <Timer size={16} className="text-gray-500 flex-shrink-0" />
                                        <span className="text-sm font-medium">{session.duration}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Start: {session.startTime}</p>
                                    <p className="text-xs text-gray-600">End: {session.endTime}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="xl:col-span-2">
                                <div className="flex gap-2 flex-wrap justify-end">
                                    {session.status === 'Scheduled' && (
                                        <button
                                            onClick={() => handleSessionAction(session.id, 'start')}
                                            className="px-3 py-2 bg-green-500 text-white font-medium rounded border-2 border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                            title="Start Session"
                                        >
                                            <Play size={14} />
                                        </button>
                                    )}
                                    {session.status === 'Active' && (
                                        <button
                                            onClick={() => handleSessionAction(session.id, 'pause')}
                                            className="px-3 py-2 bg-orange-500 text-white font-medium rounded border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:shadow-[1px_1px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                            title="Pause Session"
                                        >
                                            <Pause size={14} />
                                        </button>
                                    )}
                                    {(session.status === 'Active' || session.status === 'Paused') && (
                                        <button
                                            onClick={() => handleSessionAction(session.id, 'stop')}
                                            className="px-3 py-2 bg-red-500 text-white font-medium rounded border-2 border-red-600 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] hover:shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                            title="Stop Session"
                                        >
                                            <Square size={14} />
                                        </button>
                                    )}
                                    <button
                                        className="px-3 py-2 bg-blue-500 text-white font-medium rounded border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                        title="View Details"
                                    >
                                        <Eye size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredSessions.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-base sm:text-lg">No sessions found</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</div>
                </div>
            )}

            {/* Create Session Modal Placeholder */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 w-full max-w-md mx-4">
                        <h2 className="text-lg sm:text-xl font-bold mb-4">Create New Session</h2>
                        <p className="text-gray-600 mb-6 text-sm sm:text-base">Session creation form would go here...</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-400 text-white font-bold border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm sm:text-base"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GameSessionsManagement;
