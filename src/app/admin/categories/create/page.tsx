"use client"
import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { useRouter } from "next/navigation"
import SuccessModal from '@/components/SuccessModal';
import { useForm } from 'react-hook-form'

interface CategoryFormData {
    name: string;
    description: string;
    color: string;
    status: 'Active' | 'Inactive'
}

export default function CreateCategory() {
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset
    } = useForm<CategoryFormData>({
        defaultValues: {
            name: '',
            description: '',
            color: '#3B82F6',
            status: 'Active'
        }
    });

    // Watch color value for real-time updates
    const watchedColor = watch('color');

    const onSubmit = async (data: CategoryFormData) => {
        try {
            const response = await fetch('/api/admin/categories', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name.trim(),
                    description: data.description.trim(),
                    color: data.color,
                    status: data.status.toLowerCase()
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Category created successfully:', result);

            // Show success modal
            setShowSuccessModal(true);

            // Reset form
            reset();

            // Set timeout for auto-redirect, but store the reference
            timeoutRef.current = setTimeout(() => {
                router.push('/admin/categories/list');
            }, 2500);

        } catch (err) {
            console.error('Error creating category:', err);
            // Handle error (could set error state here if needed)
        }
    };

    const closeModal = () => {
        // Clear the timeout when modal is closed
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    const goToList = () => {
        // Clear the timeout and navigate immediately
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        router.push('/admin/categories/list');
    };

    const createAnother = () => {
        // Clear the timeout and just close the modal (stay on current page)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    // Handle hex color input validation and formatting
    const handleHexColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value;

        // Ensure it starts with #
        if (!value.startsWith('#')) {
            value = '#' + value;
        }

        // Allow typing and validate hex format
        if (value.match(/^#[0-9A-Fa-f]{0,6}$/) || value === '#') {
            setValue('color', value);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create New Category</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                    <label className="block font-bold mb-2">
                        Category Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        {...register('name', {
                            required: 'Category name is required',
                            minLength: {
                                value: 2,
                                message: 'Category name must be at least 2 characters'
                            },
                            maxLength: {
                                value: 50,
                                message: 'Category name cannot exceed 50 characters'
                            },
                            validate: {
                                notOnlyWhitespace: (value) =>
                                    value.trim().length > 0 || 'Category name cannot be only whitespace'
                            }
                        })}
                        type="text"
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter category name"
                        disabled={isSubmitting}
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                <div>
                    <label className="block font-bold mb-2">Description</label>
                    <textarea
                        {...register('description', {
                            maxLength: {
                                value: 500,
                                message: 'Description cannot exceed 500 characters'
                            },
                            validate: {
                                validContent: (value) => {
                                    if (!value) return true; // Allow empty description
                                    return value.trim().length === 0 || value.trim().length >= 5 || 'Description must be at least 5 characters if provided';
                                }
                            }
                        })}
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-24"
                        placeholder="Enter category description (optional)"
                        disabled={isSubmitting}
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <label className="block font-bold mb-2">Color</label>
                    <div className="flex items-center gap-3 mb-3">
                        <input
                            {...register('color', {
                                required: 'Color is required',
                                validate: {
                                    validHex: (value) => {
                                        const hexPattern = /^#[0-9A-Fa-f]{6}$/;
                                        return hexPattern.test(value) || 'Please enter a valid hex color (e.g., #FF0000)';
                                    }
                                }
                            })}
                            type="color"
                            className="w-16 h-12 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
                            disabled={isSubmitting}
                        />
                        <div className="flex items-center gap-2">
                            <div
                                className="w-6 h-6 border-2 border-black rounded"
                                style={{ backgroundColor: watchedColor }}
                            ></div>
                            <span className="text-sm font-mono">{watchedColor}</span>
                        </div>
                    </div>

                    <div>
                        <label className="block font-medium mb-1 text-sm">Hex Code</label>
                        <input
                            type="text"
                            className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono"
                            placeholder="#000000"
                            value={watchedColor}
                            onChange={handleHexColorChange}
                            disabled={isSubmitting}
                        />
                    </div>

                    {errors.color && (
                        <p className="text-red-600 text-sm mt-1">{errors.color.message}</p>
                    )}
                </div>

                <div>
                    <label className="block font-bold mb-2">Status</label>
                    <select
                        {...register('status')}
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        aria-label="Select category status"
                        disabled={isSubmitting}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus size={20} className="inline-block mr-2" />
                    {isSubmitting ? 'Creating...' : 'Create Category'}
                </button>
            </form>

            {/* SUCCESS MODAL - Shows after successful category creation */}
            <SuccessModal
                isOpen={showSuccessModal}
                title="Success!"
                message="Category created successfully!"
                redirectMessage="Redirecting to the list..."
                onClose={closeModal}                    // Close modal manually
                onPrimaryAction={goToList}              // Go to categories list
                onSecondaryAction={createAnother}       // Stay on page to create another
                primaryButtonText="View Categories"
                secondaryButtonText="Create Another"
                autoCloseDelay={2500}                   // Auto-redirect after 2.5 seconds
                showProgressBar={true}
            />
        </div>
    );
}
