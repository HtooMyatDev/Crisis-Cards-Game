"use client"
import React, { useEffect, useState } from 'react';
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
    Timer,
    AlertCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';

const GameSessionsManagement = () => {
    const router = useRouter();
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);

    const fetchGameSessions = async () => {
        try {
            setLoading(true);
            setError('');

            console.log('Fetching from: /api/admin/games');

            const response = await fetch('/api/admin/games', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            console.log('Response status:', response.status);
            console.log('Response ok:', response.ok);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Error response:', errorText);

                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }

                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Received data:', data);

            const gamesArray = Array.isArray(data) ? data : data.games || data.data || [];
            console.log('Games array:', gamesArray);

            setSessions(gamesArray);
        }
        catch (error) {
            console.error('Error fetching game sessions:', error);
            setError(error instanceof Error ? error.message : 'Failed to fetch game sessions');
        }
        finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchGameSessions();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'IN_PROGRESS': return 'bg-green-100 text-green-800 border-green-300';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'PAUSED': return 'bg-orange-100 text-orange-800 border-orange-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return <Play size={14} className="text-green-600" />;
            case 'COMPLETED': return <Square size={14} className="text-blue-600" />;
            case 'WAITING': return <Calendar size={14} className="text-yellow-600" />;
            case 'PAUSED': return <Pause size={14} className="text-orange-600" />;
            default: return <Clock size={14} className="text-gray-600" />;
        }
    };

    const formatStatus = (status: string) => {
        return status.replace('_', ' ').toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    };

    const filteredSessions = sessions.filter(session => {
        const matchesSearch =
            session.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.host?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.gameMode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.gameCode?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || session.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleSessionAction = async (sessionId: string, action: string) => {
        // TODO: Implement API calls for session actions
        console.log(`Action ${action} on session ${sessionId}`);

        // Placeholder: Update local state
        setSessions(sessions.map(session => {
            if (session.id === sessionId) {
                switch (action) {
                    case 'start':
                        return { ...session, status: 'IN_PROGRESS' };
                    case 'pause':
                        return { ...session, status: 'PAUSED' };
                    case 'stop':
                        return { ...session, status: 'COMPLETED' };
                    default:
                        return session;
                }
            }
            return session;
        }));
    };

    const handleCreateSession = () => {
        router.push('/admin/games/create');
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading game sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold text-red-800">Error Loading Sessions</h3>
                        <p className="text-red-700 text-sm mt-1">{error}</p>
                        <button
                            onClick={fetchGameSessions}
                            className="mt-3 px-4 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold">Game Sessions</h1>
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage and monitor active crisis card game sessions</p>
                </div>
                <button
                    onClick={handleCreateSession}
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
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'IN_PROGRESS').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Active</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-yellow-500 border-2 border-black rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'WAITING').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Waiting</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.filter(s => s.status === 'COMPLETED').length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                            <Gamepad2 size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessions.length}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Total</p>
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
                        placeholder="Search by name, host, mode, or code..."
                        className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm sm:text-base"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-3 py-2 sm:px-4 sm:py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium text-sm sm:text-base min-w-0 sm:min-w-[140px]"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    title="Filter sessions by status"
                >
                    <option value="All">All Status</option>
                    <option value="WAITING">Waiting</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                </select>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
                {filteredSessions.map((session) => (
                    <div key={session.id} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Session Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gamepad2 size={20} className="text-blue-600 flex-shrink-0" />
                                    <h3 className="font-bold text-lg">{session.name}</h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(session.status)}`}>
                                        {getStatusIcon(session.status)}
                                        <span>{formatStatus(session.status)}</span>
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 border-2 border-gray-300 rounded-full text-xs font-bold">
                                        Code: {session.gameCode}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Target size={14} className="text-gray-500" />
                                        <span className="text-gray-700">Mode: <span className="font-medium">{session.gameMode}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-gray-500" />
                                        <span className="text-gray-700">Host: <span className="font-medium">{session.host?.name || 'Unknown'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-500" />
                                        <span className="text-gray-700">Created: <span className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                    {session.categories && session.categories.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Target size={14} className="text-gray-500" />
                                            <span className="text-gray-700">
                                                Categories:
                                                <span className="font-medium ml-1">
                                                    {session.categories.map(c => c.category.name).join(', ')}
                                                </span>
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 lg:flex-col lg:gap-2">
                                {session.status === 'WAITING' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'start')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-green-500 text-white font-bold rounded-lg border-2 border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Play size={14} />
                                        Start
                                    </button>
                                )}
                                {session.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'pause')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-orange-500 text-white font-bold rounded-lg border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Pause size={14} />
                                        Pause
                                    </button>
                                )}
                                {(session.status === 'IN_PROGRESS' || session.status === 'PAUSED') && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'stop')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-red-500 text-white font-bold rounded-lg border-2 border-red-600 shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Square size={14} />
                                        End
                                    </button>
                                )}
                                <button
                                    onClick={() => router.push(`/admin/games/${session.id}`)}
                                    className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                >
                                    <Eye size={14} />
                                    View
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredSessions.length === 0 && !loading && (
                <div className="text-center py-12 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <Gamepad2 size={48} className="mx-auto text-gray-300 mb-4" />
                    <div className="text-gray-500 text-base sm:text-lg font-bold">No sessions found</div>
                    <div className="text-gray-400 text-sm mt-2">
                        {searchTerm || statusFilter !== 'All'
                            ? 'Try adjusting your search or filter criteria'
                            : 'Create your first game session to get started'
                        }
                    </div>
                    {!searchTerm && statusFilter === 'All' && (
                        <button
                            onClick={handleCreateSession}
                            className="mt-4 px-6 py-3 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all inline-flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Create First Session
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default GameSessionsManagement;
