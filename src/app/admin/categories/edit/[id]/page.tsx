"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Trash2, Eye, EyeOff, Palette, Tag, BarChart3 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useCategoryData } from '@/hooks/useCategoryData';
import { CategoryFormState } from '@/types/category';

// The color preset from the category isn't selected automatically.
// Continue developing the update method.
export default function EditCategory() {
    const router = useRouter();
    const { id } = useParams();
    const categoryId = Array.isArray(id) ? id[0] : id;

    const { loading, error, category, colors, initialFormData } = useCategoryData(categoryId ?? '');

    const [formData, setFormData] = useState<CategoryFormState>({
        name: '',
        description: '',
        color: '#3B82F6',
        status: 'Active'
    });
    const [hasChanges, setHasChanges] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showUnsavedChangesModal, setShowUnsavedChangesModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Initialize form data when initialFormData is loaded
    useEffect(() => {
        if (initialFormData) {
            setFormData(initialFormData);
        }
    }, [initialFormData]);


    // Track changes by comparing with initialFormData
    useEffect(() => {
        if (initialFormData) {
            const changed =
                formData.name !== initialFormData.name ||
                formData.description !== initialFormData.description ||
                formData.color !== initialFormData.color ||
                formData.status !== initialFormData.status;
            setHasChanges(changed);
        }
    }, [formData, initialFormData]);

    // Use colors from API or fallback to default presets
    // Extract backgroundColor from color objects if they exist
    const colorPresets = colors && colors.length > 0
        ? colors.filter(c => c.isActive).map(c => c.backgroundColor)
        : [
            '#3B82F6', '#EF4444', '#10B981', '#F59E0B',
            '#8B5CF6', '#F97316', '#EC4899', '#06B6D4',
            '#84CC16', '#F43F5E', '#8B5A2B', '#6B7280'
        ];

    const handleSave = async () => {
        if (!categoryId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to update category');
            }

            const data = await response.json();
            console.log('Category updated:', data);

            // Reset hasChanges after successful save
            setHasChanges(false);
            alert('Category updated successfully!');
        } catch (err) {
            console.error('Error updating category:', err);
            alert('Failed to update category. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!categoryId) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/admin/categories/${categoryId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete category');
            }

            console.log('Category deleted');
            alert('Category deleted successfully!');
            router.push('/admin/categories'); // Navigate back to categories list
        } catch (err) {
            console.error('Error deleting category:', err);
            alert('Failed to delete category. Please try again.');
        } finally {
            setIsLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const toggleStatus = () => {
        setFormData(prev => ({
            ...prev,
            status: prev.status === 'Active' ? 'Inactive' : 'Active'
        }));
    };

    const handleBack = () => {
        if (hasChanges) {
            setShowUnsavedChangesModal(true);
        } else {
            router.back();
        }
    };

    const confirmLeave = () => {
        setShowUnsavedChangesModal(false);
        router.back();
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="font-bold">Loading category...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold text-red-700 mb-2">Error Loading Category</h2>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    // No category found
    if (!category && !loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-2">Category Not Found</h2>
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 bg-gray-500 text-white font-bold border-2 border-gray-600 rounded-lg"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={handleBack}
                        className="p-2 border-2 border-black dark:border-gray-200 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.2)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-black dark:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-black dark:text-white">Edit Category</h1>
                        <p className="text-gray-600 dark:text-gray-400 mt-1">Modify category details and settings</p>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={toggleStatus}
                        className={`px-4 py-2 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.4)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.4)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${formData.status === 'Active'
                            ? 'bg-orange-400 border-orange-500 text-orange-900 dark:bg-orange-600 dark:border-orange-400 dark:text-white'
                            : 'bg-emerald-400 border-emerald-500 text-emerald-900 dark:bg-emerald-600 dark:border-emerald-400 dark:text-white'
                            }`}
                    >
                        {formData.status === 'Active' ? (
                            <><EyeOff size={16} className="inline-block mr-2" />Disable</>
                        ) : (
                            <><Eye size={16} className="inline-block mr-2" />Enable</>
                        )}
                    </button>

                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-4 py-2 bg-rose-500 text-white font-bold border-2 border-rose-600 dark:border-rose-400 rounded-lg shadow-[2px_2px_0px_0px_rgba(225,29,72,1)] dark:shadow-[2px_2px_0px_0px_rgba(244,63,94,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(225,29,72,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(244,63,94,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
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
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <div className="flex items-center gap-2 mb-6 text-black dark:text-white">
                            <Tag size={20} />
                            <h2 className="text-xl font-bold">Category Details</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Category Name */}
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Category Name</label>
                                <input
                                    type="text"
                                    className="w-full p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] text-lg font-medium bg-white dark:bg-gray-800 text-black dark:text-white"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Enter category name"
                                />
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Description</label>
                                <textarea
                                    className="w-full p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] h-24 resize-none bg-white dark:bg-gray-800 text-black dark:text-white"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe this category..."
                                />
                            </div>

                            {/* Color Selection */}
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Category Color</label>
                                <div className="space-y-4">
                                    {/* Custom Color Picker */}
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            className="w-16 h-12 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] cursor-pointer"
                                            value={formData.color}
                                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                        />
                                        <div className="flex-1">
                                            <div className="font-mono text-sm mb-1 text-black dark:text-white">{formData.color}</div>
                                            <div className="text-gray-600 dark:text-gray-400 text-sm">Custom color</div>
                                        </div>
                                    </div>

                                    {/* Color Presets */}
                                    <div>
                                        <div className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Popular Colors</div>
                                        <div className="grid grid-cols-6 gap-2">
                                            {colorPresets.map((color, index) => (
                                                <button
                                                    key={index}
                                                    className={`w-10 h-10 rounded-lg border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${formData.color.toUpperCase() === color.toUpperCase() ? 'border-black dark:border-white border-4' : 'border-gray-300 dark:border-gray-600'
                                                        }`}
                                                    style={{ backgroundColor: color }}
                                                    onClick={() => setFormData({ ...formData, color: color })}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Status */}
                            <div>
                                <label className="block font-bold mb-2 text-black dark:text-white">Status</label>
                                <select
                                    className="w-full p-4 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] font-medium bg-white dark:bg-gray-800 text-black dark:text-white"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Active' | 'Inactive' })}
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
                                className={`flex-1 px-6 py-4 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] dark:shadow-[2px_2px_0px_0px_rgba(34,197,94,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${hasChanges && !isLoading
                                    ? 'bg-green-500 text-white border-green-600 dark:border-green-400 cursor-pointer'
                                    : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-400 dark:border-gray-600 cursor-not-allowed'
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
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <div className="flex items-center gap-2 mb-4 text-black dark:text-white">
                            <Palette size={20} />
                            <h3 className="text-lg font-bold">Preview</h3>
                        </div>

                        <div className="bg-gray-50 dark:bg-gray-700/50 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-4">
                            <div className="flex items-center gap-3 mb-3">
                                <div
                                    className="w-6 h-6 rounded-full border-2 border-black dark:border-white"
                                    style={{ backgroundColor: formData.color }}
                                ></div>
                                <div>
                                    <h4 className="font-bold text-black dark:text-white">{formData.name || 'Category Name'}</h4>
                                    <span className={`text-xs px-2 py-1 rounded font-medium ${formData.status === 'Active'
                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                        : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                                        }`}>
                                        {formData.status}
                                    </span>
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 text-sm">{formData.description || 'Category description will appear here...'}</p>
                        </div>
                    </div>

                    {/* Category Stats */}
                    {category && (
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex items-center gap-2 mb-4 text-black dark:text-white">
                                <BarChart3 size={20} />
                                <h3 className="text-lg font-bold">Statistics</h3>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Total Items</span>
                                    <span className="font-bold text-black dark:text-white">{category.itemCount ?? 0}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Created</span>
                                    <span className="font-medium text-black dark:text-white">{category.createdDate ?? 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Last Modified</span>
                                    <span className="font-medium text-black dark:text-white">{category.lastModified ?? 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Changes Indicator */}
                    {hasChanges && (
                        <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(245,158,11,1)] dark:shadow-[2px_2px_0px_0px_rgba(245,158,11,0.5)] p-4">
                            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300">
                                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                <span className="font-medium">Unsaved Changes</span>
                            </div>
                            <p className="text-amber-700 dark:text-amber-400 text-sm mt-1">Don&apos;t forget to save your changes!</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-red-600 dark:text-red-400">Delete Category</h2>

                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">Are you sure you want to delete this category?</p>
                            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-3">
                                <div className="flex items-center gap-2 font-medium text-red-800 dark:text-red-300">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: formData.color }}
                                    ></div>
                                    {formData.name}
                                </div>
                                {category?.itemCount && (
                                    <div className="text-red-600 dark:text-red-400 text-sm mt-1">
                                        This action will affect {category.itemCount} items
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? 'Deleting...' : 'Delete'}
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isLoading}
                                className="flex-1 px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white font-bold border-2 border-gray-500 dark:border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] dark:shadow-[2px_2px_0px_0px_rgba(156,163,175,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Modal */}
            {showUnsavedChangesModal && (
                <div className="fixed inset-0 bg-white/80 dark:bg-black/80 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 w-full max-w-md">
                        <h2 className="text-xl font-bold mb-4 text-amber-600 dark:text-amber-400">Unsaved Changes</h2>

                        <div className="mb-6">
                            <p className="text-gray-700 dark:text-gray-300 mb-2">You have unsaved changes. Are you sure you want to leave?</p>
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded p-3">
                                <div className="text-amber-800 dark:text-amber-300 text-sm">
                                    Your changes will be lost if you leave without saving.
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={confirmLeave}
                                className="flex-1 px-4 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                Leave Without Saving
                            </button>
                            <button
                                onClick={() => setShowUnsavedChangesModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-400 dark:bg-gray-600 text-white font-bold border-2 border-gray-500 dark:border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] dark:shadow-[2px_2px_0px_0px_rgba(156,163,175,0.5)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,0.5)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                            >
                                Stay
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
