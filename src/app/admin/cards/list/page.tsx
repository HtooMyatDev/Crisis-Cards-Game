"use client"
import React, { useState, useEffect } from 'react';
import { Edit, Trash2, Plus, Search, Filter, Clock, Tag } from 'lucide-react';

// Define the card data type
interface CrisisCard {
    id: string;
    name: string;
    description: string;
    category: string;
    timeLimit: number;
    responseOptions: string[];
    status: 'Active' | 'Inactive';
    createdAt: string;
    updatedAt: string;
}

export default function CrisisCardList() {
    const [cards, setCards] = useState<CrisisCard[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
    const [categoryFilter, setCategoryFilter] = useState<string>('All');

    // Added missing state for view management
    const [currentView, setCurrentView] = useState<'list' | 'edit' | 'create'>('list');
    const [editingCardId, setEditingCardId] = useState<string | null>(null);

    // Category color mapping
    const getCategoryColors = (category: string) => {
        const colorMap: { [key: string]: { bg: string, border: string, text: string, shadow: string, accent: string } } = {
            'Emergency': {
                bg: 'bg-red-50',
                border: 'border-red-500',
                text: 'text-red-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]',
                accent: 'bg-red-500'
            },
            'Crisis': {
                bg: 'bg-orange-50',
                border: 'border-orange-500',
                text: 'text-orange-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(249,115,22,1)]',
                accent: 'bg-orange-500'
            },
            'Technical': {
                bg: 'bg-blue-50',
                border: 'border-blue-500',
                text: 'text-blue-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(59,130,246,1)]',
                accent: 'bg-blue-500'
            },
            'Medical': {
                bg: 'bg-green-50',
                border: 'border-green-500',
                text: 'text-green-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(34,197,94,1)]',
                accent: 'bg-green-500'
            },
            'Security': {
                bg: 'bg-purple-50',
                border: 'border-purple-500',
                text: 'text-purple-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(168,85,247,1)]',
                accent: 'bg-purple-500'
            },
            'Environmental': {
                bg: 'bg-teal-50',
                border: 'border-teal-500',
                text: 'text-teal-700',
                shadow: 'shadow-[4px_4px_0px_0px_rgba(20,184,166,1)]',
                accent: 'bg-teal-500'
            }
        };

        return colorMap[category] || {
            bg: 'bg-gray-50',
            border: 'border-gray-500',
            text: 'text-gray-700',
            shadow: 'shadow-[4px_4px_0px_0px_rgba(107,114,128,1)]',
            accent: 'bg-gray-500'
        };
    };

    // Mock data - replace with actual API call
    useEffect(() => {
        const fetchCards = async () => {
            try {
                // Simulate API call
                setTimeout(() => {
                    const mockCards: CrisisCard[] = [
                        {
                            id: '1',
                            name: 'Emergency Response Protocol',
                            description: 'Quick response procedures for handling emergency situations in the workplace.',
                            category: 'Emergency',
                            timeLimit: 15,
                            responseOptions: ['Call 911', 'Evacuate immediately', 'Contact supervisor'],
                            status: 'Active',
                            createdAt: '2024-01-15',
                            updatedAt: '2024-01-20'
                        },
                        {
                            id: '2',
                            name: 'Crisis Communication',
                            description: 'Guidelines for effective communication during crisis situations.',
                            category: 'Crisis',
                            timeLimit: 30,
                            responseOptions: ['Alert team', 'Document incident'],
                            status: 'Active',
                            createdAt: '2024-01-10',
                            updatedAt: '2024-01-18'
                        },
                        {
                            id: '3',
                            name: 'Equipment Failure Response',
                            description: 'Steps to take when critical equipment fails during operations.',
                            category: 'Technical',
                            timeLimit: 45,
                            responseOptions: ['Switch to backup', 'Call maintenance', 'Stop operations'],
                            status: 'Inactive',
                            createdAt: '2024-01-05',
                            updatedAt: '2024-01-12'
                        }
                    ];
                    setCards(mockCards);
                    setLoading(false);
                }, 1000);
            } catch (error) {
                console.error('Error fetching cards:', error);
                setLoading(false);
            }
        };

        fetchCards();
    }, []);

    // Get unique categories for filter
    const categories = ['All', ...new Set(cards.map(card => card.category))];

    // Filter cards based on search and filters
    const filteredCards = cards.filter(card => {
        const matchesSearch = card.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            card.category.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'All' || card.status === statusFilter;
        const matchesCategory = categoryFilter === 'All' || card.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Handler functions
    const handleBackToList = () => {
        setCurrentView('list');
        setEditingCardId(null);
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this card?')) {
            try {
                // API call to delete card
                // await fetch(`/api/cards/${id}`, { method: 'DELETE' });

                // Remove from local state
                setCards(cards.filter(card => card.id !== id));
                console.log(`Card ${id} deleted successfully`);
            } catch (error) {
                console.error('Error deleting card:', error);
            }
        }
    };

    const handleEdit = (id: string) => {
        setEditingCardId(id);
        setCurrentView('edit');
    };

    const handleCreateNew = () => {
        setCurrentView('create');
    };

    // Show edit/create view
    if (currentView === 'edit' || currentView === 'create') {
        return (
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={handleBackToList}
                        className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        ← Back to List
                    </button>
                    <h1 className="text-2xl font-bold">
                        {currentView === 'edit' ? 'Edit Crisis Card' : 'Create New Crisis Card'}
                    </h1>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-8 text-center">
                    <h2 className="text-xl font-bold mb-4">
                        {currentView === 'edit' ? `Editing Card: ${editingCardId}` : 'Creating New Card'}
                    </h2>
                    <p className="text-gray-600 mb-6">
                        The edit form would appear here. In a real application, you would use the EditCrisisCard component created above.
                    </p>

                    {/* Placeholder form elements */}
                    <div className="space-y-4 text-left max-w-md mx-auto">
                        <div>
                            <label className="block text-sm font-semibold mb-2">Card Name</label>
                            <input
                                type="text"
                                className="w-full px-3 py-2 border-2 border-black rounded-lg"
                                placeholder="Enter card name..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Description</label>
                            <textarea
                                className="w-full px-3 py-2 border-2 border-black rounded-lg"
                                rows={3}
                                placeholder="Enter description..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Category</label>
                            <select className="w-full px-3 py-2 border-2 border-black rounded-lg">
                                <option>Emergency</option>
                                <option>Crisis</option>
                                <option>Technical</option>
                                <option>Medical</option>
                                <option>Security</option>
                                <option>Environmental</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex gap-4 justify-center mt-6">
                        <button
                            onClick={() => {
                                // Mock save action
                                alert(`Card ${currentView === 'edit' ? 'updated' : 'created'} successfully!`);
                                handleBackToList();
                            }}
                            className="px-6 py-2 bg-green-600 text-white font-bold border-2 border-green-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(22,163,74,1)] hover:shadow-[1px_1px_0px_0px_rgba(22,163,74,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                        >
                            {currentView === 'edit' ? 'Update Card' : 'Create Card'}
                        </button>
                        <button
                            onClick={handleBackToList}
                            className="px-6 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-xl font-semibold">Loading cards...</div>
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

            {/* Search and Filters */}
            <div className="bg-gray-50 p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    {/* Search */}
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

                    {/* Status Filter */}
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

                    {/* Category Filter */}
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

            {/* Category Color Legend */}
            <div className="mb-6">
                <div className="flex flex-wrap gap-3">
                    {categories.filter(cat => cat !== 'All').map(category => {
                        const colors = getCategoryColors(category);
                        return (
                            <div key={category} className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full border-2 ${colors.bg} ${colors.border}`}></div>
                                <span className="text-sm font-medium">{category}</span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Results Count */}
            <div className="mb-4">
                <p className="text-gray-600">
                    Showing {filteredCards.length} of {cards.length} cards
                </p>
            </div>

            {/* Cards Grid */}
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
                        const colors = getCategoryColors(card.category);
                        return (
                            <div
                                key={card.id}
                                className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 relative"
                            >
                                {/* Color accent bar */}
                                <div className={`absolute top-0 left-0 w-full h-1 ${colors.accent} rounded-t-md`}></div>

                                {/* Card Header */}
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                        {card.name}
                                    </h3>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${
                                        card.status === 'Active'
                                            ? 'bg-green-100 text-green-800 border-green-800'
                                            : 'bg-red-100 text-red-800 border-red-800'
                                    }`}>
                                        {card.status}
                                    </span>
                                </div>

                                {/* Description */}
                                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                    {card.description}
                                </p>

                                {/* Card Details */}
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2 text-sm">
                                        <Tag size={16} className="text-gray-500" />
                                        <span className={`font-medium px-2 py-1 ${colors.bg} border-2 border-gray-200 rounded-full text-xs ${colors.text}`}>
                                            {card.category}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className="text-gray-500" />
                                        <span className="text-gray-700">{card.timeLimit} minutes</span>
                                    </div>
                                </div>

                                {/* Response Options */}
                                <div className="mb-4">
                                    <p className="text-sm font-semibold mb-2 text-gray-700">Response Options:</p>
                                    <div className="space-y-1">
                                        {card.responseOptions.slice(0, 2).map((option, index) => (
                                            <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300 text-gray-700">
                                                {option}
                                            </div>
                                        ))}
                                        {card.responseOptions.length > 2 && (
                                            <div className="text-xs text-gray-500">
                                                +{card.responseOptions.length - 2} more options
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t border-gray-200">
                                    <button
                                        onClick={() => handleEdit(card.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-blue-50"
                                    >
                                        <Edit size={16} />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(card.id)}
                                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-red-50"
                                    >
                                        <Trash2 size={16} />
                                        Delete
                                    </button>
                                </div>

                                {/* Timestamps */}
                                <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                                    <div>Created: {new Date(card.createdAt).toLocaleDateString()}</div>
                                    <div>Updated: {new Date(card.updatedAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
