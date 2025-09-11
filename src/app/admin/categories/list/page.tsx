"use client"
import React, { useState } from 'react';
import { Search, Filter, Tag } from 'lucide-react';

export default function ListCategories() {
    // Mock data for categories (same as management page but focused on viewing)
    const [categories] = useState([
        {
            id: 1,
            name: "Electronics",
            description: "Electronic devices and gadgets",
            color: "#3B82F6",
            status: "Active",
            itemCount: 45
        },
        {
            id: 2,
            name: "Clothing",
            description: "Fashion and apparel items",
            color: "#EF4444",
            status: "Active",
            itemCount: 23
        },
        {
            id: 3,
            name: "Books",
            description: "Literature and educational materials",
            color: "#10B981",
            status: "Active", // Only show active categories in list view
            itemCount: 12
        },
        {
            id: 4,
            name: "Sports",
            description: "Sports equipment and accessories",
            color: "#F59E0B",
            status: "Active",
            itemCount: 18
        },
        {
            id: 5,
            name: "Home & Garden",
            description: "Household items and gardening supplies",
            color: "#8B5CF6",
            status: "Active",
            itemCount: 31
        }
    ]);

    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('name');

    // Filter and sort categories (only show active ones)
    const activeCategories = categories.filter(cat => cat.status === 'Active');

    const filteredCategories = activeCategories
        .filter(category =>
            category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            category.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            if (sortBy === 'name') return a.name.localeCompare(b.name);
            if (sortBy === 'items') return b.itemCount - a.itemCount;
            return 0;
        });

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">Categories</h1>
                <p className="text-gray-600 mt-1">Browse all available product categories</p>
            </div>

            {/* Search and Sort Bar */}
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
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                >
                    <option value="name">Sort by Name</option>
                    <option value="items">Sort by Item Count</option>
                </select>
            </div>

            {/* Categories Grid - Clean Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCategories.map((category) => (
                    <div key={category.id} className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-5 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 cursor-pointer">
                        {/* Category Header */}
                        <div className="flex items-center gap-3 mb-3">
                            <div
                                className="w-5 h-5 rounded-full border-2 border-black flex-shrink-0"
                                style={{ backgroundColor: category.color }}
                            ></div>
                            <h3 className="font-bold text-lg truncate">{category.name}</h3>
                        </div>

                        {/* Description */}
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2">{category.description}</p>

                        {/* Item Count */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-500">
                                <Tag size={14} />
                                <span>{category.itemCount} items</span>
                            </div>
                            <div className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded font-medium">
                                Active
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Stats Summary */}
            <div className="mt-8 bg-gray-50 border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
                <h3 className="font-bold text-lg mb-2">Category Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Total Categories:</span>
                        <span className="font-bold ml-2">{activeCategories.length}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Total Items:</span>
                        <span className="font-bold ml-2">{activeCategories.reduce((sum, cat) => sum + cat.itemCount, 0)}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Showing:</span>
                        <span className="font-bold ml-2">{filteredCategories.length} categories</span>
                    </div>
                </div>
            </div>

            {/* No Results */}
            {filteredCategories.length === 0 && (
                <div className="text-center py-12">
                    <div className="text-gray-500 text-lg">No categories found</div>
                    <div className="text-gray-400 text-sm mt-2">Try adjusting your search criteria</div>
                </div>
            )}
        </div>
    );
}
