"use client"
import React, { useState, useEffect } from 'react';
import { Search, Tag, RefreshCw, Filter, Grid, List, Plus, Eye, Edit, Archive } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SkeletonCardGrid from '@/components/CategorySkeleton/SkeletonCardGrid';
import SkeletonCardList from '@/components/CategorySkeleton/SkeletonCardList';

interface Category {
    id: number;
    name: string;
    description: string;
    color: string;
    status: string;
    itemCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export default function ListCategories() {
    const router = useRouter()
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [statusFilter, setStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [showFilters, setShowFilters] = useState(false);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch('/api/admin/categories', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            // Handle different response formats
            const categoriesData = Array.isArray(data) ? data : data.categories || data.data || [];

            setCategories(categoriesData);

        } catch (err) {
            console.error('Error fetching categories:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch categories');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCategory = () => {
        router.push("/admin/categories/create")
    }
    // Fetch categories on component mount
    useEffect(() => {
        fetchCategories();
    }, []);

    // Apply filters
    const getFilteredCategories = () => {
        let filtered = categories;

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(cat =>
                cat.status.toLowerCase() === statusFilter.toLowerCase()
            );
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(category =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                category.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Sort
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'items':
                    return (b.itemCount || 0) - (a.itemCount || 0);
                case 'newest':
                    return new Date(b.updatedAt || b.createdAt || '').getTime() -
                        new Date(a.updatedAt || a.createdAt || '').getTime();
                case 'oldest':
                    return new Date(a.createdAt || '').getTime() -
                        new Date(b.createdAt || '').getTime();
                default:
                    return 0;
            }
        });

        return filtered;
    };

    const filteredCategories = getFilteredCategories();
    const activeCategories = categories.filter(cat => cat.status.toLowerCase() === 'active');

    // Get unique statuses for filter dropdown
    const uniqueStatuses = [...new Set(categories.map(cat => cat.status))];

    const handleCategoryAction = (categoryId: number, action: 'view' | 'edit' | 'archive') => {
        console.log(`${action} category ${categoryId}`);
        // Add your navigation/action logic here
        switch (action) {
            case 'view':
                // Navigate to category detail page
                break;
            case 'edit':
                // Navigate to edit category page
                break;
            case 'archive':
                // Archive category logic
                break;
        }
    };

    const CategoryCard = ({ category }: { category: Category }) => (
        <div
            key={category.id}
            className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 group"
        >
            {/* Category Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="w-5 h-5 rounded-full border-2 border-black flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                    ></div>
                    <h3 className="font-bold text-lg truncate">{category.name}</h3>
                </div>

                {/* Action buttons - show on hover */}
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryAction(category.id, 'view');
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="View category"
                    >
                        <Eye size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryAction(category.id, 'edit');
                        }}
                        className="p-1 hover:bg-gray-100 rounded"
                        title="Edit category"
                    >
                        <Edit size={14} />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleCategoryAction(category.id, 'archive');
                        }}
                        className="p-1 hover:bg-gray-100 rounded text-red-600"
                        title="Archive category"
                    >
                        <Archive size={14} />
                    </button>
                </div>
            </div>

            {/* Description */}
            <p className="text-gray-600 mb-4 text-sm line-clamp-2">{category.description}</p>

            {/* Item Count and Status */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Tag size={14} />
                    <span>{category.itemCount || 0} items</span>
                </div>
                <div className={`text-xs px-2 py-1 rounded font-medium border ${category.status && category.status.toLowerCase() === 'active'
                    ? 'text-green-700 bg-green-100 border-green-200'
                    : category.status && category.status.toLowerCase() === 'inactive'
                        ? 'text-orange-700 bg-orange-100 border-orange-200'
                        : 'text-gray-700 bg-gray-100 border-gray-200'
                    }`}>
                    {category.status}
                </div>
            </div>
        </div>
    );

    const CategoryListItem = ({ category }: { category: Category }) => (
        <div
            key={category.id}
            className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 group"
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div
                        className="w-4 h-4 rounded-full border-2 border-black flex-shrink-0"
                        style={{ backgroundColor: category.color }}
                    ></div>
                    <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">{category.name}</h3>
                        <p className="text-gray-600 text-sm truncate">{category.description}</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Tag size={14} />
                        <span>{category.itemCount || 0} items</span>
                    </div>

                    <div className={`text-xs px-2 py-1 rounded font-medium border ${category.status && category.status.toLowerCase() === 'active'
                        ? 'text-green-700 bg-green-100 border-green-200'
                        : category.status && category.status.toLowerCase() === 'inactive'
                            ? 'text-orange-700 bg-orange-100 border-orange-200'
                            : 'text-gray-700 bg-gray-100 border-gray-200'
                        }`}>
                        {category.status}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                            onClick={() => handleCategoryAction(category.id, 'view')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="View category"
                        >
                            <Eye size={14} />
                        </button>
                        <button
                            onClick={() => handleCategoryAction(category.id, 'edit')}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Edit category"
                        >
                            <Edit size={14} />
                        </button>
                        <button
                            onClick={() => handleCategoryAction(category.id, 'archive')}
                            className="p-1 hover:bg-gray-100 rounded text-red-600"
                            title="Archive category"
                        >
                            <Archive size={14} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div>
            <div className="mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold">Categories</h1>
                        <p className="text-gray-600 mt-1">
                            Manage your product categories {!loading && `(${filteredCategories.length}
                            ${statusFilter !== 'all' ? ` ${statusFilter}` : ''} categories shown)`}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={fetchCategories}
                            disabled={loading}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-medium border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={`inline-block mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleCreateCategory}
                            className="px-4 py-2 bg-black text-white font-medium border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                            hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                        >
                            <Plus size={16} className="inline-block mr-2" />
                            New Category
                        </button>
                    </div>
                </div>

                {error && (
                    <div className="mt-4 bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-lg">
                        <div className="font-medium">Error loading categories</div>
                        <div className="text-sm mt-1">{error}</div>
                    </div>
                )}
            </div>

            {/* Search, Filter, and View Toggle Bar - Hidden during loading */}
            {!loading && (
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={`px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium ${showFilters ? 'bg-black text-white' : 'bg-white text-black'
                                }`}
                        >
                            <Filter size={16} className="inline-block mr-2" />
                            Filters
                        </button>

                        <div className="flex border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`px-3 py-3 font-medium transition-colors ${viewMode === 'grid' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                            >
                                <Grid size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-3 py-3 font-medium transition-colors border-l-2 border-black ${viewMode === 'list' ? 'bg-black text-white' : 'bg-white text-black hover:bg-gray-100'
                                    }`}
                            >
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Extended Filters - Hidden during loading */}
            {!loading && showFilters && (
                <div className="mb-6 p-4 bg-gray-50 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Status</label>
                            <select
                                className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <option value="all">All Statuses</option>
                                {uniqueStatuses.map(status => (
                                    <option key={status} value={status.toLowerCase()}>{status}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Sort By</label>
                            <select
                                className="w-full px-3 py-2 border-2 border-black rounded-lg shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <option value="name">Name (A-Z)</option>
                                <option value="items">Item Count (High-Low)</option>
                                <option value="newest">Recently Updated</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <>
                    {viewMode === 'grid' ? (
                        <SkeletonCardGrid count={8} />
                    ) : (
                        <SkeletonCardList count={6} />
                    )}
                </>
            )}

            {/* Categories Display - Only show when not loading */}
            {!loading && (
                <>
                    {filteredCategories.length > 0 ? (
                        <div className={
                            viewMode === 'grid'
                                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                                : "space-y-3"
                        }>
                            {filteredCategories.map((category) =>
                                viewMode === 'grid'
                                    ? <CategoryCard key={category.id} category={category} />
                                    : <CategoryListItem key={category.id} category={category} />
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                            {searchTerm || statusFilter !== 'all' ? (
                                <>
                                    <div className="text-gray-500 text-lg mb-2">No categories found</div>
                                    <div className="text-gray-400 text-sm mb-4">
                                        {searchTerm && `No results for "${searchTerm}"`}
                                        {searchTerm && statusFilter !== 'all' && ' with '}
                                        {statusFilter !== 'all' && `status "${statusFilter}"`}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('all');
                                        }}
                                        className="px-4 py-2 bg-black text-white font-medium border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                    >
                                        Clear Filters
                                    </button>
                                </>
                            ) : (
                                <>
                                    <div className="text-gray-500 text-lg mb-2">No categories available</div>
                                    <div className="text-gray-400 text-sm mb-4">Get started by creating your first category</div>
                                    <button
                                        onClick={handleCreateCategory}
                                        className="px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                    >
                                        <Plus size={16} className="inline-block mr-2" />
                                        Create First Category
                                    </button>
                                </>
                            )}
                        </div>
                    )}
                </>
            )}

            {/* Stats Summary - Only show when not loading and categories exist */}
            {!loading && categories.length > 0 && (
                <div className="mt-8 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
                    <h3 className="font-bold text-lg mb-4">Category Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-black">{categories.length}</div>
                            <div className="text-sm text-gray-600">Total Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{activeCategories.length}</div>
                            <div className="text-sm text-gray-600">Active Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">
                                {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
                            </div>
                            <div className="text-sm text-gray-600">Total Items</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{filteredCategories.length}</div>
                            <div className="text-sm text-gray-600">Showing</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
