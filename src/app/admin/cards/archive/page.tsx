"use client"
import React, { useState, useEffect } from 'react';
import { Search, Filter, Archive, RotateCcw, Trash2, Calendar, Tag, AlertTriangle, Clock, Eye, Loader } from 'lucide-react';

interface ArchivedCard {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    pwValue: number;
    efValue: number;
    psValue: number;
    grValue: number;
    status: string;
    createdAt: string;
    updatedAt: string;
    archivedAt?: string;
    isArchived: boolean;
    category: {
        id: number;
        name: string;
        color?: string;
    };
    cardResponses?: {
        id: number;
        text: string;
        order: number;
        pwEffect: number;
        efEffect: number;
        psEffect: number;
        grEffect: number;
    }[];
}

export default function ArchivedCards() {
    const [archivedCards, setArchivedCards] = useState<ArchivedCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [sortBy, setSortBy] = useState('archivedAt');
    const [showRestoreConfirm, setShowRestoreConfirm] = useState<string | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    // Fetch archived cards
    useEffect(() => {
        const fetchArchivedCards = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/admin/cards?isArchived=true', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                const cardsData = data.cards || data.data || data;

                if (Array.isArray(cardsData)) {
                    // Filter only archived cards on frontend as backup
                    const archivedOnly = cardsData.filter(card => card.isArchived === true);
                    setArchivedCards(archivedOnly);
                } else {
                    console.error('Expected array of cards, got:', cardsData);
                    setArchivedCards([]);
                }
            } catch (error) {
                console.error('Error fetching archived cards:', error);
                setArchivedCards([]);
            } finally {
                setLoading(false);
            }
        };

        fetchArchivedCards();
    }, []);

    // Get unique values for filters
    const categories = ['All', ...new Set(archivedCards.map(card => card.category?.name).filter(Boolean))];
    const statuses = ['All', ...new Set(archivedCards.map(card => card.status).filter(Boolean))];

    // Filter and sort cards
    const filteredCards = archivedCards
        .filter(card => {
            return (
                (card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    card.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (selectedCategory === '' || selectedCategory === 'All' || card.category?.name === selectedCategory) &&
                (selectedStatus === '' || selectedStatus === 'All' || card.status === selectedStatus)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'archivedAt') {
                const aDate = new Date(a.archivedAt || a.updatedAt);
                const bDate = new Date(b.archivedAt || b.updatedAt);
                return bDate.getTime() - aDate.getTime();
            }
            if (sortBy === 'createdAt') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            if (sortBy === 'title') return a.title.localeCompare(b.title);
            if (sortBy === 'category') return (a.category?.name || '').localeCompare(b.category?.name || '');
            return 0;
        });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'active': return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800';
            case 'inactive': return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800';
            case 'archived': return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
            case 'resolved': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800';
            case 'pending': return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
            default: return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
        }
    };

    const handleRestore = async (cardId: string) => {
        try {
            setActionLoading(cardId);
            const response = await fetch(`/api/admin/cards/${cardId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isArchived: false })
            });

            if (!response.ok) {
                throw new Error('Failed to restore card');
            }

            // Remove from archived cards list
            setArchivedCards(cards => cards.filter(card => card.id !== cardId));
            setShowRestoreConfirm(null);
            console.log(`Card ${cardId} restored successfully`);
        } catch (error) {
            console.error('Error restoring card:', error);
            alert('Error restoring card. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleDelete = async (cardId: string) => {
        try {
            setActionLoading(cardId);
            const response = await fetch(`/api/admin/cards/${cardId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                throw new Error('Failed to delete card');
            }

            // Remove from archived cards list
            setArchivedCards(cards => cards.filter(card => card.id !== cardId));
            setShowDeleteConfirm(null);
            console.log(`Card ${cardId} deleted permanently`);
        } catch (error) {
            console.error('Error deleting card:', error);
            alert('Error deleting card. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategory('');
        setSelectedStatus('');
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const calculateDuration = (createdAt: string, archivedAt?: string) => {
        const start = new Date(createdAt);
        const end = new Date(archivedAt || new Date());
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return '1 day';
        if (diffDays < 30) return `${diffDays} days`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
        return `${Math.floor(diffDays / 365)} years`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <Loader size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4 animate-spin" />
                    <div className="text-gray-500 dark:text-gray-400 text-lg">Loading archived cards...</div>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <Archive size={28} className="text-gray-600 dark:text-gray-400" />
                    <h1 className="text-2xl font-bold text-black dark:text-white">Archived Crisis Cards</h1>
                </div>
                <p className="text-gray-600 dark:text-gray-400">View and manage archived crisis cards</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-6 mb-6">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                    {/* Search */}
                    <div className="lg:col-span-2 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search archived cards..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {/* Category Filter */}
                    <select
                        className="px-3 pr-10 py-2 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="">All Categories</option>
                        {categories.filter(cat => cat !== 'All').map(category => (
                            <option key={category} value={category}>{category}</option>
                        ))}
                    </select>

                    {/* Status Filter */}
                    <select
                        className="px-3 pr-10 py-2 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="">All Statuses</option>
                        {statuses.filter(status => status !== 'All').map(status => (
                            <option key={status} value={status}>{status}</option>
                        ))}
                    </select>

                    {/* Sort */}
                    <select
                        className="px-3 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black dark:text-white"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        <option value="archivedAt">Sort by Archive Date</option>
                        <option value="createdAt">Sort by Created Date</option>
                        <option value="title">Sort by Title</option>
                        <option value="category">Sort by Category</option>
                    </select>
                </div>

                {/* Clear Filters */}
                {(searchTerm || selectedCategory || selectedStatus) && (
                    <div className="mt-4 flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Active filters:</span>
                        <button
                            onClick={clearFilters}
                            className="text-sm px-3 py-1 bg-gray-500 text-white border-2 border-black rounded shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                        >
                            Clear All
                        </button>
                    </div>
                )}
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Archive size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Archived</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">{archivedCards.length}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Filter size={18} className="text-purple-600 dark:text-purple-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Showing</span>
                    </div>
                    <div className="text-2xl font-bold text-black dark:text-white">{filteredCards.length}</div>
                </div>

                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Tag size={18} className="text-green-600 dark:text-green-400" />
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Categories</span>
                    </div>
                    <div className="text-2xl font-bold">{categories.length - 1}</div>
                </div>
            </div>

            {/* Cards List */}
            <div className="space-y-4">
                {filteredCards.map((card) => {
                    const isActionLoading = actionLoading === card.id;

                    return (
                        <div key={card.id} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] p-6 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-bold text-black dark:text-white">{card.title}</h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(card.status)}`}>
                                            {card.status}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 mb-3">{card.description}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <Tag size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                                    <span className="font-medium text-black dark:text-white">{card.category?.name || 'Unknown'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Time Limit:</span>
                                    <span className="font-medium text-black dark:text-white">{card.timeLimit} minutes</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Responses:</span>
                                    <span className="font-medium text-black dark:text-white">{card.cardResponses?.length || 0}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                                    <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                                    <span className="font-medium">{calculateDuration(card.createdAt, card.archivedAt)}</span>
                                </div>
                            </div>

                            {/* Card Values */}
                            <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-200 dark:border-gray-700">
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Card Values:</p>
                                <div className="grid grid-cols-4 gap-2 text-xs">
                                    <div className="text-center">
                                        <div className="text-gray-600 dark:text-gray-400">PW</div>
                                        <div className="font-bold text-black dark:text-white">{card.pwValue || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-600 dark:text-gray-400">EF</div>
                                        <div className="font-bold text-black dark:text-white">{card.efValue || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-600 dark:text-gray-400">PS</div>
                                        <div className="font-bold text-black dark:text-white">{card.psValue || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-gray-600 dark:text-gray-400">GR</div>
                                        <div className="font-bold text-black dark:text-white">{card.grValue || 0}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    Created: {formatDate(card.createdAt)} •
                                    Archived: {formatDate(card.archivedAt || card.updatedAt)}
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowRestoreConfirm(card.id)}
                                        disabled={isActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white border-2 border-black dark:border-blue-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isActionLoading ? (
                                            <Loader size={14} className="animate-spin" />
                                        ) : (
                                            <RotateCcw size={14} />
                                        )}
                                        Restore
                                    </button>
                                    <button
                                        onClick={() => setShowDeleteConfirm(card.id)}
                                        disabled={isActionLoading}
                                        className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white border-2 border-black dark:border-red-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(239,68,68,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isActionLoading ? (
                                            <Loader size={14} className="animate-spin" />
                                        ) : (
                                            <Trash2 size={14} />
                                        )}
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* No Results */}
            {!loading && filteredCards.length === 0 && (
                <div className="text-center py-12 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]">
                    <Archive size={48} className="mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                    <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No archived cards found</div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm">
                        {archivedCards.length === 0
                            ? "No cards have been archived yet"
                            : "Try adjusting your search criteria or filters"
                        }
                    </div>
                </div>
            )}

            {/* Restore Confirmation Modal */}
            {showRestoreConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowRestoreConfirm(null)}
                >
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)] p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Restore Crisis Card</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to restore this crisis card? It will be moved back to active cards.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowRestoreConfirm(null)}
                                disabled={!!actionLoading}
                                className="px-4 py-2 bg-gray-500 text-white border-2 border-black dark:border-gray-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleRestore(showRestoreConfirm)}
                                disabled={!!actionLoading}
                                className="px-4 py-2 bg-blue-500 text-white border-2 border-black dark:border-blue-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(59,130,246,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium disabled:opacity-50"
                            >
                                {actionLoading === showRestoreConfirm ? (
                                    <div className="flex items-center gap-2">
                                        <Loader size={14} className="animate-spin" />
                                        Restoring...
                                    </div>
                                ) : (
                                    'Restore Card'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                    onClick={(e) => e.target === e.currentTarget && setShowDeleteConfirm(null)}
                >
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] dark:shadow-[5px_5px_0px_0px_rgba(255,255,255,0.1)] p-6 max-w-md w-full">
                        <h3 className="text-xl font-bold mb-4 text-black dark:text-white">Permanently Delete Card</h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Are you sure you want to permanently delete this crisis card? This action cannot be undone.
                        </p>

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => setShowDeleteConfirm(null)}
                                disabled={!!actionLoading}
                                className="px-4 py-2 bg-gray-500 text-white border-2 border-black dark:border-gray-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(showDeleteConfirm)}
                                disabled={!!actionLoading}
                                className="px-4 py-2 bg-red-500 text-white border-2 border-black dark:border-red-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(239,68,68,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium disabled:opacity-50"
                            >
                                {actionLoading === showDeleteConfirm ? (
                                    <div className="flex items-center gap-2">
                                        <Loader size={14} className="animate-spin" />
                                        Deleting...
                                    </div>
                                ) : (
                                    'Delete Forever'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
