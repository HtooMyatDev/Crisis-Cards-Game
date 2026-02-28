"use client"
import React, { useState, useEffect } from 'react';
// Added Archive icon
import { Edit, Plus, Search, Filter, Clock, Tag, Leaf, Archive, ChevronLeft, ChevronRight, Heart, DollarSign, Settings, Landmark } from 'lucide-react';
import {
    EnvironmentIcon,
    FinancialIcon,
    GovernmentIcon,
    LifeIcon,
    SettingsIcon,
    TopLogo
} from '@/components/game/CategoryIcons';
import SkeletonCardGrid from '@/components/skeletons/CardSkeletonGrid';
import { useRouter } from 'next/navigation';

// Updated card data type to include new values and response structure
interface CardResponse {
    id: number;
    text: string;
    order: number;
    politicalEffect?: number;
    economicEffect?: number;
    infrastructureEffect?: number;
    societyEffect?: number;
    environmentEffect?: number;
    cost?: number; // Added cost
    score?: number; // Added score
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

        const c = category.name.toLowerCase();
        let statPillBg = '#553C0E'; // Default
        let statPillTextColor = '#FDFAE5';

        if (c.includes('env')) {
            statPillBg = '#195012';
            statPillTextColor = '#399B2C';
        } else if (c.includes('eco')) {
            // Mapping Economic to Blue based on user screenshot parity
            statPillBg = '#133F4D';
            statPillTextColor = '#4190A9';
        } else if (c.includes('soc')) {
            // Mapping Social/Society to Yellow based on user screenshot parity
            statPillBg = '#665315';
            statPillTextColor = '#D9AD1F';
        } else if (c.includes('infra')) {
            statPillBg = '#665315';
            statPillTextColor = '#CA840C';
        } else if (c.includes('polit')) {
            statPillBg = '#450F0F';
            statPillTextColor = '#CD302F';
        }

        return {
            accentStyle: { backgroundColor: normalizedHex },
            borderStyle: { borderColor: normalizedHex },
            bgStyle: { backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` },
            textStyle: { color: normalizedHex },
            shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` },
            statPillBg,
            statPillTextColor
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
                        const styles = getCategoryStyles(card.category);
                        const cardBgColor = styles.accentStyle.backgroundColor;

                        return (
                            <div
                                key={card.id}
                                className="relative w-full aspect-[5/7] rounded-[24px] p-4 shadow-xl transition-all duration-300 hover:scale-[1.02] overflow-hidden font-sans text-white group"
                                style={{ backgroundColor: cardBgColor }}
                            >
                                {/* Inset Border mimicking the playing card look */}
                                <div className="absolute inset-[10px] border border-[#FDFAE5]/40 rounded-[1.6rem] pointer-events-none z-10" />

                                {/* Playing Card Header - Themed Pill Asset */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center pointer-events-none">
                                    <TopLogo className="w-24 h-auto drop-shadow-sm" />
                                </div>

                                {/* Content Container - Fixed Height for Layout Control */}
                                <div className="relative z-10 flex flex-col items-center h-full pt-14 pb-8">
                                    {/* Status Controls */}
                                    <div className="absolute top-10 right-2 flex gap-1 z-40">
                                        <span className={`px-2 py-0.5 text-[8px] uppercase font-black tracking-widest rounded-md border border-white/20 backdrop-blur-md ${card.status === 'Active'
                                            ? 'bg-green-500/30 text-green-100'
                                            : 'bg-red-500/30 text-red-100'
                                            }`}>
                                            {card.status}
                                        </span>
                                    </div>

                                    {/* Title & Description area - Top 16% */}
                                    <div className="absolute top-[16%] left-0 w-full text-center px-6 space-y-1">
                                        <h3
                                            className="font-serif italic text-[16px] sm:text-[18px] tracking-tight leading-tight uppercase font-bold line-clamp-2 min-h-[2.4rem] flex items-center justify-center"
                                            style={{ color: styles.statPillBg }}
                                        >
                                            {card.title}
                                        </h3>
                                        <p
                                            className="font-sans text-[10px] font-medium leading-tight line-clamp-2 max-w-[92%] mx-auto"
                                            style={{ color: styles.statPillBg, opacity: 0.8 }}
                                        >
                                            {card.description}
                                        </p>
                                    </div>

                                    {/* Response Headers - Top 32% */}
                                    <div className="absolute top-[32%] w-full px-6 flex justify-between items-baseline">
                                        <span
                                            className="font-serif italic font-bold text-[11px]"
                                            style={{ color: styles.statPillBg }}
                                        >
                                            Response Options
                                        </span>
                                        <div className="flex items-center gap-1.5 opacity-85">
                                            <Clock size={10} style={{ color: styles.statPillBg }} />
                                            <span
                                                className="font-serif italic font-bold text-[10px]"
                                                style={{ color: styles.statPillBg }}
                                            >
                                                {card.timeLimit ? `${card.timeLimit} Mins` : '∞'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Response Options - Starting at 38% with fixed intervals */}
                                    <div className="absolute top-[38%] w-full px-6">
                                        <div className="flex flex-col gap-3">
                                            {responses.slice(0, 3).map((response, idx) => {
                                                const letter = String.fromCharCode(65 + idx);

                                                return (
                                                    <div key={response.id} className="relative w-full flex flex-col gap-1">
                                                        {/* Hovering Cost Pill */}
                                                        {response.cost !== undefined && (
                                                            <div className="absolute -top-3 right-3 z-40">
                                                                <div
                                                                    className="px-2 py-0.5 rounded shadow border border-white/10 text-[7.5px] font-black"
                                                                    style={{ backgroundColor: styles.accentStyle.backgroundColor, color: '#FDFAE5' }}
                                                                >
                                                                    {(response.cost || 0) > 0 ? `-${response.cost}` : response.cost || '0'}
                                                                </div>
                                                            </div>
                                                        )}

                                                        {/* Response Unit */}
                                                        <div className="w-full flex items-stretch rounded-xl border-[2px] border-[#FDFAE5] overflow-hidden shadow-sm min-h-[2.4rem]">
                                                            <div
                                                                className="w-7 flex items-center justify-center shrink-0"
                                                                style={{ backgroundColor: cardBgColor }}
                                                            >
                                                                <span className="font-serif italic text-[12px] text-[#FDFAE5] font-black">
                                                                    {letter}
                                                                </span>
                                                            </div>
                                                            <div className="flex-1 bg-[#FDFAE5] px-2 py-1 flex items-center">
                                                                <p
                                                                    className="text-[8.5px] font-bold leading-tight line-clamp-2"
                                                                    style={{ color: styles.statPillTextColor }}
                                                                >
                                                                    {response.text}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* High Fidelity Stats Row - Left-aligned grid for perfect vertical parity */}
                                                        <div className="grid grid-cols-5 gap-x-1 sm:gap-x-2 w-fit px-1 py-0.5">
                                                            {[
                                                                { id: 'eco', icon: FinancialIcon, val: response.economicEffect },
                                                                { id: 'soc', icon: LifeIcon, val: response.societyEffect },
                                                                { id: 'env', icon: EnvironmentIcon, val: response.environmentEffect },
                                                                { id: 'pol', icon: GovernmentIcon, val: response.politicalEffect },
                                                                { id: 'inf', icon: SettingsIcon, val: response.infrastructureEffect }
                                                            ].map((stat) => {
                                                                const Icon = stat.icon;
                                                                return (
                                                                    <div key={stat.id} className="flex items-center gap-1 min-w-[2.1rem] sm:min-w-[2.2rem] opacity-95">
                                                                        <div
                                                                            className="w-4 h-4 shrink-0 rounded-full flex items-center justify-center shadow-sm"
                                                                            style={{ backgroundColor: styles.statPillBg }}
                                                                        >
                                                                            <Icon size={11} style={{ color: styles.statPillTextColor }} />
                                                                        </div>
                                                                        {/* Count matches pill background color as requested */}
                                                                        <span
                                                                            className="text-[0.5rem] sm:text-[0.55rem] font-black whitespace-nowrap"
                                                                            style={{ color: styles.statPillBg }}
                                                                        >
                                                                            {stat.val && (stat.val > 0 ? `+${stat.val}` : stat.val)}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            {responses.length > 3 && (
                                                <div className="flex items-center justify-center gap-1 text-[7px] font-black uppercase tracking-widest text-[#FDFAE5]/30">
                                                    <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                                                    {responses.length - 3} more
                                                    <div className="w-1 h-1 rounded-full bg-current opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons & Category Footer - Absolute Bottom */}
                                    <div className="absolute bottom-4 left-0 w-full px-4 flex flex-col gap-3">
                                        <div className="flex gap-1.5 w-full">
                                            <button
                                                onClick={() => handleEdit(card.id)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FDFAE5]/90 hover:bg-[#FDFAE5] text-blue-800 rounded-xl text-[9.5px] font-black shadow-md transition-all hover:scale-105 active:scale-95 min-w-0 overflow-hidden whitespace-nowrap"
                                            >
                                                <Edit size={10} strokeWidth={3} className="shrink-0" />
                                                <span className="truncate">EDIT</span>
                                            </button>
                                            <button
                                                onClick={() => openArchiveModal(card.id, card.title)}
                                                className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-[#FDFAE5]/90 hover:bg-[#FDFAE5] text-orange-800 rounded-xl text-[9.5px] font-black shadow-md transition-all hover:scale-105 active:scale-95 min-w-0 overflow-hidden whitespace-nowrap"
                                            >
                                                <Archive size={10} strokeWidth={3} className="shrink-0" />
                                                <span className="truncate">ARCHIVE</span>
                                            </button>
                                        </div>

                                        <div className="text-center">
                                            <span className="font-serif italic font-bold text-[#FDFAE5]/80 text-[10px] uppercase tracking-[0.2em] drop-shadow-sm">
                                                {card.category?.name}
                                            </span>
                                        </div>
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
