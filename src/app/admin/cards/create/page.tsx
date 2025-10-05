"use client"
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation'

// Define the form data type
interface ResponseOption {
    value: string;
    pwEffect: number;
    efEffect: number;
    psEffect: number;
    grEffect: number;
}

interface CardFormData {
    name: string;
    description: string;
    category: string;
    timeLimit: number;
    // Card base values
    pwValue: number;
    efValue: number;
    psValue: number;
    grValue: number;
    responseOptions: ResponseOption[];
    status: 'Active' | 'Inactive';
}

interface Category {
    id: string;
    name: string;
    colorPreset?: {
        backgroundColor: string;
        textColor: string;
        textBoxColor: string;
    };
}

export default function CreateCards() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);
    const router = useRouter()

    const {
        register,
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch
    } = useForm<CardFormData>({
        defaultValues: {
            name: '',
            description: '',
            category: '',
            timeLimit: 1,
            // Default card base values
            pwValue: 0,
            efValue: 0,
            psValue: 0,
            grValue: 0,
            responseOptions: [{
                value: '',
                pwEffect: 0,
                efEffect: 0,
                psEffect: 0,
                grEffect: 0
            }],
            status: 'Active'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'responseOptions'
    });

    // Watch form values for preview
    const watchedName = watch('name');
    const watchedDescription = watch('description');
    const watchedCategory = watch('category');
    const watchedTimeLimit = watch('timeLimit');
    const watchedResponseOptions = watch('responseOptions');
    const watchedPwValue = watch('pwValue');
    const watchedEfValue = watch('efValue');
    const watchedPsValue = watch('psValue');
    const watchedGrValue = watch('grValue');

    // Get selected category with color preset
    const selectedCategory = categories.find(cat => cat.name === watchedCategory);

    // Default colors if no category selected or no color preset
    const defaultColors = {
        backgroundColor: '#EFF6FF',
        textColor: '#1E40AF',
        textBoxColor: '#2563EB'
    };

    const previewColors = selectedCategory?.colorPreset || defaultColors;

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                setCategoriesError(null);

                const response = await fetch("/api/admin/categories?includeColorPresets=true", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });

                if (!response.ok) {
                    throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
                }

                const data = await response.json();
                setCategories(data['categories']);

            } catch (error) {
                console.error('Error fetching categories:', error);
                setCategoriesError(error instanceof Error ? error.message : 'Failed to load categories');

                // Fallback categories with color presets if API fails
                setCategories([
                    {
                        id: '1',
                        name: 'Crisis',
                        colorPreset: {
                            backgroundColor: '#FEF2F2',
                            textColor: '#DC2626',
                            textBoxColor: '#EF4444'
                        }
                    },
                    {
                        id: '2',
                        name: 'Emergency',
                        colorPreset: {
                            backgroundColor: '#FFF7ED',
                            textColor: '#EA580C',
                            textBoxColor: '#F97316'
                        }
                    },
                    {
                        id: '3',
                        name: 'Challenge',
                        colorPreset: {
                            backgroundColor: '#FEFCE8',
                            textColor: '#CA8A04',
                            textBoxColor: '#EAB308'
                        }
                    },
                    {
                        id: '4',
                        name: 'Training',
                        colorPreset: {
                            backgroundColor: '#F0F9FF',
                            textColor: '#0284C7',
                            textBoxColor: '#0EA5E9'
                        }
                    },
                    {
                        id: '5',
                        name: 'Assessment',
                        colorPreset: {
                            backgroundColor: '#F3E8FF',
                            textColor: '#9333EA',
                            textBoxColor: '#A855F7'
                        }
                    }
                ]);
            } finally {
                setCategoriesLoading(false);
            }
        };

        fetchCategories();
    }, []);

    // Watch the response options to enforce constraints
    watch('responseOptions');

    const addResponseOption = () => {
        if (fields.length < 3) {
            append({
                value: '',
                pwEffect: 0,
                efEffect: 0,
                psEffect: 0,
                grEffect: 0
            });
        }
    };

    const removeResponseOption = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    const onSubmit = async (data: CardFormData) => {
        try {
            // Filter out empty response options and format them
            const filteredOptions = data.responseOptions
                .filter(option => option.value.trim() !== '')
                .map(option => ({
                    text: option.value.trim(),
                    pwEffect: option.pwEffect,
                    efEffect: option.efEffect,
                    psEffect: option.psEffect,
                    grEffect: option.grEffect
                }));

            // Find category ID from category name
            const selectedCategory = categories.find(cat => cat.name === data.category);
            if (!selectedCategory) {
                throw new Error('Selected category not found');
            }

            // Transform form data to match database schema
            const formattedData = {
                title: data.name,
                description: data.description,
                timeLimit: data.timeLimit,
                // Card base values
                pwValue: data.pwValue,
                efValue: data.efValue,
                psValue: data.psValue,
                grValue: data.grValue,
                // Response options with effects
                responseOptions: filteredOptions,
                categoryId: parseInt(selectedCategory.id),
                status: data.status === 'Active' ? 'OPEN' : 'CLOSED',
                createdBy: 1, // TODO: Replace with actual user ID from session/auth
                severity: 'MEDIUM',
                priority: 'MEDIUM',
            };

            console.log('Formatted data for API:', formattedData);

            const response = await fetch('/api/admin/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create card');
            }

            const result = await response.json();
            console.log('Card created successfully:', result);

            // Reset form or redirect
            alert('Card created successfully!');
            router.push('/admin/cards/list')
        } catch (error) {
            console.error('Error creating card:', error);
            alert(`Error creating card: ${error instanceof Error ? error.message : 'Please try again.'}`);
        }
    };

    return (
        <div className="w-full p-6 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Create New Card</h1>
                <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-medium"
                >
                    <Eye size={16} />
                    {showPreview ? 'Hide' : 'Show'} Preview
                </button>
            </div>

            <div className={`grid gap-6 ${showPreview ? 'grid-cols-1 xl:grid-cols-2' : 'grid-cols-1'}`}>
                {/* Form Section */}
                <div className={showPreview ? '' : 'max-w-4xl'}>
                    <form className="space-y-4">
                        <div>
                            <label className="block font-bold mb-2">Card Name</label>
                            <input
                                {...register('name', {
                                    required: 'Card name is required',
                                    minLength: { value: 2, message: 'Card name must be at least 2 characters' }
                                })}
                                type="text"
                                className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                placeholder="Enter card name"
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-bold mb-2">Description</label>
                            <textarea
                                {...register('description', {
                                    required: 'Description is required',
                                    minLength: { value: 10, message: 'Description must be at least 10 characters' }
                                })}
                                className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-32 resize-none"
                                placeholder="Enter card description"
                            />
                            {errors.description && (
                                <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-bold mb-2">Category</label>
                            {categoriesLoading ? (
                                <div className="w-full p-3 border-2 border-gray-300 rounded-lg bg-gray-100 text-gray-500 flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-500 border-t-transparent mr-2"></div>
                                    Loading categories...
                                </div>
                            ) : (
                                <>
                                    <select
                                        {...register('category', { required: 'Category is required' })}
                                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        aria-label="Select card category"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.name}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                    {categoriesError && (
                                        <p className="text-orange-600 text-sm mt-1">
                                            Warning: {categoriesError}. Using fallback categories.
                                        </p>
                                    )}

                                    {/* Category Color Preview */}
                                    {selectedCategory && selectedCategory.colorPreset && (
                                        <div className="mt-3 p-3 rounded-lg border border-gray-200 bg-gray-50">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">
                                                    Theme Preview: {selectedCategory.name}
                                                </span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: selectedCategory.colorPreset.backgroundColor }}
                                                        title="Background Color"
                                                    ></div>
                                                    <div
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: selectedCategory.colorPreset.textColor }}
                                                        title="Text Color"
                                                    ></div>
                                                    <div
                                                        className="w-4 h-4 rounded border border-gray-300"
                                                        style={{ backgroundColor: selectedCategory.colorPreset.textBoxColor }}
                                                        title="Accent Color"
                                                    ></div>
                                                </div>
                                            </div>
                                            <div
                                                className="px-3 py-2 rounded text-center text-sm font-medium"
                                                style={{
                                                    backgroundColor: selectedCategory.colorPreset.backgroundColor,
                                                    color: selectedCategory.colorPreset.textColor,
                                                    border: `1px solid ${selectedCategory.colorPreset.textBoxColor}40`
                                                }}
                                            >
                                                <span
                                                    className="inline-block px-2 py-1 rounded text-xs text-white mr-2"
                                                    style={{ backgroundColor: selectedCategory.colorPreset.textBoxColor }}
                                                >
                                                    {selectedCategory.name}
                                                </span>
                                                Cards in this category will use these colors
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}
                            {errors.category && (
                                <p className="text-red-600 text-sm mt-1">{errors.category.message}</p>
                            )}
                        </div>

                        <div>
                            <label className="block font-bold mb-2">Time Limit (minutes)</label>
                            <input
                                {...register('timeLimit', {
                                    required: 'Time limit is required',
                                    min: { value: 1, message: 'Time limit must be at least 1 minute' },
                                    max: { value: 120, message: 'Time limit cannot exceed 120 minutes' },
                                    valueAsNumber: true
                                })}
                                type="number"
                                min="1"
                                max="120"
                                className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                placeholder="Enter time limit in minutes (1-120)"
                            />
                            {errors.timeLimit && (
                                <p className="text-red-600 text-sm mt-1">{errors.timeLimit.message}</p>
                            )}
                        </div>

                        {/* Card Base Values Section */}
                        <div>
                            <label className="block font-bold mb-3">Card Base Values</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                <div>
                                    <label className="block text-sm font-medium mb-1">PW (Power)</label>
                                    <input
                                        {...register('pwValue', {
                                            required: 'PW value is required',
                                            min: { value: -50, message: 'PW must be at least -50' },
                                            max: { value: 50, message: 'PW cannot exceed 50' },
                                            valueAsNumber: true
                                        })}
                                        type="number"
                                        min="-50"
                                        max="50"
                                        className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="0"
                                    />
                                    {errors.pwValue && (
                                        <p className="text-red-600 text-xs mt-1">{errors.pwValue.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">EF (Efficiency)</label>
                                    <input
                                        {...register('efValue', {
                                            required: 'EF value is required',
                                            min: { value: -50, message: 'EF must be at least -50' },
                                            max: { value: 50, message: 'EF cannot exceed 50' },
                                            valueAsNumber: true
                                        })}
                                        type="number"
                                        min="-50"
                                        max="50"
                                        className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="0"
                                    />
                                    {errors.efValue && (
                                        <p className="text-red-600 text-xs mt-1">{errors.efValue.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">PS (Precision)</label>
                                    <input
                                        {...register('psValue', {
                                            required: 'PS value is required',
                                            min: { value: -50, message: 'PS must be at least -50' },
                                            max: { value: 50, message: 'PS cannot exceed 50' },
                                            valueAsNumber: true
                                        })}
                                        type="number"
                                        min="-50"
                                        max="50"
                                        className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="0"
                                    />
                                    {errors.psValue && (
                                        <p className="text-red-600 text-xs mt-1">{errors.psValue.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-1">GR (Growth)</label>
                                    <input
                                        {...register('grValue', {
                                            required: 'GR value is required',
                                            min: { value: -50, message: 'GR must be at least -50' },
                                            max: { value: 50, message: 'GR cannot exceed 50' },
                                            valueAsNumber: true
                                        })}
                                        type="number"
                                        min="-50"
                                        max="50"
                                        className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                        placeholder="0"
                                    />
                                    {errors.grValue && (
                                        <p className="text-red-600 text-xs mt-1">{errors.grValue.message}</p>
                                    )}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Set the base values for this card. Range: -50 to +50 for each value.
                            </p>
                        </div>

                        {/* Response Options with Effects */}
                        <div>
                            <label className="block font-bold mb-2">Response Options & Effects</label>
                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                        <div className="flex items-center gap-3 mb-3">
                                            <input
                                                {...register(`responseOptions.${index}.value`, {
                                                    required: 'Response option cannot be empty',
                                                    minLength: {
                                                        value: 2,
                                                        message: 'Response option must be at least 2 characters'
                                                    },
                                                    maxLength: {
                                                        value: 100,
                                                        message: 'Response option cannot exceed 100 characters'
                                                    },
                                                    validate: {
                                                        notOnlyWhiteSpace: (value) => value.trim().length > 0 || 'Response option cannot be only whitespace',
                                                        unique: (value) => {
                                                            if (!value) return true;
                                                            const allValues = watch('responseOptions').map(option => option.value?.trim().toLowerCase()).filter(val => val);
                                                            const currentValue = value.trim().toLowerCase()
                                                            const duplicates = allValues.filter(val => val === currentValue)
                                                            return duplicates.length <= 1 || 'Response option must be unique'
                                                        }
                                                    },
                                                })}
                                                type="text"
                                                className="flex-1 p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                                placeholder={`Response option ${index + 1}`}
                                            />
                                            {fields.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeResponseOption(index)}
                                                    className="p-3 border-2 border-red-600 text-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                                    aria-label={`Remove response option ${index + 1}`}
                                                >
                                                    <X size={20} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Effects for this response option */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            <div>
                                                <label className="block text-xs font-medium mb-1">PW Effect</label>
                                                <input
                                                    {...register(`responseOptions.${index}.pwEffect`, {
                                                        required: 'PW effect is required',
                                                        min: { value: -10, message: 'PW effect must be at least -10' },
                                                        max: { value: 10, message: 'PW effect cannot exceed 10' },
                                                        valueAsNumber: true
                                                    })}
                                                    type="number"
                                                    min="-10"
                                                    max="10"
                                                    className="w-full p-2 text-sm border border-gray-400 rounded"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-1">EF Effect</label>
                                                <input
                                                    {...register(`responseOptions.${index}.efEffect`, {
                                                        required: 'EF effect is required',
                                                        min: { value: -10, message: 'EF effect must be at least -10' },
                                                        max: { value: 10, message: 'EF effect cannot exceed 10' },
                                                        valueAsNumber: true
                                                    })}
                                                    type="number"
                                                    min="-10"
                                                    max="10"
                                                    className="w-full p-2 text-sm border border-gray-400 rounded"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-1">PS Effect</label>
                                                <input
                                                    {...register(`responseOptions.${index}.psEffect`, {
                                                        required: 'PS effect is required',
                                                        min: { value: -10, message: 'PS effect must be at least -10' },
                                                        max: { value: 10, message: 'PS effect cannot exceed 10' },
                                                        valueAsNumber: true
                                                    })}
                                                    type="number"
                                                    min="-10"
                                                    max="10"
                                                    className="w-full p-2 text-sm border border-gray-400 rounded"
                                                    placeholder="0"
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-xs font-medium mb-1">GR Effect</label>
                                                <input
                                                    {...register(`responseOptions.${index}.grEffect`, {
                                                        required: 'GR effect is required',
                                                        min: { value: -10, message: 'GR effect must be at least -10' },
                                                        max: { value: 10, message: 'GR effect cannot exceed 10' },
                                                        valueAsNumber: true
                                                    })}
                                                    type="number"
                                                    min="-10"
                                                    max="10"
                                                    className="w-full p-2 text-sm border border-gray-400 rounded"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>

                                        {/* Show validation errors for this response option */}
                                        {errors.responseOptions?.[index]?.value && (
                                            <p className="text-red-600 text-sm mt-2">
                                                {errors.responseOptions[index].value?.message}
                                            </p>
                                        )}
                                        {(errors.responseOptions?.[index]?.pwEffect ||
                                            errors.responseOptions?.[index]?.efEffect ||
                                            errors.responseOptions?.[index]?.psEffect ||
                                            errors.responseOptions?.[index]?.grEffect) && (
                                                <p className="text-red-600 text-sm mt-2">
                                                    Please check the effect values (range: -10 to +10)
                                                </p>
                                            )}
                                    </div>
                                ))}

                                {fields.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={addResponseOption}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-gray-50"
                                    >
                                        <Plus size={20} />
                                        Add Response Option
                                    </button>
                                )}
                                <p className="text-sm text-gray-600">
                                    Each response option can have effects on the card values. Effect range: -10 to +10.
                                </p>
                            </div>
                        </div>

                        <div>
                            <label className="block font-bold mb-2">Status</label>
                            <select
                                {...register('status')}
                                className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                aria-label="Select card status"
                            >
                                <option value="Active">Active</option>
                                <option value="Inactive">Inactive</option>
                            </select>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmit(onSubmit)}
                            disabled={isSubmitting || categoriesLoading}
                            className="w-full px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Creating Card...' : 'Create Card'}
                        </button>
                    </form>
                </div>

                {/* Enhanced Preview Section */}
                {showPreview && (
                    <div className="flex justify-center">
                        <div className="w-full max-w-md">
                            <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-6">
                                <h3 className="text-lg font-bold mb-4 text-center">Live Preview</h3>

                                {/* Card Style Preview */}
                                <div
                                    className="rounded-2xl shadow-lg overflow-hidden w-full"
                                    style={{ backgroundColor: previewColors.backgroundColor }}
                                >
                                    {/* Card Header */}
                                    <div className="px-6 pt-6 pb-4">
                                        {/* Category Badge */}
                                        <div className="flex justify-center mb-4">
                                            <div
                                                className="px-4 py-2 rounded-full text-sm font-medium"
                                                style={{
                                                    backgroundColor: previewColors.textBoxColor,
                                                    color: 'white'
                                                }}
                                            >
                                                {watchedCategory || 'Category'}
                                            </div>
                                        </div>

                                        {/* Title */}
                                        <h4
                                            className="text-xl font-bold text-center mb-2"
                                            style={{ color: previewColors.textColor }}
                                        >
                                            {watchedName || 'Card Title'}
                                        </h4>

                                        {/* Description */}
                                        <p
                                            className="text-sm text-center mb-4 opacity-80"
                                            style={{ color: previewColors.textColor }}
                                        >
                                            {watchedDescription || 'Enter a description to see it here...'}
                                        </p>
                                    </div>

                                    {/* Content Section */}
                                    <div className="px-6 pb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h5
                                                className="font-semibold"
                                                style={{ color: previewColors.textColor }}
                                            >
                                                Response Options
                                            </h5>
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className="text-sm font-medium"
                                                    style={{ color: previewColors.textColor }}
                                                >
                                                    {fields.length}/3 Max
                                                </span>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            {watchedResponseOptions.map((option, index) => (
                                                <div key={index} className="relative">
                                                    <div
                                                        className="p-4 rounded-lg"
                                                        style={{ backgroundColor: '#FDFAE5' }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                                                                style={{ backgroundColor: previewColors.textBoxColor }}
                                                            >
                                                                {String.fromCharCode(65 + index)}
                                                            </div>
                                                            <span
                                                                className="text-sm font-medium"
                                                                style={{ color: '#3F3D39' }}
                                                            >
                                                                {option.value || `Response option ${index + 1}`}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Effects Display */}
                                                    <div className="flex justify-center gap-1 mt-2">
                                                        <div
                                                            className="px-2 py-1 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: previewColors.textColor,
                                                                color: 'white'
                                                            }}
                                                            title="Power Effect"
                                                        >
                                                            PW: {option.pwEffect >= 0 ? '+' : ''}{option.pwEffect}
                                                        </div>
                                                        <div
                                                            className="px-2 py-1 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: previewColors.textColor,
                                                                color: 'white'
                                                            }}
                                                            title="Efficiency Effect"
                                                        >
                                                            EF: {option.efEffect >= 0 ? '+' : ''}{option.efEffect}
                                                        </div>
                                                        <div
                                                            className="px-2 py-1 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: previewColors.textColor,
                                                                color: 'white'
                                                            }}
                                                            title="Precision Effect"
                                                        >
                                                            PS: {option.psEffect >= 0 ? '+' : ''}{option.psEffect}
                                                        </div>
                                                        <div
                                                            className="px-2 py-1 rounded text-xs font-medium"
                                                            style={{
                                                                backgroundColor: previewColors.textColor,
                                                                color: 'white'
                                                            }}
                                                            title="Growth Effect"
                                                        >
                                                            GR: {option.grEffect >= 0 ? '+' : ''}{option.grEffect}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}

                                            {/* Show placeholders for remaining slots */}
                                            {fields.length < 3 && [...Array(3 - fields.length)].map((_, index) => (
                                                <div key={`placeholder-${index}`} className="relative opacity-50">
                                                    <div
                                                        className="p-4 rounded-lg border-2 border-dashed"
                                                        style={{
                                                            backgroundColor: 'transparent',
                                                            borderColor: previewColors.textColor + '40' // 25% opacity
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <div
                                                                className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 border-2 border-dashed"
                                                                style={{
                                                                    borderColor: previewColors.textBoxColor,
                                                                    backgroundColor: 'transparent',
                                                                    color: previewColors.textBoxColor
                                                                }}
                                                            >
                                                                {String.fromCharCode(65 + fields.length + index)}
                                                            </div>
                                                            <span
                                                                className="text-sm font-medium italic"
                                                                style={{ color: previewColors.textColor + '60' }}
                                                            >
                                                                Add another response option
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Footer with base values */}
                                    <div className="px-6 pb-6">
                                        <div className="flex justify-center gap-2 mb-3">
                                            <div
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: previewColors.textColor + '20',
                                                    color: previewColors.textColor
                                                }}
                                            >
                                                Base PW: {watchedPwValue >= 0 ? '+' : ''}{watchedPwValue}
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: previewColors.textColor + '20',
                                                    color: previewColors.textColor
                                                }}
                                            >
                                                Base EF: {watchedEfValue >= 0 ? '+' : ''}{watchedEfValue}
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: previewColors.textColor + '20',
                                                    color: previewColors.textColor
                                                }}
                                            >
                                                Base PS: {watchedPsValue >= 0 ? '+' : ''}{watchedPsValue}
                                            </div>
                                            <div
                                                className="px-2 py-1 rounded text-xs font-medium"
                                                style={{
                                                    backgroundColor: previewColors.textColor + '20',
                                                    color: previewColors.textColor
                                                }}
                                            >
                                                Base GR: {watchedGrValue >= 0 ? '+' : ''}{watchedGrValue}
                                            </div>
                                        </div>

                                        <p
                                            className="text-xs text-center opacity-60"
                                            style={{ color: previewColors.textColor }}
                                        >
                                            {watchedCategory || 'Select Category'} • Time Limit: {watchedTimeLimit || 1} min
                                        </p>
                                    </div>
                                </div>

                                {/* Color Values Display */}
                                {selectedCategory && selectedCategory.colorPreset && (
                                    <div className="text-xs space-y-2 mt-6 pt-4 border-t border-gray-200">
                                        <div className="text-center mb-3">
                                            <span className="font-medium text-gray-700">Theme Colors</span>
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Background:</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: previewColors.backgroundColor }}
                                                    ></div>
                                                    <span className="font-mono text-xs">{previewColors.backgroundColor}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Text:</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: previewColors.textColor }}
                                                    ></div>
                                                    <span className="font-mono text-xs">{previewColors.textColor}</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600">Accent:</span>
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-4 h-4 border border-gray-300 rounded"
                                                        style={{ backgroundColor: previewColors.textBoxColor }}
                                                    ></div>
                                                    <span className="font-mono text-xs">{previewColors.textBoxColor}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
