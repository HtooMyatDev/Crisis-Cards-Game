"use client"
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { ArrowLeft, Save, Plus, X, Clock, Tag, AlertCircle } from 'lucide-react';

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

// Define the form data type
interface CardFormData {
    name: string;
    description: string;
    category: string;
    timeLimit: number;
    responseOptions: { value: string }[];
    status: 'Active' | 'Inactive';
}

// Props interface for the edit page
interface EditCrisisCardProps {
    cardId?: string;
    onSave?: (card: CrisisCard) => void;
    onCancel?: () => void;
}

export default function EditCrisisCard({ cardId, onSave, onCancel }: EditCrisisCardProps) {
    const [loading, setLoading] = useState(true);

    // Available categories
    const categories = ['Emergency', 'Crisis', 'Technical', 'Medical', 'Security', 'Environmental'];

    // Category color mapping for minimal accent
    const getCategoryColors = (category: string) => {
        const colorMap: { [key: string]: { accent: string, bg: string, text: string } } = {
            'Emergency': { accent: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
            'Crisis': { accent: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
            'Technical': { accent: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
            'Medical': { accent: 'bg-green-500', bg: 'bg-green-50', text: 'text-green-700' },
            'Security': { accent: 'bg-purple-500', bg: 'bg-purple-50', text: 'text-purple-700' },
            'Environmental': { accent: 'bg-teal-500', bg: 'bg-teal-50', text: 'text-teal-700' }
        };

        return colorMap[category] || { accent: 'bg-gray-500', bg: 'bg-gray-50', text: 'text-gray-700' };
    };

    // Set up form with react-hook-form
    const {
        register,
        control,
        handleSubmit,
        reset,
        watch,
        formState: { errors, isSubmitting }
    } = useForm<CardFormData>({
        defaultValues: {
            name: '',
            description: '',
            category: '',
            timeLimit: 1,
            responseOptions: [{ value: '' }],
            status: 'Active'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'responseOptions'
    });

    // Watch form values for preview
    const watchedValues = watch();

    // Load card data if editing existing card
    useEffect(() => {
        const fetchCard = async () => {
            if (cardId) {
                try {
                    // Simulate API call - replace with actual API
                    setTimeout(() => {
                        // Mock data for existing card
                        const mockCard: CrisisCard = {
                            id: cardId,
                            name: 'Emergency Response Protocol',
                            description: 'Quick response procedures for handling emergency situations in the workplace.',
                            category: 'Emergency',
                            timeLimit: 15,
                            responseOptions: ['Call 911', 'Evacuate immediately', 'Contact supervisor'],
                            status: 'Active',
                            createdAt: '2024-01-15',
                            updatedAt: '2024-01-20'
                        };

                        // Reset form with fetched data
                        reset({
                            name: mockCard.name,
                            description: mockCard.description,
                            category: mockCard.category,
                            timeLimit: mockCard.timeLimit,
                            responseOptions: mockCard.responseOptions.map(option => ({ value: option })),
                            status: mockCard.status
                        });

                        setLoading(false);
                    }, 1000);
                } catch (error) {
                    console.error('Error fetching card:', error);
                    setLoading(false);
                }
            } else {
                // Creating new card
                setLoading(false);
            }
        };

        fetchCard();
    }, [cardId, reset]);

    // Handle response options
    const addResponseOption = () => {
        if (fields.length < 3) {
            append({ value: '' });
        }
    };

    const removeResponseOption = (index: number) => {
        if (fields.length > 1) {
            remove(index);
        }
    };

    // Handle form submission
    const onSubmit = async (data: CardFormData) => {
        try {
            // Filter out empty response options
            const filteredOptions = data.responseOptions
                .map(option => option.value.trim())
                .filter(value => value !== '');

            // Create the updated card object
            const updatedCard: CrisisCard = {
                id: cardId || Date.now().toString(),
                name: data.name,
                description: data.description,
                category: data.category,
                timeLimit: data.timeLimit,
                responseOptions: filteredOptions,
                status: data.status,
                createdAt: cardId ? '2024-01-15' : new Date().toISOString().split('T')[0],
                updatedAt: new Date().toISOString().split('T')[0]
            };

            // Simulate API call
            if (cardId) {
                // Update existing card
                const response = await fetch(`/api/cards/${cardId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedCard),
                });

                if (!response.ok) {
                    throw new Error('Failed to update card');
                }
            } else {
                // Create new card
                const response = await fetch('/api/cards', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(updatedCard),
                });

                if (!response.ok) {
                    throw new Error('Failed to create card');
                }
            }

            console.log('Card saved successfully:', updatedCard);
            onSave?.(updatedCard);
            alert(`Card ${cardId ? 'updated' : 'created'} successfully!`);

        } catch (error) {
            console.error('Error saving card:', error);
            alert(`Error ${cardId ? 'updating' : 'creating'} card. Please try again.`);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-64">
                <div className="text-xl font-semibold">Loading card...</div>
            </div>
        );
    }

    const colors = getCategoryColors(watchedValues.category);

    return (
        <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onCancel}
                        className="flex items-center gap-2 px-3 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        Back to List
                    </button>
                    <h1 className="text-2xl font-bold">
                        {cardId ? 'Edit Crisis Card' : 'Create New Crisis Card'}
                    </h1>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Form */}
                <div className="space-y-6">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <h2 className="text-lg font-bold mb-4">Card Details</h2>

                            {/* Card Name */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">
                                    Card Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    {...register('name', {
                                        required: 'Card name is required',
                                        minLength: { value: 2, message: 'Card name must be at least 2 characters' }
                                    })}
                                    type="text"
                                    className={`w-full p-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                        errors.name ? 'border-red-500' : 'border-black'
                                    }`}
                                    placeholder="Enter card name"
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.name.message}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">
                                    Description <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    {...register('description', {
                                        required: 'Description is required',
                                        minLength: { value: 10, message: 'Description must be at least 10 characters' }
                                    })}
                                    className={`w-full p-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-32 resize-none ${
                                        errors.description ? 'border-red-500' : 'border-black'
                                    }`}
                                    placeholder="Enter card description"
                                />
                                {errors.description && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.description.message}
                                    </p>
                                )}
                            </div>

                            {/* Category and Status */}
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="block font-bold mb-2">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        {...register('category', { required: 'Category is required' })}
                                        className={`w-full p-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                            errors.category ? 'border-red-500' : 'border-black'
                                        }`}
                                    >
                                        <option value="">Select category...</option>
                                        {categories.map(category => (
                                            <option key={category} value={category}>{category}</option>
                                        ))}
                                    </select>
                                    {errors.category && (
                                        <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.category.message}
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block font-bold mb-2">Status</label>
                                    <select
                                        {...register('status')}
                                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    >
                                        <option value="Active">Active</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {/* Time Limit */}
                            <div className="mb-4">
                                <label className="block font-bold mb-2">
                                    Time Limit (minutes) <span className="text-red-500">*</span>
                                </label>
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
                                    className={`w-full p-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${
                                        errors.timeLimit ? 'border-red-500' : 'border-black'
                                    }`}
                                    placeholder="Enter time limit in minutes (1-120)"
                                />
                                {errors.timeLimit && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.timeLimit.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Response Options */}
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-bold">
                                    Response Options <span className="text-red-500">*</span>
                                </h2>
                            </div>

                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-3">
                                        <input
                                            {...register(`responseOptions.${index}.value`, {
                                                required: index === 0 ? 'At least one response option is required' : false
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
                                ))}

                                {fields.length < 3 && (
                                    <button
                                        type="button"
                                        onClick={addResponseOption}
                                        className="flex items-center gap-2 px-4 py-2 border-2 border-black rounded-lg font-semibold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-gray-50"
                                    >
                                        <Plus size={20} />
                                        Add Option
                                    </button>
                                )}

                                {errors.responseOptions && (
                                    <p className="text-red-600 text-sm">{errors.responseOptions.message}</p>
                                )}

                                <p className="text-sm text-gray-600">
                                    Minimum: 1 option, Maximum: 3 options
                                </p>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            {isSubmitting ? 'Saving...' : (cardId ? 'Update Card' : 'Create Card')}
                        </button>
                    </form>
                </div>

                {/* Preview */}
                <div className="space-y-6">
                    <div className="bg-gray-50 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-6">
                        <h2 className="text-lg font-bold mb-4">Live Preview</h2>

                        {/* Card Preview */}
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative">
                            {/* Color accent bar */}
                            {watchedValues.category && (
                                <div className={`absolute top-0 left-0 w-full h-1 ${colors.accent} rounded-t-md`}></div>
                            )}

                            {/* Card Header */}
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-gray-900">
                                    {watchedValues.name || 'Card Name'}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${
                                    watchedValues.status === 'Active'
                                        ? 'bg-green-100 text-green-800 border-green-800'
                                        : 'bg-red-100 text-red-800 border-red-800'
                                }`}>
                                    {watchedValues.status}
                                </span>
                            </div>

                            {/* Description */}
                            <p className="text-gray-600 text-sm mb-4">
                                {watchedValues.description || 'Card description will appear here...'}
                            </p>

                            {/* Card Details */}
                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm">
                                    <Tag size={16} className="text-gray-500" />
                                    <span className={`font-medium px-2 py-1 ${colors.bg} border-2 border-gray-200 rounded-full text-xs ${colors.text}`}>
                                        {watchedValues.category || 'Category'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <Clock size={16} className="text-gray-500" />
                                    <span className="text-gray-700">{watchedValues.timeLimit || 0} minutes</span>
                                </div>
                            </div>

                            {/* Response Options Preview */}
                            <div className="mb-4">
                                <p className="text-sm font-semibold mb-2 text-gray-700">Response Options:</p>
                                <div className="space-y-1">
                                    {watchedValues.responseOptions?.filter(option => option.value.trim()).slice(0, 3).map((option, index) => (
                                        <div key={index} className="text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300 text-gray-700">
                                            {option.value}
                                        </div>
                                    ))}
                                    {(!watchedValues.responseOptions || watchedValues.responseOptions.filter(option => option.value.trim()).length === 0) && (
                                        <div className="text-xs text-gray-500 italic">No response options added yet...</div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}   
