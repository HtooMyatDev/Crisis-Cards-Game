"use client"
import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, Filter, MoreVertical } from 'lucide-react';

export default function ManageCategories() {
    // Mock data for categories
    const [categories, setCategories] = useState([
        {
            id: 1,
            name: "Electronics",
            description: "Electronic devices and gadgets",
            color: "#3B82F6",
            status: "Active",
            itemCount: 45,
            createdDate: "2024-01-15"
        },
        {
            id: 2,
            name: "Clothing",
            description: "Fashion and apparel items",
            color: "#EF4444",
            status: "Active",
            itemCount: 23,
            createdDate: "2024-02-10"
        },
        {
            id: 3,
            name: "Books",
            description: "Literature and educational materials",
            color: "#10B981",
            status: "Inactive",
            itemCount: 12,
            createdDate: "2024-01-28"
        },
        {
            id: 4,
            name: "Sports",
            description: "Sports equipment and accessories",
            color: "#F59E0B",
            status: "Active",
            itemCount: 18,
            createdDate: "2024-03-05"
        },
        {
            id: 5,
            name: "Home & Garden",
            description: "Household items and gardening supplies",
            color: "#8B5CF6",
            status: "Active",
            itemCount: 31,
            createdDate: "2024-02-20"
        },
        {
            id: 6,
            name: "Food & Beverage",
            description: "Food items and drinks",
            color: "#F97316",
            status: "Inactive",
            itemCount: 8,
            createdDate: "2024-01-10"
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Filter categories based on search and status
    const filteredCategories = categories.filter(category => {
        const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            category.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || category.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleEdit = (categoryId) => {
        // Navigate to edit page with category ID
        // In a real app, you'd use Next.js router or similar
        window.location.href = `/admin/categories/edit/${categoryId}`;
    };

    const handleDelete = (id) => {
        if (confirm('Are you sure you want to delete this category?')) {
            setCategories(categories.filter(cat => cat.id !== id));
        }
    };

    const toggleStatus = (id) => {
        setCategories(categories.map(cat =>
            cat.id === id
                ? { ...cat, status: cat.status === 'Active' ? 'Inactive' : 'Active' }
                : cat
        ));
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Manage Categories</h1>
                    <p className="text-gray-600 mt-1">Edit, disable, or delete existing categories</p>
                </div>
                <a href="/admin/categories/create" className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200">
                    <Plus size={16} className="inline-block mr-2" />
                    Create New Category
                </a>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                    <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search categories..."
                        className="w-full pl-10 pr-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <select
                    className="px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                >
                    <option value="All">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                </select>
            </div>

            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        {/* Category Header */}
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-black"
                                    style={{ backgroundColor: category.color }}
                                ></div>
                                <div>
                                    <h3 className="font-bold text-lg">{category.name}</h3>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        category.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {category.status}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 text-sm">{category.description}</p>

                        {/* Stats */}
                        <div className="flex justify-between items-center mb-4 text-sm">
                            <span className="font-medium">{category.itemCount} items</span>
                            <span className="text-gray-500">Created: {category.createdDate}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(category.id)}
                                className="flex-1 px-3 py-2 bg-indigo-500 text-white font-medium rounded border-2 border-indigo-600 shadow-[2px_2px_0px_0px_rgba(79,70,229,1)] hover:shadow-[1px_1px_0px_0px_rgba(79,70,229,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                <Edit size={14} className="inline-block mr-1" />
                                Edit
                            </button>
                            <button
                                onClick={() => toggleStatus(category.id)}
                                className={`flex-1 px-3 py-2 font-medium rounded border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${
                                    category.status === 'Active'
                                        ? 'bg-orange-400 border-orange-500 text-orange-900'
                                        : 'bg-emerald-400 border-emerald-500 text-emerald-900'
                                }`}
                            >
                                <Eye size={14} className="inline-block mr-1" />
                                {category.status === 'Active' ? 'Disable' : 'Enable'}
                            </button>
                            <button
                                onClick={() => handleDelete(category.id)}
                                className="px-3 py-2 bg-rose-500 text-white font-medium rounded border-2 border-rose-600 shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:shadow-[1px_1px_0px_0px_rgba(225,29,72,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No categories found</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your search or filter criteria</div>
                </div>
            )}
        </div>
    );
}
