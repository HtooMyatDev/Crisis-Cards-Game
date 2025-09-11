"use client"
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Plus, X } from 'lucide-react';

// Define the form data type
interface CardFormData {
    name: string;
    description: string;
    category: string;
    timeLimit: number;
    responseOptions: { value: string }[];
    status: 'Active' | 'Inactive';
}

export default function CreateCards() {
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
            responseOptions: [{ value: '' }],
            status: 'Active'
        }
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: 'responseOptions'
    });

    // Watch the response options to enforce constraints
    watch('responseOptions');

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

    const onSubmit = async (data: CardFormData) => {
        try {
            // Filter out empty response options
            const filteredOptions = data.responseOptions
                .map(option => option.value.trim())
                .filter(value => value !== '');

            const formattedData = {
                ...data,
                responseOptions: filteredOptions
            };

            console.log('Form data:', formattedData);

            // Here's where you'd make your API call
            const response = await fetch('/api/cards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formattedData),
            });

            if (!response.ok) {
                throw new Error('Failed to create card');
            }

            const result = await response.json();
            console.log('Card created successfully:', result);

            // You might want to redirect or show a success message here
            // router.push('/cards') // if using Next.js router

        } catch (error) {
            console.error('Error creating card:', error);
            // Handle error (show toast, set error state, etc.)
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create New Card</h1>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-32"
                        placeholder="Enter card description"
                    />
                    {errors.description && (
                        <p className="text-red-600 text-sm mt-1">{errors.description.message}</p>
                    )}
                </div>

                <div>
                    <label className="block font-bold mb-2">Category</label>
                    <input
                        {...register('category', { required: 'Category is required' })}
                        type="text"
                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        placeholder="Enter card category (e.g., Crisis, Emergency, Challenge)"
                    />
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

                <div>
                    <label className="block font-bold mb-2">Response Options</label>
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
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Creating Card...' : 'Create Card'}
                </button>
            </form>
        </div>
    );
}
