"use client"
import React, { useState, useEffect } from 'react';
// Added Archive icon
import { Edit, Plus, Search, Filter, Clock, Tag, Zap, Shield, TrendingUp, Building2, Users, Leaf, Archive, ChevronLeft, ChevronRight, Heart, DollarSign, Settings, Landmark } from 'lucide-react';
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
                        const responses = card.cardResponses || [];
                        const cardBgColor = card.category?.name?.toLowerCase() === 'environmental' ? '#4ea342' : (card.category?.color || '#4ea342');

                        return (
                            <div
                                key={card.id}
                                className="relative w-full rounded-[2.5rem] p-6 shadow-xl transition-all duration-300 hover:scale-[1.01] hover:shadow-2xl overflow-hidden font-sans text-[#1a1a1a]"
                                style={{ backgroundColor: cardBgColor }}
                            >
                                {/* Top Decoration: White pill with colored dots (Scaled down slightly) */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-4 py-2 rounded-b-[1.2rem] shadow-sm flex gap-1.5 z-20">
                                    <div className="w-3 h-3 rounded-full bg-[#4CAF50]" />
                                    <div className="w-3 h-3 rounded-full bg-[#2196F3]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FFC107]" />
                                    <div className="w-3 h-3 rounded-full bg-[#F44336]" />
                                </div>

                                {/* Content Container */}
                                <div className="relative z-10 flex flex-col items-center mt-6">

                                    {/* Edit/Archive/Status Controls (Absolute positioned for admin access) */}
                                    <div className="absolute top-0 right-0 flex gap-1">
                                        <span className={`px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider rounded-md border border-black/10 ${card.status === 'Active'
                                            ? 'bg-white/80 text-green-800'
                                            : 'bg-white/80 text-red-800'
                                            }`}>
                                            {card.status}
                                        </span>
                                    </div>

                                    {/* Title & Description */}
                                    <div className="text-center mb-6 px-1 space-y-2 w-full">
                                        <h3 className="font-serif italic text-2xl text-[#1a1a1a]/90 tracking-tight leading-[1.1] drop-shadow-sm min-h-[3rem] flex items-center justify-center">
                                            {card.title}
                                        </h3>
                                        <p className="font-sans text-[#1a1a1a]/70 text-sm font-medium leading-relaxed line-clamp-3 max-w-[90%] mx-auto">
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Stats Grid (Replacing the old grid with a compact row or grid) */}
                                    <div className="flex flex-wrap justify-center gap-1.5 mb-4 opacity-80">
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <Shield size={12} strokeWidth={3} /> {card.political || 0}
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <DollarSign size={12} strokeWidth={3} /> {card.economic || 0}
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <Landmark size={12} strokeWidth={3} /> {card.infrastructure || 0}
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <Heart size={12} strokeWidth={3} /> {card.society || 0}
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <Settings size={12} strokeWidth={3} /> {card.environment || 0}
                                        </div>
                                        <div className="flex items-center gap-1 bg-black/5 px-2 py-1 rounded-full text-xs font-bold text-[#1a1a1a]">
                                            <Clock size={12} strokeWidth={3} /> {card.timeLimit}m
                                        </div>
                                    </div>

                                    {/* Response Options */}
                                    <div className="w-full space-y-2 mb-4">
                                        {responses.slice(0, 2).map((response, idx) => {
                                            const letter = String.fromCharCode(65 + idx);
                                            return (
                                                <div key={response.id} className="w-full flex items-stretch bg-[#FDFBF7] rounded-lg overflow-hidden shadow-sm h-12">
                                                    {/* Letter Block */}
                                                    <div
                                                        className="w-10 flex items-center justify-center bg-black/10 border-r border-black/5"
                                                        style={{ backgroundColor: cardBgColor, filter: 'brightness(0.9)' }}
                                                    >
                                                        <span className="font-serif italic text-xl text-white font-bold">
                                                            {letter}
                                                        </span>
                                                    </div>
                                                    {/* Text */}
                                                    <div className="flex-1 p-2 flex items-center">
                                                        <p className="text-[#1a1a1a] text-xs font-medium text-left leading-tight line-clamp-2">
                                                            {response.text}
                                                        </p>
                                                    </div>
                                                    {/* Cost */}
                                                    {/* <div className="pr-2 flex items-center">
                                                         // We could show cost here if available in the view model, but the interface says CardResponse has specific fields.
                                                         // The interface in this file: politicalEffect etc. No cost?
                                                         // Checking interface... interface CardResponse has id, text, order, and effects. No explicit 'cost' field shown in the types in this file (lines 8-19).
                                                         // It seems 'cost' might be missing in this specific page's type def or just not used. I'll skip it for now.
                                                    </div> */}
                                                </div>
                                            );
                                        })}
                                        {responses.length > 2 && (
                                            <div className="text-center text-xs font-serif italic text-[#1a1a1a]/60">
                                                +{responses.length - 2} more options
                                            </div>
                                        )}
                                        {responses.length === 0 && (
                                            <div className="text-center text-xs font-serif italic text-[#1a1a1a]/40 py-2">
                                                No options defined
                                            </div>
                                        )}
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 w-full mt-auto">
                                        <button
                                            onClick={() => handleEdit(card.id)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-blue-600 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105"
                                        >
                                            <Edit size={14} />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => openArchiveModal(card.id, card.title)}
                                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-white/90 hover:bg-white text-orange-600 rounded-lg text-sm font-bold shadow-sm transition-all hover:scale-105"
                                        >
                                            <Archive size={14} />
                                            Archive
                                        </button>
                                    </div>

                                    {/* Footer Category */}
                                    <div className="mt-4">
                                        <h3 className="font-serif italic text-[#1a1a1a]/40 text-sm tracking-wide capitalize mix-blend-multiply">
                                            {card.category?.name || 'Event'}
                                        </h3>
                                    </div>

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
