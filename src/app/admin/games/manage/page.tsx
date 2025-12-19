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
    AlertCircle,
    Trash2,
    Download,
    Filter,
    X,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { GameSession } from '@/types/game';
import { useGamePolling } from '@/hooks/useGamePolling';

const GameSessionsManagement = () => {
    const router = useRouter();
    const [sessions, setSessions] = useState<GameSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState<{ show: boolean; sessionId: string; sessionName: string } | null>(null);

    // Real-time updates
    const [autoRefresh, setAutoRefresh] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [nextRefresh, setNextRefresh] = useState(3);
    const REFRESH_INTERVAL = 1000; // 1 second

    // Advanced filters
    const [showFilters, setShowFilters] = useState(false);
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [hostFilter, setHostFilter] = useState('All');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [playerCountFilter, setPlayerCountFilter] = useState('All');

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalGames, setTotalGames] = useState(0);
    const ITEMS_PER_PAGE = 10;

    /**
     * Fetches game sessions from the API with pagination and filtering
     * @param silent - If true, suppresses loading state (for polling)
     * @param page - Page number to fetch (defaults to currentPage)
     */
    const fetchGameSessions = async (silent = false, page = currentPage) => {
        try {
            if (!silent) {
                setLoading(true);
            }
            setError('');

            // Build query string
            const params = new URLSearchParams({
                page: page.toString(),
                limit: ITEMS_PER_PAGE.toString()
            });

            if (searchTerm) params.append('search', searchTerm);
            if (statusFilter !== 'All') params.append('status', statusFilter);

            const response = await fetch(`/api/admin/games?${params.toString()}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            });

            if (!response.ok) {
                const errorText = await response.text();
                let errorData;
                try {
                    errorData = JSON.parse(errorText);
                } catch {
                    errorData = { error: errorText };
                }
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle both old (array) and new (paginated) response structures
            const gamesArray = Array.isArray(data) ? data : data.games || data.data || [];

            setSessions(gamesArray);

            // Update pagination state if available
            if (data.pagination) {
                setTotalPages(data.pagination.totalPages);
                setTotalGames(data.pagination.total);
                setCurrentPage(data.pagination.page);
            }

            setLastUpdate(new Date());
        }
        catch (error: unknown) {
            console.error('Error fetching game sessions:', error);
            if (!silent) {
                setError(error instanceof Error ? error.message : 'Failed to fetch game sessions');
            }
        }
        finally {
            if (!silent) {
                setLoading(false);
            }
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchGameSessions(false, 1);
    }, []);

    // Re-fetch when filters change
    useEffect(() => {
        // Debounce search
        const timeoutId = setTimeout(() => {
            fetchGameSessions(false, 1);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    // Auto-refresh polling
    useGamePolling({
        interval: REFRESH_INTERVAL,
        enabled: autoRefresh,
        onPoll: () => fetchGameSessions(true)
    });

    // Countdown timer for next refresh
    useEffect(() => {
        if (!autoRefresh) return;

        const timer = setInterval(() => {
            const timeSinceUpdate = Math.floor((new Date().getTime() - lastUpdate.getTime()) / 1000);
            const timeUntilRefresh = Math.max(0, 1 - timeSinceUpdate);
            setNextRefresh(timeUntilRefresh);
        }, 500); // Check more frequently for smooth countdown

        return () => clearInterval(timer);
    }, [autoRefresh, lastUpdate]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700';
            case 'IN_PROGRESS': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700';
            case 'COMPLETED': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700';
            case 'PAUSED': return 'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700';
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-300 dark:border-gray-600';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'IN_PROGRESS': return <Play size={14} className="text-green-600 dark:text-green-400" />;
            case 'COMPLETED': return <Square size={14} className="text-blue-600 dark:text-blue-400" />;
            case 'WAITING': return <Calendar size={14} className="text-yellow-600 dark:text-yellow-400" />;
            case 'PAUSED': return <Pause size={14} className="text-orange-600 dark:text-orange-400" />;
            default: return <Clock size={14} className="text-gray-600 dark:text-gray-400" />;
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

        // Date filter
        let matchesDate = true;
        if (dateFrom || dateTo) {
            const sessionDate = new Date(session.createdAt);
            if (dateFrom) matchesDate = matchesDate && sessionDate >= new Date(dateFrom);
            if (dateTo) matchesDate = matchesDate && sessionDate <= new Date(dateTo + 'T23:59:59');
        }

        // Host filter
        const matchesHost = hostFilter === 'All' || session.host?.name === hostFilter;

        // Category filter
        let matchesCategory = categoryFilter === 'All';
        if (!matchesCategory && session.categories) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            matchesCategory = session.categories.some((gc: any) => gc.category.name === categoryFilter);
        }

        // Player count filter
        let matchesPlayerCount = true;
        const playerCount = session.players?.length || 0;
        if (playerCountFilter === '0') matchesPlayerCount = playerCount === 0;
        else if (playerCountFilter === '1-5') matchesPlayerCount = playerCount >= 1 && playerCount <= 5;
        else if (playerCountFilter === '6-10') matchesPlayerCount = playerCount >= 6 && playerCount <= 10;
        else if (playerCountFilter === '10+') matchesPlayerCount = playerCount > 10;

        return matchesSearch && matchesStatus && matchesDate && matchesHost && matchesCategory && matchesPlayerCount;
    });

    // Get unique hosts and categories for filter dropdowns
    const uniqueHosts = Array.from(new Set(sessions.map(s => s.host?.name).filter((name): name is string => !!name)));
    const uniqueCategories = Array.from(new Set(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        sessions.flatMap(s => s.categories?.map((gc: any) => gc.category.name) || [])
    ));

    // Export functions
    const exportToCSV = () => {
        const headers = ['Name', 'Game Code', 'Status', 'Mode', 'Host', 'Players', 'Created At'];
        const rows = filteredSessions.map(session => [
            session.name,
            session.gameCode,
            session.status,
            session.gameMode,
            session.host?.name || 'Unknown',
            session.players?.length || 0,
            new Date(session.createdAt).toLocaleString()
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `game-sessions-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const exportToJSON = () => {
        const exportData = filteredSessions.map(session => ({
            id: session.id,
            name: session.name,
            gameCode: session.gameCode,
            status: session.status,
            gameMode: session.gameMode,
            host: session.host?.name,
            playerCount: session.players?.length || 0,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            categories: session.categories?.map((gc: any) => gc.category.name),
            createdAt: session.createdAt,
            startedAt: session.startedAt,
            endedAt: session.endedAt
        }));

        const jsonContent = JSON.stringify(exportData, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `game-sessions-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    // Clear all filters
    const clearAllFilters = () => {
        setSearchTerm('');
        setStatusFilter('All');
        setDateFrom('');
        setDateTo('');
        setHostFilter('All');
        setCategoryFilter('All');
        setPlayerCountFilter('All');
    };

    // Count active filters
    const activeFiltersCount = [
        searchTerm,
        statusFilter !== 'All',
        dateFrom,
        dateTo,
        hostFilter !== 'All',
        categoryFilter !== 'All',
        playerCountFilter !== 'All'
    ].filter(Boolean).length;

    const handleSessionAction = async (sessionId: string, action: string) => {
        let newStatus: GameSession['status'] | '' = '';
        switch (action) {
            case 'start': newStatus = 'IN_PROGRESS'; break;
            case 'pause': newStatus = 'PAUSED'; break;
            case 'resume': newStatus = 'IN_PROGRESS'; break;
            case 'stop': newStatus = 'COMPLETED'; break;
            default: return;
        }

        if (!newStatus) return;

        try {
            // Optimistic update
            setSessions(sessions.map(session =>
                session.id === sessionId ? { ...session, status: newStatus as GameSession['status'] } : session
            ));

            const response = await fetch(`/api/admin/games/${sessionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                throw new Error('Failed to update game status');
            }

            // Refresh data to get server-side updates (like timestamps)
            fetchGameSessions();

        } catch (error) {
            console.error('Error updating session:', error);
            // Revert on error
            fetchGameSessions();
            alert('Failed to update game status. Please try again.');
        }
    };

    const handleDeleteSession = async (sessionId: string, sessionName: string) => {
        setDeleteConfirmation({ show: true, sessionId, sessionName });
    };

    const confirmDelete = async () => {
        if (!deleteConfirmation) return;

        const { sessionId, sessionName } = deleteConfirmation;

        try {
            const response = await fetch(`/api/admin/games/${sessionId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to delete game session');
            }

            // Remove from local state
            setSessions(prevSessions => prevSessions.filter(session => session.id !== sessionId));

            // Close modal
            setDeleteConfirmation(null);

            // Show success (you could replace this with a toast notification)
            console.log(`Game session "${sessionName}" deleted successfully`);

        } catch (error) {
            console.error('Error deleting session:', error);
            alert(`Failed to delete game session: ${error instanceof Error ? error.message : 'Unknown error'}`);
            setDeleteConfirmation(null);
        }
    };

    const handleCreateSession = () => {
        router.push('/admin/games/create');
    };

    if (loading) {
        return (
            <div className="p-4 sm:p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="w-12 h-12 border-4 border-blue-500 dark:border-blue-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                        <p className="text-gray-600 dark:text-gray-400">Loading game sessions...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 sm:p-6">
                <div className="bg-red-50 dark:bg-red-900/30 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 dark:text-red-400 flex-shrink-0" size={20} />
                    <div>
                        <h3 className="font-bold text-red-800 dark:text-red-300">Error Loading Sessions</h3>
                        <p className="text-red-700 dark:text-red-400 text-sm mt-1">{error}</p>
                        <button
                            onClick={() => fetchGameSessions()}
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
                    <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">Game Sessions</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Manage and monitor active crisis card game sessions</p>
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

            {/* Auto-Refresh Status Bar */}
            <div className="mb-4 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] p-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                    <div className="text-sm">
                        <span className="font-bold text-black dark:text-white">
                            {autoRefresh ? 'Live Updates' : 'Auto-refresh paused'}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 ml-2">
                            {autoRefresh
                                ? `Next refresh in ${nextRefresh}s`
                                : `Last updated ${lastUpdate.toLocaleTimeString()}`
                            }
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchGameSessions(false)}
                        className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-black dark:text-white font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-all text-xs flex items-center gap-1.5"
                        title="Refresh now"
                    >
                        <Timer size={14} />
                        Refresh
                    </button>
                    <button
                        onClick={() => setAutoRefresh(!autoRefresh)}
                        className={`px-3 py-1.5 font-bold rounded-lg border-2 transition-all text-xs ${autoRefresh
                            ? 'bg-green-500 text-white border-green-600 hover:bg-green-600'
                            : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 border-gray-400 dark:border-gray-500 hover:bg-gray-400 dark:hover:bg-gray-500'
                            }`}
                    >
                        {autoRefresh ? 'Pause' : 'Resume'}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-green-500 border-2 border-black dark:border-gray-600 rounded-lg">
                            <Play size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">{sessions.filter(s => s.status === 'IN_PROGRESS').length}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Active</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-yellow-500 border-2 border-black dark:border-gray-600 rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">{sessions.filter(s => s.status === 'WAITING').length}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Waiting</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-blue-500 border-2 border-black dark:border-gray-600 rounded-lg">
                            <Trophy size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">{sessions.filter(s => s.status === 'COMPLETED').length}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Completed</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-purple-500 border-2 border-black dark:border-gray-600 rounded-lg">
                            <Gamepad2 size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold text-black dark:text-white">{sessions.length}</p>
                            <p className="text-gray-600 dark:text-gray-400 text-xs sm:text-sm font-medium">Total</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search, Filter, and Export Bar */}
            <div className="space-y-4 mb-6">
                {/* Main Search and Actions Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, host, mode, or code..."
                            className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] text-sm sm:text-base bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        className="px-3 pr-10 py-2 sm:px-4 sm:pr-10 sm:py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-medium text-sm sm:text-base min-w-0 sm:min-w-[140px] text-black dark:text-white"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="All">All Status</option>
                        <option value="WAITING">Waiting</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="PAUSED">Paused</option>
                        <option value="COMPLETED">Completed</option>
                    </select>

                    {/* Filter Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex items-center gap-2 px-4 py-2 sm:py-3 font-bold rounded-lg border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] transition-all text-sm sm:text-base whitespace-nowrap ${activeFiltersCount > 0
                            ? 'bg-purple-500 border-purple-600 text-white'
                            : 'bg-white dark:bg-gray-800 border-black dark:border-gray-700 text-black dark:text-white'
                            }`}
                    >
                        <Filter size={18} />
                        <span className="hidden sm:inline">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="bg-white dark:bg-gray-900 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs font-black">
                                {activeFiltersCount}
                            </span>
                        )}
                        {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {/* Export Dropdown */}
                    <div className="relative group">
                        <button className="flex items-center gap-2 px-4 py-2 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg border-2 border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm sm:text-base whitespace-nowrap">
                            <Download size={18} />
                            <span className="hidden sm:inline">Export</span>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                            <button
                                onClick={exportToCSV}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-black dark:text-white border-b border-gray-200 dark:border-gray-600 rounded-t-lg transition-colors"
                            >
                                Export as CSV
                            </button>
                            <button
                                onClick={exportToJSON}
                                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold text-black dark:text-white rounded-b-lg transition-colors"
                            >
                                Export as JSON
                            </button>
                        </div>
                    </div>
                </div>

                {/* Advanced Filters Panel */}
                {showFilters && (
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Date From */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date From</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white font-medium"
                                />
                            </div>

                            {/* Date To */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Date To</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white font-medium"
                                />
                            </div>

                            {/* Host Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Host</label>
                                <select
                                    value={hostFilter}
                                    onChange={(e) => setHostFilter(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white font-medium"
                                >
                                    <option value="All">All Hosts</option>
                                    {uniqueHosts.map(host => (
                                        <option key={host} value={host}>{host}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Category Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                                <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white font-medium"
                                >
                                    <option value="All">All Categories</option>
                                    {uniqueCategories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Player Count Filter */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Player Count</label>
                                <select
                                    value={playerCountFilter}
                                    onChange={(e) => setPlayerCountFilter(e.target.value)}
                                    className="w-full px-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white font-medium"
                                >
                                    <option value="All">All Counts</option>
                                    <option value="0">0 Players</option>
                                    <option value="1-5">1-5 Players</option>
                                    <option value="6-10">6-10 Players</option>
                                    <option value="10+">10+ Players</option>
                                </select>
                            </div>
                        </div>

                        {/* Clear Filters Button */}
                        {activeFiltersCount > 0 && (
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={clearAllFilters}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 transition-all"
                                >
                                    <X size={16} />
                                    Clear All Filters
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Active Filter Chips */}
                {activeFiltersCount > 0 && !showFilters && (
                    <div className="flex flex-wrap gap-2">
                        {searchTerm && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-bold border-2 border-blue-300 dark:border-blue-700">
                                Search: &quot;{searchTerm}&quot;
                                <button onClick={() => setSearchTerm('')} className="hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {statusFilter !== 'All' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 rounded-full text-sm font-bold border-2 border-purple-300 dark:border-purple-700">
                                Status: {statusFilter}
                                <button onClick={() => setStatusFilter('All')} className="hover:bg-purple-200 dark:hover:bg-purple-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {dateFrom && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-bold border-2 border-green-300 dark:border-green-700">
                                From: {dateFrom}
                                <button onClick={() => setDateFrom('')} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {dateTo && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full text-sm font-bold border-2 border-green-300 dark:border-green-700">
                                To: {dateTo}
                                <button onClick={() => setDateTo('')} className="hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {hostFilter !== 'All' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 rounded-full text-sm font-bold border-2 border-orange-300 dark:border-orange-700">
                                Host: {hostFilter}
                                <button onClick={() => setHostFilter('All')} className="hover:bg-orange-200 dark:hover:bg-orange-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {categoryFilter !== 'All' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-800 dark:text-pink-300 rounded-full text-sm font-bold border-2 border-pink-300 dark:border-pink-700">
                                Category: {categoryFilter}
                                <button onClick={() => setCategoryFilter('All')} className="hover:bg-pink-200 dark:hover:bg-pink-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                        {playerCountFilter !== 'All' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-800 dark:text-indigo-300 rounded-full text-sm font-bold border-2 border-indigo-300 dark:border-indigo-700">
                                Players: {playerCountFilter}
                                <button onClick={() => setPlayerCountFilter('All')} className="hover:bg-indigo-200 dark:hover:bg-indigo-800 rounded-full p-0.5">
                                    <X size={14} />
                                </button>
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
                {filteredSessions.map((session) => (
                    <div key={session.id} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-4 sm:p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                            {/* Session Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <Gamepad2 size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                                    <h3 className="font-bold text-lg text-black dark:text-white">{session.name}</h3>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 mb-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border flex items-center gap-1.5 ${getStatusColor(session.status)}`}>
                                        {getStatusIcon(session.status)}
                                        <span>{formatStatus(session.status)}</span>
                                    </span>
                                    <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-full text-xs font-bold text-black dark:text-white">
                                        Code: {session.gameCode}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Target size={14} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300">Mode: <span className="font-medium">{session.gameMode}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={14} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300">Host: <span className="font-medium">{session.host?.name || 'Unknown'}</span></span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300">Created: <span className="font-medium">{new Date(session.createdAt).toLocaleDateString()}</span></span>
                                    </div>
                                    {session.categories && session.categories.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Target size={14} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">
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
                                {session.status === 'WAITING' && (() => {
                                    // Check if all teams have at least one player
                                    const players = session.players || [];
                                    const teams = session.teams || [];

                                    // Count players per team
                                    const teamPlayerCounts = teams.map(team => ({
                                        teamId: team.id,
                                        teamName: team.name,
                                        playerCount: players.filter(p => p.teamId === team.id).length
                                    }));

                                    // Check if all teams have at least one player
                                    const allTeamsHavePlayers = teamPlayerCounts.every(t => t.playerCount > 0);
                                    const hasPlayers = players.length > 0;
                                    const hasTeams = teams.length > 0;

                                    let disabledReason = '';
                                    if (!hasPlayers) {
                                        disabledReason = 'Need at least one player to start';
                                    } else if (!hasTeams) {
                                        disabledReason = 'No teams configured for this game';
                                    } else if (!allTeamsHavePlayers) {
                                        const emptyTeams = teamPlayerCounts.filter(t => t.playerCount === 0);
                                        disabledReason = `These teams need players: ${emptyTeams.map(t => t.teamName).join(', ')}`;
                                    }

                                    const canStart = hasPlayers && hasTeams && allTeamsHavePlayers;

                                    return (
                                        <div className="flex flex-col gap-2">
                                            {/* Assign Teams Button - Only show if there are players but teams are empty */}
                                            {hasPlayers && !allTeamsHavePlayers && (
                                                <button
                                                    onClick={async () => {
                                                        if (confirm('Randomly assign all connected players to teams?')) {
                                                            try {
                                                                const res = await fetch(`/api/admin/games/${session.id}/assign-teams`, {
                                                                    method: 'POST'
                                                                });
                                                                const data = await res.json();
                                                                if (data.success) {
                                                                    alert(data.message);
                                                                    fetchGameSessions(); // Refresh
                                                                } else {
                                                                    alert(data.error);
                                                                }
                                                            } catch (err) {
                                                                alert('Failed to assign teams');
                                                            }
                                                        }
                                                    }}
                                                    className="px-4 py-2 bg-purple-500 text-white font-bold rounded-lg border-2 border-purple-600 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm flex items-center justify-center gap-2"
                                                >
                                                    <Users size={14} />
                                                    Assign Teams
                                                </button>
                                            )}

                                            <div className="relative group">
                                                <button
                                                    onClick={() => handleSessionAction(session.id, 'start')}
                                                    disabled={!canStart}
                                                    className={`w-full px-4 py-2 font-bold rounded-lg border-2 transition-all duration-200 text-sm flex items-center justify-center gap-2 ${canStart
                                                        ? 'bg-green-500 text-white border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] cursor-pointer'
                                                        : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 border-gray-400 dark:border-gray-500 cursor-not-allowed opacity-60'
                                                        }`}
                                                    title={disabledReason}
                                                >
                                                    <Play size={14} />
                                                    Start Game
                                                </button>
                                                {!canStart && (
                                                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-10 pointer-events-none">
                                                        {disabledReason}
                                                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1 border-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })()}
                                {session.status === 'IN_PROGRESS' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'pause')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-orange-500 text-white font-bold rounded-lg border-2 border-orange-600 shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Pause size={14} />
                                        Pause
                                    </button>
                                )}
                                {session.status === 'PAUSED' && (
                                    <button
                                        onClick={() => handleSessionAction(session.id, 'resume')}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-green-500 text-white font-bold rounded-lg border-2 border-green-600 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                    >
                                        <Play size={14} />
                                        Resume
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
                                {/* Smart View Button - Routes to appropriate view based on game status */}
                                {(session.status === 'IN_PROGRESS' || session.status === 'PAUSED') ? (
                                    <button
                                        onClick={() => router.push(`/admin/games/${session.id}/host`)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-purple-500 text-white font-bold rounded-lg border-2 border-purple-600 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                        title="Open host control panel to manage the active game"
                                    >
                                        <Trophy size={14} />
                                        Host Control
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push(`/admin/games/${session.id}`)}
                                        className="flex-1 lg:flex-none px-4 py-2 bg-blue-500 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                        title="View game details and player information"
                                    >
                                        <Eye size={14} />
                                        View Game
                                    </button>
                                )}
                                <button
                                    onClick={() => handleDeleteSession(session.id, session.name)}
                                    className="flex-1 lg:flex-none px-4 py-2 bg-gray-700 text-white font-bold rounded-lg border-2 border-gray-800 shadow-[2px_2px_0px_0px_rgba(31,41,55,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 text-sm flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={14} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination Controls */}
            {filteredSessions.length > 0 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-6 mb-8">
                    <div className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Showing <span className="font-bold text-black dark:text-white">{filteredSessions.length}</span> of <span className="font-bold text-black dark:text-white">{totalGames}</span> games
                        {totalPages > 1 && <span className="ml-1">(Page {currentPage} of {totalPages})</span>}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => fetchGameSessions(false, Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1 || loading}
                            className={`px-4 py-2 font-bold rounded-lg border-2 transition-all text-sm flex items-center gap-2 ${currentPage === 1 || loading
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-800 text-black dark:text-white border-black dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                                }`}
                        >
                            <ChevronDown className="rotate-90" size={16} />
                            Previous
                        </button>

                        <div className="flex items-center gap-1">
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                // Logic to show window of pages around current
                                let pageNum = i + 1;
                                if (totalPages > 5) {
                                    if (currentPage > 3) {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    if (pageNum > totalPages) {
                                        pageNum = totalPages - 4 + i;
                                    }
                                }

                                return (
                                    <button
                                        key={pageNum}
                                        onClick={() => fetchGameSessions(false, pageNum)}
                                        disabled={loading}
                                        className={`w-10 h-10 font-bold rounded-lg border-2 transition-all text-sm flex items-center justify-center ${currentPage === pageNum
                                            ? 'bg-blue-500 text-white border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]'
                                            : 'bg-white dark:bg-gray-800 text-black dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                                            }`}
                                    >
                                        {pageNum}
                                    </button>
                                );
                            })}
                        </div>

                        <button
                            onClick={() => fetchGameSessions(false, Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages || loading}
                            className={`px-4 py-2 font-bold rounded-lg border-2 transition-all text-sm flex items-center gap-2 ${currentPage === totalPages || loading
                                ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 border-gray-200 dark:border-gray-700 cursor-not-allowed'
                                : 'bg-white dark:bg-gray-800 text-black dark:text-white border-black dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px]'
                                }`}
                        >
                            Next
                            <ChevronDown className="-rotate-90" size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* No Results */}
            {
                filteredSessions.length === 0 && !loading && (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                        <Gamepad2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                        <div className="text-gray-500 dark:text-gray-400 text-base sm:text-lg font-bold">No sessions found</div>
                        <div className="text-gray-400 dark:text-gray-500 text-sm mt-2">
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
                )
            }

            {/* Delete Confirmation Modal */}
            {
                deleteConfirmation && (
                    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 max-w-md w-full">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 border-2 border-red-600 dark:border-red-500 rounded-full flex items-center justify-center">
                                    <AlertCircle size={24} className="text-red-600 dark:text-red-400" />
                                </div>
                                <h3 className="text-xl font-black text-black dark:text-white">Delete Game Session?</h3>
                            </div>

                            <p className="text-gray-700 dark:text-gray-300 mb-2">
                                Are you sure you want to delete <span className="font-bold">&quot;{deleteConfirmation.sessionName}&quot;</span>?
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-400 font-bold mb-6">
                                ⚠️ This action cannot be undone. All players and game data will be permanently deleted.
                            </p>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteConfirmation(null)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="flex-1 px-4 py-3 bg-red-500 text-white font-bold rounded-lg border-2 border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={16} />
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default GameSessionsManagement;
