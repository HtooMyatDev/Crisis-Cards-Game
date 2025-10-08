"use client"
import React, { useState, useRef, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useRouter } from "next/navigation"
import SuccessModal from '@/components/common/feedback/SuccessModal';
import { useForm } from 'react-hook-form'

interface CategoryFormData {
    name: string;
    description: string;
    colorPresetId: string; // Changed to use preset ID
    status: 'Active' | 'Inactive'
}

interface ColorPreset {
    id: number;
    name: string;
    backgroundColor: string;
    textColor: string;
    textBoxColor: string;
    isActive: boolean;
}

export default function CreateCategory() {
    const router = useRouter()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [colorPresets, setColorPresets] = useState<ColorPreset[]>([]);
    const [isLoadingPresets, setIsLoadingPresets] = useState(true);
    const [presetsError, setPresetsError] = useState<string>('');

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
            colorPresetId: '', // Default to empty - user must select
            status: 'Active'
        }
    });

    // Watch values for real-time updates
    const watchedColorPresetId = watch('colorPresetId');

    // Get selected preset details
    const selectedPreset = colorPresets.find(preset => preset.id.toString() === watchedColorPresetId);

    // Fetch color presets on component mount
    useEffect(() => {
        const fetchColorPresets = async () => {
            try {
                setIsLoadingPresets(true);
                setPresetsError('');

                const response = await fetch('/api/admin/color-presets?active=true');
                if (!response.ok) {
                    throw new Error('Failed to fetch color presets');
                }

                const data = await response.json();
                if (data.success && data.presets) {
                    setColorPresets(data.presets);

                    // Auto-select first preset if available
                    if (data.presets.length > 0) {
                        setValue('colorPresetId', data.presets[0].id.toString());
                    }
                } else {
                    throw new Error(data.error || 'Invalid response format');
                }
            } catch (error) {
                console.error('Error fetching color presets:', error);
                setPresetsError('Failed to load color presets. Using default colors.');

                // Fallback to a basic preset if API fails
                const fallbackPreset: ColorPreset = {
                    id: 0,
                    name: 'Default Blue',
                    backgroundColor: '#EFF6FF',
                    textColor: '#1E40AF',
                    textBoxColor: '#2563EB',
                    isActive: true
                };
                setColorPresets([fallbackPreset]);
                setValue('colorPresetId', '0');
            } finally {
                setIsLoadingPresets(false);
            }
        };

        fetchColorPresets();
    }, [setValue]);

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
                    colorPresetId: data.colorPresetId === '0' ? null : data.colorPresetId,
                    status: data.status // ✅ Now sending status
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            console.log('Category created successfully:', result);

            // Show success modal
            setShowSuccessModal(true);

            // Reset form
            reset();

            // Reset to first available preset
            if (colorPresets.length > 0) {
                setValue('colorPresetId', colorPresets[0].id.toString());
            }

            // Set timeout for auto-redirect
            timeoutRef.current = setTimeout(() => {
                router.push('/admin/categories/list');
            }, 2500);

        } catch (err) {
            console.error('Error creating category:', err);
            alert(`Error: ${err.message || 'Failed to create category'}`);
        }
    };

    const closeModal = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    const goToList = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        router.push('/admin/categories/list');
    };

    const createAnother = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        setShowSuccessModal(false);
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create New Category</h1>
            </div>

            <div className="max-w-4xl">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Information */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h3 className="text-lg font-bold mb-4">Basic Information</h3>

                        <div className="space-y-4">
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
                                                if (!value) return true;
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
                        </div>
                    </div>

                    {/* Color Preset Selection */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h3 className="text-lg font-bold mb-4">Color Theme</h3>

                        {presetsError && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <p className="text-yellow-800 text-sm">{presetsError}</p>
                            </div>
                        )}

                        {isLoadingPresets ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                                <span className="text-gray-600">Loading color presets...</span>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block font-bold mb-3">
                                        Select Color Preset <span className="text-red-600">*</span>
                                    </label>
                                    <select
                                        {...register('colorPresetId', {
                                            required: 'Please select a color preset'
                                        })}
                                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        disabled={isSubmitting}
                                    >
                                        <option value="">Select a color theme...</option>
                                        {colorPresets.map((preset) => (
                                            <option
                                                key={preset.id}
                                                value={preset.id.toString()}
                                                style={{
                                                    backgroundColor: preset.backgroundColor,
                                                    color: preset.textColor
                                                }}
                                            >
                                                {preset.name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.colorPresetId && (
                                        <p className="text-red-600 text-sm mt-1">{errors.colorPresetId.message}</p>
                                    )}
                                </div>

                                {/* Color Preset Grid Preview */}
                                {colorPresets.length > 0 && (
                                    <div>
                                        <label className="block font-medium mb-3">Available Themes</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {colorPresets.map((preset) => (
                                                <button
                                                    key={preset.id}
                                                    type="button"
                                                    onClick={() => setValue('colorPresetId', preset.id.toString())}
                                                    className={`p-3 border-2 rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 ${watchedColorPresetId === preset.id.toString()
                                                            ? `border-2 shadow-[3px_3px_0px_0px_${preset.textBoxColor}]`
                                                            : 'border-black'
                                                        }`}
                                                    style={{
                                                        backgroundColor: preset.backgroundColor,
                                                        ...(watchedColorPresetId === preset.id.toString() && {
                                                            borderColor: preset.textBoxColor,
                                                            boxShadow: `3px 3px 0px 0px ${preset.textBoxColor}, 0 0 0 2px ${preset.textBoxColor}40`
                                                        })
                                                    }}
                                                >
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <div
                                                            className="w-4 h-4 rounded-full border"
                                                            style={{ backgroundColor: preset.textBoxColor }}
                                                        ></div>
                                                        <span
                                                            className="text-xs font-medium"
                                                            style={{ color: preset.textColor }}
                                                        >
                                                            {preset.name}
                                                        </span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Selected Preset Details */}
                                {selectedPreset && (
                                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                                        <h4 className="font-medium mb-3">Selected Theme: {selectedPreset.name}</h4>
                                        <div className="grid grid-cols-3 gap-4 text-xs">
                                            <div>
                                                <span className="block text-gray-600 mb-1">Background</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: selectedPreset.backgroundColor }}
                                                    ></div>
                                                    <span className="font-mono">{selectedPreset.backgroundColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-gray-600 mb-1">Text</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: selectedPreset.textColor }}
                                                    ></div>
                                                    <span className="font-mono">{selectedPreset.textColor}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <span className="block text-gray-600 mb-1">Accent</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: selectedPreset.textBoxColor }}
                                                    ></div>
                                                    <span className="font-mono">{selectedPreset.textBoxColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoadingPresets}
                        className="px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={20} className="inline-block mr-2" />
                        {isSubmitting ? 'Creating...' : 'Create Category'}
                    </button>
                </form>
            </div>

            {/* SUCCESS MODAL */}
            <SuccessModal
                isOpen={showSuccessModal}
                title="Success!"
                message="Category created successfully!"
                redirectMessage="Redirecting to the list..."
                onClose={closeModal}
                onPrimaryAction={goToList}
                onSecondaryAction={createAnother}
                primaryButtonText="View Categories"
                secondaryButtonText="Create Another"
                autoCloseDelay={2500}
                showProgressBar={true}
            />
        </div>
    );
}
