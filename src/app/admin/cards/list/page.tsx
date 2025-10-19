"use client"
import React, { useState, useEffect } from 'react';
// Added Archive icon
import { Edit, Plus, Search, Filter, Clock, Tag, Zap, Shield, TrendingUp, Heart, Users, Archive } from 'lucide-react';
import SkeletonCardGrid from '@/components/skeletons/CardSkeletonGrid';
import { useRouter } from 'next/navigation';

// Updated card data type to include new values and response structure
interface CardResponse {
    id: number;
    text: string;
    order: number;
    pwEffect: number;
    efEffect: number;
    psEffect: number;
    grEffect: number;
    cardId?: string;
}

interface CrisisCard {
    id: string;
    title: string;
    description: string;
    timeLimit: number;
    pwValue: number;
    efValue: number;
    psValue: number;
    grValue: number;
    cardResponses?: CardResponse[];
    responseOptions?: string[];
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
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');
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

    useEffect(() => {
        const fetchCards = async () => {
            try {
                const response = await fetch('/api/admin/cards?isArchived=false', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json()
                const cardsData = data.cards || data.data || data

                if (Array.isArray(cardsData)) {
                    setCards(cardsData)
                } else {
                    console.error('Expected array of cards, got:', cardsData);
                    setCards([]);
                }
            } catch (error) {
                console.error('Error fetching cards:', error);
                setLoading(false);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    const categories = ['All', ...new Set(cards.map(card => card.category?.name).filter(Boolean))];

    const filteredCards = cards.filter(card => {
        const matchesSearch = card.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            card.category?.name?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || card.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || card.category?.name === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

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
                    <button className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                        <Plus size={20} />
                        Create New Card
                    </button>
                </div>

                <div className="bg-gray-50 p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6 animate-pulse">
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
                <h1 className="text-2xl font-bold">Crisis Cards</h1>
                <button
                    onClick={handleCreateNew}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                    <Plus size={20} />
                    Create New Card
                </button>
            </div>

            <div className="bg-gray-50 p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search cards..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={20} />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as 'All' | 'Active' | 'Inactive')}
                            className="px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
                            className="px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
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
                <p className="text-gray-600">
                    Showing {filteredCards.length} of {cards.length} cards
                </p>
            </div>

            {filteredCards.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-4">No cards found matching your criteria</p>
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
                        const legacyOptions = card.responseOptions || [];

                        return (
                            <div
                                key={card.id}
                                className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 relative"
                            >
                                <div
                                    className="absolute top-0 left-0 w-full h-1 rounded-t-md"
                                    style={styles.accentStyle}
                                ></div>

                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                        {card.title}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${card.status === 'Active'
                                        ? 'bg-green-100 text-green-800 border-green-800'
                                        : 'bg-red-100 text-red-800 border-red-800'
                                        }`}>
                                        {card.status}
                                    </span>
                                </div>

                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {card.description}
                                </p>

                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Tag size={16} className="text-gray-500" />
                                        <span
                                            className="font-medium px-2 py-1 border-2 border-gray-200 rounded-full text-xs"
                                            style={{
                                                ...styles.bgStyle,
                                                ...styles.textStyle
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
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="text-gray-700">{card.timeLimit} minutes</span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Zap size={16} className="text-gray-500" />
                                        <p className="text-sm font-semibold text-gray-700">Card Values:</p>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2">
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                            <Shield size={16} className="text-blue-500" />
                                            <span className="text-sm font-bold text-gray-800">{card.pwValue || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                            <TrendingUp size={16} className="text-green-500" />
                                            <span className="text-sm font-bold text-gray-800">{card.efValue || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                            <Heart size={16} className="text-red-500" />
                                            <span className="text-sm font-bold text-gray-800">{card.psValue || 0}</span>
                                        </div>
                                        <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                            <Users size={16} className="text-yellow-500" />
                                            <span className="text-sm font-bold text-gray-800">{card.grValue || 0}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <p className="text-sm font-semibold mb-2 text-gray-700">Response Options:</p>
                                    <div className="space-y-2">
                                        {responses.length > 0 ? (
                                            responses.slice(0, 2).map((response) => (
                                                <div key={response.id} className="text-xs bg-gray-100 p-2 rounded border border-gray-300">
                                                    <div className="text-gray-700 mb-1">{response.text}</div>
                                                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.pwEffect)}`}>
                                                            <Shield size={12} />
                                                            <span>PW: {formatEffect(response.pwEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.efEffect)}`}>
                                                            <TrendingUp size={12} />
                                                            <span>EF: {formatEffect(response.efEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.psEffect)}`}>
                                                            <Heart size={12} />
                                                            <span>PS: {formatEffect(response.psEffect)}</span>
                                                        </span>
                                                        <span className={`flex items-center gap-1 font-medium ${getEffectColor(response.grEffect)}`}>
                                                            <Users size={12} />
                                                            <span>GR: {formatEffect(response.grEffect)}</span>
                                                        </span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : legacyOptions.length > 0 ? (
                                            legacyOptions.slice(0, 2).map((option, index) => (
                                                <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300 text-gray-700" >
                                                    {option}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                No response options found for this card
                                            </div>
                                        )}

                                        {responses.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{responses.length - 2} more options
                                            </div>
                                        )}
                                        {legacyOptions.length > 2 && responses.length === 0 && (
                                            <div className="text-xs text-gray-500">
                                                +{legacyOptions.length - 2} more options
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(card.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-blue-50"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => openArchiveModal(card.id, card.title)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(234,88,12,1)] hover:shadow-[1px_1px_0px_0px_rgba(234,88,12,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-orange-50"
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

            {/* Archive Confirmation Modal */}
            {showArchiveModal && cardToArchive && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={closeArchiveModal}
                    ></div>

                    <div className="relative bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4 p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                            Archive Card
                        </h3>
                        <p className="text-gray-600 mb-2">
                            Are you sure you want to archive <span className="font-semibold">"{cardToArchive.title}"</span>?
                        </p>
                        <p className="text-sm text-gray-500 mb-6">
                            This card will be hidden from the active list. You can restore it later if needed.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={closeArchiveModal}
                                disabled={isArchiving}
                                className="px-4 py-2 text-gray-700 bg-white font-medium border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50"
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
