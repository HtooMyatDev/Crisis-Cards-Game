"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Palette, Tag, FileText, Calendar, BarChart3 } from 'lucide-react';

export default function EditCategory() {
    // Get category ID from URL - you'll need to use Next.js useRouter or similar
    // For now, using a mock ID, but in real implementation you'd get this from the URL
    const categoryId = 1; // This would come from useRouter().query.id in Next.js

    // Mock data - in a real app, this would be fetched based on the category ID from URL params
    const [originalCategory] = useState({
        id: categoryId,
        name: "Electronics",
        description: "Electronic devices and gadgets",
        color: "#3B82F6",
        status: "Active",
        itemCount: 45,
        createdDate: "2024-01-15",
        lastModified: "2024-03-10"
    });

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
        status: 'Active'
    });

    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Popular color presets
    const colorPresets = [
        '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
        '#8B5CF6', '#F97316', '#EC4899', '#06B6D4',
        '#84CC16', '#F43F5E', '#8B5A2B', '#6B7280'
    ];

    useEffect(() => {
        // Load category data
        setFormData({
            name: originalCategory.name,
            description: originalCategory.description,
            color: originalCategory.color,
            status: originalCategory.status
        });
    }, [originalCategory]);

    useEffect(() => {
        // Check if form has changes
        const hasFormChanges =
            formData.name !== originalCategory.name ||
            formData.description !== originalCategory.description ||
            formData.color !== originalCategory.color ||
            formData.status !== originalCategory.status;

        setHasChanges(hasFormChanges);
    }, [formData, originalCategory]);

    const handleSave = async () => {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would make an API call to update the category
        console.log('Saving category:', formData);

        setIsLoading(false);
        // Navigate back or show success message
        alert('Category updated successfully!');
    };

    const handleDelete = async () => {
        setIsLoading(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));

        // In a real app, this would make an API call to delete the category
        console.log('Deleting category:', originalCategory.id);

        setIsLoading(false);
        setShowDeleteConfirm(false);
        // Navigate back to manage categories
        alert('Category deleted successfully!');
    };

    const toggleStatus = () => {
        setFormData({
            ...formData,
            status: formData.status === 'Active' ? 'Inactive' : 'Active'
        });
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button className="p-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Edit Category</h1>
                        <p className="text-gray-600 mt-1">Modify category details and settings</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={toggleStatus}
                        className={`px-4 py-2 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${
                            formData.status === 'Active'
                                ? 'bg-orange-400 border-orange-500 text-orange-900'
                                : 'bg-emerald-400 border-emerald-500 text-emerald-900'
                        }`}
                    >
                        {formData.status === 'Active' ? <EyeOff size={16} className="inline-block mr-2" /> : <Eye size={16} className="inline-block mr-2" />}
                        {formData.status === 'Active' ? 'Disable' : 'Enable'}
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-rose-500 text-white font-bold border-2 border-rose-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] hover:shadow-[1px_1px_0px_0px_rgba(225,29,72,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                    >
                        <Trash2 size={16} className="inline-block mr-2" />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Edit Form */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-6">
                            <Tag size={20} />
                            <h2 className="text-xl font-bold">Category Details</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Category Name */}
                            <div>
                                <label className="block font-bold mb-2">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-lg font-medium"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    placeholder="Enter category name"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-bold mb-2">Description</label>
                                <textarea
                                    className="w-full p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-24 resize-none"
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                    placeholder="Describe this category..."
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="block font-bold mb-2">Category Color</label>
                                <div className="space-y-4">
                                    {/* Custom Color Picker */}
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="w-16 h-12 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                                            value={formData.color}
                                            onChange={(e) => setFormData({...formData, color: e.target.value})}
                                        />
                                        <div className="flex-1">
                                            <div className="font-mono text-sm mb-1">{formData.color}</div>
                                            <div className="text-gray-600 text-sm">Custom color</div>
                                        </div>
                                    </div>

                                    {/* Color Presets */}
                                    <div>
                                        <div className="text-sm font-medium mb-2 text-gray-700">Popular Colors</div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {colorPresets.map((color, index) => (
                                                <button
                                                    key={index}
                                                    className={`w-10 h-10 rounded-lg border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${
                                                        formData.color === color ? 'border-black' : 'border-gray-300'
                                                    }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setFormData({...formData, color: color})}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block font-bold mb-2">Status</label>
                                <select
                                    className="w-full p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-medium"
                                    value={formData.status}
                                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                                >
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="flex gap-3 mt-8">
                            <button
                                onClick={handleSave}
                                disabled={!hasChanges || isLoading}
                                className={`flex-1 px-6 py-4 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${
                                    hasChanges && !isLoading
                                        ? 'bg-green-500 text-white border-green-600 cursor-pointer'
                                        : 'bg-gray-300 text-gray-500 border-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                        Saving...
                                    </div>
                                ) : (
                                    <>
                                        <Save size={16} className="inline-block mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-6">
                    {/* Category Preview */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Palette size={20} />
                            <h3 className="text-lg font-bold">Preview</h3>
                        </div>

                        <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-black"
                                    style={{ backgroundColor: formData.color }}
                                ></div>
                                <div>
                                    <h4 className="font-bold">{formData.name || 'Category Name'}</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${
                                        formData.status === 'Active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {formData.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 text-sm">{formData.description || 'Category description will appear here...'}</p>
                        </div>
                    </div>

                    {/* Category Stats */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <BarChart3 size={20} />
                            <h3 className="text-lg font-bold">Statistics</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total Items</span>
                                <span className="font-bold">{originalCategory.itemCount}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Created</span>
                                <span className="font-medium">{originalCategory.createdDate}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Last Modified</span>
                                <span className="font-medium">{originalCategory.lastModified}</span>
                            </div>
                        </div>
                    </div>

                    {/* Changes Indicator */}
                    {hasChanges && (
                        <div className="bg-amber-50 border-2 border-amber-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] p-4">
                            <div className="flex items-center gap-2 text-amber-800">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="font-medium">Unsaved Changes</span>
                            </div>
                            <p className="text-amber-700 text-sm mt-1">Don't forget to save your changes!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-red-600">Delete Category</h2>

                        <div className="mb-6">
                            <p className="text-gray-700 mb-2">Are you sure you want to delete this category?</p>
                            <div className="bg-red-50 border border-red-200 rounded p-3">
                                <div className="flex items-center gap-2 font-medium text-red-800">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: formData.color }}
                                    ></div>
                                    {formData.name}
                                </div>
                                <div className="text-red-600 text-sm mt-1">
                                    This action will affect {originalCategory.itemCount} items
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-gray-400 text-white font-bold border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
