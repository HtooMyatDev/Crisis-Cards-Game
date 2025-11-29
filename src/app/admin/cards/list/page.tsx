"use client"
import React, { useState, useEffect } from 'react';
// Added Archive icon
import { Edit, Plus, Search, Filter, Clock, Tag, Zap, Shield, TrendingUp, Building2, Users, Leaf, Archive, ChevronLeft, ChevronRight } from 'lucide-react';
import SkeletonCardGrid from '@/components/skeletons/CardSkeletonGrid';
import { useRouter } from 'next/navigation';

// Updated card data type to include new values and response structure
interface CardResponse {
    id: number;
    text: string;
    order: number;
    politicalEffect: number;
    economicEffect: number;
    infrastructureEffect: number;
    societyEffect: number;
    environmentEffect: number;
    cardId?: string;
}

interface CrisisCard {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    political: number;
    economic: number;
    infrastructure: number;
    society: number;
    environment: number;
    cardResponses?: CardResponse[];
    status: string;
    createdAt: string;
    updatedAt: string;
    category: {
        id: number;
        name: string;
        color?: string;
    };
}

export default function CrisisCardList() {
    const [cards, setCards] = useState<CrisisCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Pagination state
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalCards, setTotalCards] = useState(0);
    const LIMIT = 9;

    const router = useRouter();

    // Archive modal states
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [cardToArchive, setCardToArchive] = useState<{ id: string; title: string } | null>(null);
    const [isArchiving, setIsArchiving] = useState(false);

    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    const getCategoryStyles = (category: { name: string; color?: string }) => {
        const defaultColor = '#6b7280';
        const hexColor = category?.color || defaultColor;
        const normalizedHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;

        const rgb = hexToRgb(normalizedHex);
        if (!rgb) {
            return {
                accentStyle: { backgroundColor: defaultColor },
                borderStyle: { borderColor: defaultColor },
                bgStyle: { backgroundColor: `rgba(107, 114, 128, 0.1)` },
                textStyle: { color: defaultColor },
                shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(107, 114, 128, 1)` }
            };
        }

        return {
            accentStyle: { backgroundColor: normalizedHex },
            borderStyle: { borderColor: normalizedHex },
            bgStyle: { backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` },
            textStyle: { color: normalizedHex },
            shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` }
        };
    };

    const formatEffect = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    const getEffectColor = (value: number) => {
        if (value > 0) return 'text-green-600';
        if (value < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    // Debounce search term
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchTerm);
            setPage(1); // Reset to first page on search
        }, 500);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [statusFilter, categoryFilter]);

    useEffect(() => {
        const fetchCards = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    page: page.toString(),
                    limit: LIMIT.toString(),
                    isArchived: 'false'
                });

                if (debouncedSearch) params.append('search', debouncedSearch);
                if (statusFilter !== 'All') params.append('status', statusFilter);
                if (categoryFilter !== 'All') params.append('category', categoryFilter);

                const response = await fetch(`/api/admin/cards?${params.toString()}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();

                if (data.success) {
                    setCards(data.cards || []);
                    if (data.pagination) {
                        setTotalPages(data.pagination.totalPages);
                        setTotalCards(data.pagination.total);
                    }
                } else {
                    console.error('Failed to fetch cards:', data.error);
                    setCards([]);
                }
            } catch (error) {
                console.error('Error fetching cards:', error);
                setCards([]);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [page, debouncedSearch, statusFilter, categoryFilter]);

    const categories = ['All', ...new Set(cards.map(card => card.category?.name).filter(Boolean))];

    // No client-side filtering needed anymore
    const filteredCards = cards;

    const openArchiveModal = (id: string, title: string) => {
        setCardToArchive({ id, title });
        setShowArchiveModal(true);
    };

    const closeArchiveModal = () => {
        setShowArchiveModal(false);
        setCardToArchive(null);
    };

    const handleArchive = async () => {
        if (!cardToArchive) return;

        setIsArchiving(true);
        try {
            const response = await fetch(`/api/admin/cards/${cardToArchive.id}`, {
                method: "PATCH",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isArchived: true })
            });

            if (!response.ok) {
                throw new Error('Failed to archive card');
            }

            setCards(cards.filter(card => card.id !== cardToArchive.id));
            console.log(`Card ${cardToArchive.id} archived successfully`);
            closeArchiveModal();
        } catch (error) {
            console.error('Error archiving card:', error);
            alert('Error archiving card. Please try again.');
        } finally {
            setIsArchiving(false);
        }
    };

    const handleEdit = (id: string) => {
        router.push(`/admin/cards/edit/${id}`)
    };

    const handleCreateNew = () => {
        router.push('/admin/cards/create')
    };

    if (loading) {
        return (
            <div>
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Crisis Cards</h1>
                    <button className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-blue-600 text-white font-bold border-2 border-black dark:border-blue-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)] animate-pulse">
                        <Plus size={20} />
                        Create New Card
                    </button>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] mb-6 animate-pulse">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-32 h-10 bg-gray-200 rounded-lg"></div>
                        <div className="w-40 h-10 bg-gray-200 rounded-lg"></div>
                    </div>
                </div>

                <div className="mb-6 animate-pulse">
                    <div className="flex flex-wrap gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <div key={i} className="flex items-center gap-2">
                                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                                <div className="w-16 h-4 bg-gray-200 rounded"></div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-4 animate-pulse">
                    <div className="w-32 h-4 bg-gray-200 rounded"></div>
                </div>

                <SkeletonCardGrid count={6} />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black dark:text-white">Crisis Cards</h1>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-black dark:bg-blue-600 text-white font-bold border-2 border-black dark:border-blue-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(37,99,235,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                    <Plus size={20} />
                    Create New Card
                </button>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search cards..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
                            className="px-3 pr-10 py-2 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 text-black dark:text-white"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            <option value="All">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <Tag size={20} />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="px-3 pr-10 py-2 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 text-black dark:text-white"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category === 'All' ? 'All Categories' : category}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                    {categories.filter(cat => cat !== 'All').map(categoryName => {
                        const categoryObj = cards.find(card => card.category?.name === categoryName)?.category;
                        const styles = getCategoryStyles(categoryObj || { name: categoryName });

                        return (
                            <div key={categoryName} className="flex items-center gap-2">
                                <div
                                    className="w-4 h-4 rounded-full border-2"
                                    style={{
                                        ...styles.accentStyle,
                                        ...styles.borderStyle
                                    }}
                                ></div>
                                <span className="text-sm font-medium">{categoryName}</span>
                                {categoryObj?.color && (
                                    <span className="text-xs text-gray-400 font-mono">({categoryObj.color})</span>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mb-4">
                <p className="text-gray-600 dark:text-gray-400">
                    Showing {filteredCards.length} of {cards.length} cards
                </p>
            </div>

            {filteredCards.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">No cards found matching your criteria</p>
                    <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                    >
                        Create Your First Card
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCards.map((card) => {
                        const styles = getCategoryStyles(card.category || { name: 'Unknown' });
                        const responses = card.cardResponses || [];

                        return (
                            <div
                                key={card.id}
                                className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 relative"
                            >
                                <div
                                    className="absolute top-0 left-0 w-full h-1 rounded-t-md"
                                    style={styles.accentStyle}
                                ></div>

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2">
                                        {card.title}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${card.status === 'Active'
                                        ? 'bg-green-100 text-green-800 border-green-800 dark:bg-green-900/30 dark:text-green-400 dark:border-green-500'
                                        : 'bg-red-100 text-red-800 border-red-800 dark:bg-red-900/30 dark:text-red-400 dark:border-red-500'
                                        }`}>
                                        {card.status}
                                    </span>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                                    {card.description}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Tag size={16} className="text-gray-500 dark:text-gray-400" />
                                        <span
                                            className="font-medium px-2 py-1 border-2 rounded-full text-xs text-gray-700 dark:text-gray-300"
                                            style={{
                                                ...styles.bgStyle,
                                                ...styles.borderStyle
                                            }}
                                        >
                                            {card.category?.name || 'Unknown'}
                                        </span>
                                        {card.category?.color && (
                                            <span className="text-xs text-gray-400 font-mono">
                                                {card.category.color}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-gray-500 dark:text-gray-400" />
                                        <span className="text-gray-700 dark:text-gray-300">{card.timeLimit} minutes</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={16} className="text-gray-500 dark:text-gray-400" />
                                        <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">Card Values:</p>
                                    </div>
                                    <div className="grid grid-cols-5 gap-2">
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600">
                                            <Shield size={16} className="text-blue-500" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.political || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600">
                                            <TrendingUp size={16} className="text-green-500" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.economic || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600">
                                            <Building2 size={16} className="text-gray-500 dark:text-gray-400" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.infrastructure || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600">
                                            <Users size={16} className="text-purple-500" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.society || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded border border-gray-300 dark:border-gray-600">
                                            <Leaf size={16} className="text-emerald-500" />
                                            <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{card.environment || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Response Options:</p>
                                    <div className="space-y-2">
                                        {responses.length > 0 ? (
                                            responses.slice(0, 2).map((response) => (
                                                <div key={response.id} className="text-xs bg-gray-100 dark:bg-gray-700/50 p-2 rounded border border-gray-300 dark:border-gray-600">
                                                    <div className="text-gray-700 dark:text-gray-200 mb-1">{response.text}</div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.politicalEffect)}`}>
                                                            <Shield size={12} />
                                                            <span>POL: {formatEffect(response.politicalEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.economicEffect)}`}>
                                                            <TrendingUp size={12} />
                                                            <span>ECO: {formatEffect(response.economicEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.infrastructureEffect)}`}>
                                                            <Building2 size={12} />
                                                            <span>INF: {formatEffect(response.infrastructureEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.societyEffect)}`}>
                                                            <Users size={12} />
                                                            <span>SOC: {formatEffect(response.societyEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.environmentEffect)}`}>
                                                            <Leaf size={12} />
                                                            <span>ENV: {formatEffect(response.environmentEffect)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 dark:text-yellow-200/70 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded border border-yellow-200 dark:border-yellow-700/50">
                                                No response options found for this card
                                            </div>
                                        )}

                                        {responses.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{responses.length - 2} more options
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(card.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-blue-900/30"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openArchiveModal(card.id, card.title)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-orange-600 text-orange-600 dark:text-orange-400 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(234,88,12,1)] hover:shadow-[1px_1px_0px_0px_rgba(234,88,12,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-orange-900/30"
                                    >
                                        <Archive size={16} />
                                        Archive
                                    </button>
                                </div>

                                <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                                    <div>Created: {new Date(card.createdAt).toLocaleDateString()}</div>
                                    <div>Updated: {new Date(card.updatedAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Pagination Controls */}
            {filteredCards.length > 0 && (
                <div className="flex justify-center items-center gap-4 mt-8 mb-8">
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft size={20} />
                        Previous
                    </button>

                    <span className="text-gray-700 dark:text-gray-300 font-medium">
                        Page {page} of {totalPages}
                    </span>

                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight size={20} />
                    </button>
                </div>
            )}

            {/* Archive Confirmation Modal */}
            {showArchiveModal && cardToArchive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeArchiveModal}
                    ></div>

                    <div className="relative bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] max-w-md w-full mx-4 p-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            Archive Card
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-2">
                            Are you sure you want to archive <span className="font-semibold">&quot;{cardToArchive.title}&quot;</span>?
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                            This card will be hidden from the active list. You can restore it later if needed.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeArchiveModal}
                                disabled={isArchiving}
                                className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 font-medium border-2 border-black dark:border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleArchive}
                                disabled={isArchiving}
                                className="px-4 py-2 bg-orange-600 text-white font-medium border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isArchiving ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Archiving...
                                    </>
                                ) : (
                                    <>
                                        <Archive size={16} />
                                        Archive
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
