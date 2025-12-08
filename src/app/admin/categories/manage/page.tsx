"use client"
import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, MoreVertical, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Category {
    id: number;
    name: string;
    description: string | null;
    status: 'ACTIVE' | 'INACTIVE';
    createdAt: string;
    colorPreset?: {
        backgroundColor: string;
        textColor: string;
        textBoxColor: string;
    };
    _count?: {
        cards: number;
    };
}

export default function ManageCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [togglingId, setTogglingId] = useState<number | null>(null);

    const router = useRouter();

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/categories?includeCards=true&presets=true');
            if (!response.ok) throw new Error('Failed to fetch categories');
            const data = await response.json();
            if (data.success) {
                setCategories(data.categories);
            } else {
                setError(data.error || 'Failed to load categories');
            }
        } catch (err) {
            console.error('Error fetching categories:', err);
            setError('An error occurred while loading categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    // Filter categories based on search and status
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (category.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' ||
            (statusFilter === 'Active' ? category.status === 'ACTIVE' : category.status === 'INACTIVE');
        return matchesSearch && matchesStatus;
    });

    const handleEdit = (categoryId: number) => {
        router.push(`/admin/categories/edit/${categoryId}`);
    };

    const handleDelete = async (id: number, cardCount: number = 0) => {
        if (cardCount > 0) {
            if (!confirm(`This category contains ${cardCount} cards. Deleting it will also delete all associated cards. Are you sure you want to proceed?`)) {
                return;
            }
        } else {
            if (!confirm('Are you sure you want to delete this category?')) {
                return;
            }
        }

        setDeletingId(id);
        try {
            const response = await fetch(`/api/admin/categories?id=${id}&force=true`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to delete category');
            }

            setCategories(categories.filter(cat => cat.id !== id));
        } catch (err) {
            console.error('Error deleting category:', err);
            alert(err instanceof Error ? err.message : 'Failed to delete category');
        } finally {
            setDeletingId(null);
        }
    };

    const toggleStatus = async (id: number, currentStatus: 'ACTIVE' | 'INACTIVE') => {
        setTogglingId(id);
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            const response = await fetch('/api/admin/categories', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id,
                    status: newStatus
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            setCategories(categories.map(cat =>
                cat.id === id ? { ...cat, status: newStatus } : cat
            ));
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Failed to update category status');
        } finally {
            setTogglingId(null);
        }
    };

    if (loading && categories.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-[400px]">
                <Loader2 className="animate-spin h-8 w-8 text-blue-500" />
            </div>
        );
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-black dark:text-white">Manage Categories</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Edit, disable, or delete existing categories</p>
                </div>
                <button
                    onClick={() => router.push('/admin/categories/create')}
                    className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 flex items-center"
                >
                    <Plus size={16} className="mr-2" />
                    Create New Category
                </button>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-black dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 border-2 border-black dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] font-medium"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        {/* Category Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-black dark:border-gray-600"
                                    style={{ backgroundColor: category.colorPreset?.backgroundColor || '#e5e7eb' }}
                                ></div>
                                <div>
                                    <h3 className="font-bold text-lg text-black dark:text-white">{category.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${category.status === 'ACTIVE'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                        }`}>
                                        {category.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm line-clamp-2 h-10">
                            {category.description || 'No description provided'}
                        </p>

                        {/* Stats */}
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                {category._count?.cards || 0} cards
                            </span>
                            <span className="text-gray-500 dark:text-gray-500">
                                {new Date(category.createdAt).toLocaleDateString()}
                            </span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(category.id)}
                                className="flex-1 px-3 py-2 bg-indigo-500 text-white font-medium rounded border-2 border-indigo-600 shadow-[2px_2px_0px_0px_rgba(79,70,229,1)] hover:shadow-[1px_1px_0px_0px_rgba(79,70,229,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
                            >
                                <Edit size={14} className="mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={() => toggleStatus(category.id, category.status)}
                                disabled={togglingId === category.id}
                                className={`flex-1 px-3 py-2 font-medium rounded border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 flex items-center justify-center ${category.status === 'ACTIVE'
                                    ? 'bg-orange-400 border-orange-500 text-orange-900'
                                    : 'bg-emerald-400 border-emerald-500 text-emerald-900'
                                    }`}
                            >
                                {togglingId === category.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <>
                                        <Eye size={14} className="mr-1" />
                                        {category.status === 'ACTIVE' ? 'Disable' : 'Enable'}
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => handleDelete(category.id, category._count?.cards)}
                                disabled={deletingId === category.id}
                                className="px-3 py-2 bg-rose-500 text-white font-medium rounded border-2 border-rose-600 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:shadow-[1px_1px_0px_0px_rgba(225,29,72,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 flex items-center justify-center"
                            >
                                {deletingId === category.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {!loading && filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 dark:text-gray-400 text-lg">No categories found</div>
                    <div className="text-gray-400 dark:text-gray-500 text-sm mt-2">Try adjusting your search or filter criteria</div>
                </div>
            )}
        </div>
    );
}
