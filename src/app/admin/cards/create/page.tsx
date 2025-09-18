"use client"
import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';
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
}

export default function CreateCards() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);
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

    // Fetch categories on component mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                setCategoriesLoading(true);
                setCategoriesError(null);

                const response = await fetch("/api/admin/categories", {
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

                // Fallback categories if API fails
                setCategories([
                    { id: '1', name: 'Crisis' },
                    { id: '2', name: 'Emergency' },
                    { id: '3', name: 'Challenge' },
                    { id: '4', name: 'Training' },
                    { id: '5', name: 'Assessment' }
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
            <h1 className="text-2xl font-bold mb-6">Create New Card</h1>

            <div className="space-y-4">
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
            </div>
        </div>
    );
}
