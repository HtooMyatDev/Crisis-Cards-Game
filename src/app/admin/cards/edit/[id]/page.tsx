"use client"
import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, AlertCircle, Shield, TrendingUp, Building2, Leaf, Users } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Import all the components and hooks
import { FormState, ResponseOption, FormErrors } from '@/types/crisisCard';
import { useCrisisCardData } from '@/hooks/useCrisisCardData';
import { useFormState } from '@/hooks/useFormState'
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormInput } from '@/components/ui/FormInput';
import { NumberInput } from '@/components/ui/NumberInput';
import { ResponseOptionEditor } from '@/components/previews/ResponseOptionEditor';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import UnsavedChangesModal from '@/components/modals/UnsavedChangesModal';
import EditCardSkeleton from '@/components/skeletons/EditCardSkeleton';

export default function EditCrisisCardDesign() {
    const router = useRouter();
    const { id } = useParams();
    const cardId = Array.isArray(id) ? id[0] : id;

    // Custom hooks
    const { loading, error, categories, initialFormData } = useCrisisCardData(cardId ?? '');
    const {
        formData,
        hasUnsavedChanges,
        setHasUnsavedChanges,
        updateField,
        updateNumberField,
        updateResponseOptions
    } = useFormState(initialFormData);
    const { validateForm } = useFormValidation();

    // Local state
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    // Event handlers
    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find(cat => cat.id === parseInt(categoryId));
        if (category) {
            updateField('categoryId', category.id);
            updateField('categoryName', category.name);
        }
    };

    const handleResponseOptionText = (index: number, value: string, field: 'text' | 'impactDescription' = 'text') => {
        updateResponseOptions(options =>
            options.map((option, i) => i === index ? { ...option, [field]: value } : option)
        );
    };

    const handleResponseOptionEffect = (
        index: number,
        field: keyof Pick<ResponseOption, 'politicalEffect' | 'economicEffect' | 'infrastructureEffect' | 'societyEffect' | 'environmentEffect' | 'score'>,
        value: string
    ) => {
        const numValue = value === '' ? 0 : Number(value);
        if (!isNaN(numValue)) {
            updateResponseOptions(options =>
                options.map((option, i) => i === index ? { ...option, [field]: numValue } : option)
            );
        }
    };



    const handleSave = async () => {
        const { isValid, errors } = validateForm(formData);
        setFormErrors(errors);

        if (!isValid) {
            alert('Please fix the highlighted errors before saving.');
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/admin/cards/${cardId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    status: formData.status === 'Active' ? 'OPEN' : 'CLOSED'
                })
            });

            if (response.ok) {
                setHasUnsavedChanges(false);
                alert('Crisis card updated successfully!');
            } else {
                throw new Error('Failed to update card');
            }
        } catch (err) {
            alert('Error updating card: ' + (err instanceof Error ? err.message : 'Unknown error'));
        } finally {
            setSaving(false);
        }
    };

    const handleBackToList = () => {
        if (hasUnsavedChanges) {
            setShowUnsavedModal(true);
        } else {
            router.push('/admin/cards/list');
        }
    };

    if (loading) return <EditCardSkeleton />;
    if (error) return <div className="max-w-7xl mx-auto px-6 py-2 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-900 border-b-2 border-black dark:border-gray-700 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-2 px-4 py-2 text-black dark:text-white bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                            >
                                <ArrowLeft size={18} />
                                Back to List
                            </button>
                            <div className="h-6 w-px bg-black dark:bg-gray-700"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-black dark:text-white">Edit Crisis Card</h1>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Modify card details and response options</p>
                            </div>
                        </div>
                        {hasUnsavedChanges && (
                            <div className="flex items-center gap-2 text-sm text-orange-600 bg-orange-50 px-3 py-2 border-2 border-orange-600 rounded-lg font-bold">
                                <AlertCircle size={16} />
                                Unsaved changes
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-6 py-8">
                <div className="space-y-6">
                    {/* Form Section */}
                    <div className="space-y-6">
                        {/* Card Details */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b-2 border-black dark:border-gray-700">
                                <h2 className="text-lg font-bold text-black dark:text-white">Card Details</h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Basic information about the crisis card</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <FormInput label="Card Title" required error={formErrors.title}>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none bg-white dark:bg-gray-800 text-black dark:text-white"
                                        placeholder="Enter a clear, descriptive title"
                                    />
                                </FormInput>

                                <FormInput label="Description" required error={formErrors.description}>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none h-32 resize-none bg-white dark:bg-gray-800 text-black dark:text-white"
                                        placeholder="Describe the crisis scenario and context"
                                    ></textarea>
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Provide clear context for responders</p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">{formData.description.length}/500</p>
                                    </div>
                                </FormInput>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormInput label="Category" required error={formErrors.categoryId}>
                                        <select
                                            id="category"
                                            aria-label="Category"
                                            value={formData.categoryId}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full pl-4 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none appearance-none bg-white dark:bg-gray-800 text-black dark:text-white"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="">Select category...</option>
                                            {categories.map(category => (
                                                <option key={category.id} value={category.id}>
                                                    {category.name}
                                                </option>
                                            ))}
                                        </select>
                                    </FormInput>

                                    <FormInput label="Status">
                                        <select
                                            id="status"
                                            aria-label="Status"
                                            value={formData.status}
                                            onChange={(e) => updateField('status', e.target.value as FormState['status'])}
                                            className="w-full pl-4 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none appearance-none bg-white dark:bg-gray-800 text-black dark:text-white"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </FormInput>
                                </div>

                                {/* Card Base Values */}
                                <div>
                                    <label className="block text-sm font-bold text-black dark:text-white mb-3">Card Base Values</label>
                                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900">
                                        {[
                                            { key: 'political' as const, label: 'Political', icon: Shield, color: 'text-blue-500', error: formErrors.political },
                                            { key: 'economic' as const, label: 'Economic', icon: TrendingUp, color: 'text-green-500', error: formErrors.economic },
                                            { key: 'infrastructure' as const, label: 'Infrastructure', icon: Building2, color: 'text-gray-500', error: formErrors.infrastructure },
                                            { key: 'society' as const, label: 'Society', icon: Users, color: 'text-yellow-500', error: formErrors.society },
                                            { key: 'environment' as const, label: 'Environment', icon: Leaf, color: 'text-emerald-500', error: formErrors.environment },
                                        ].map(({ key, label, icon: Icon, color, error }) => (
                                            <div key={key}>
                                                <label className="flex items-center gap-2 text-xs font-medium mb-2 min-h-[24px] text-black dark:text-white">
                                                    <Icon size={18} className={color} />
                                                    <span>{label}</span>
                                                </label>
                                                <NumberInput
                                                    value={formData[key]}
                                                    onChange={(value: string) => updateNumberField(key, value)}
                                                    min={-50}
                                                    max={50}
                                                    placeholder="0"
                                                    className="p-2 text-sm"
                                                />
                                                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">Set base values. Range: -50 to +50.</p>
                                </div>

                                <FormInput
                                    label="Response Time Limit"
                                    required
                                    error={formErrors.timeLimit}
                                    helpText="Maximum time allowed for response selection"
                                >
                                    <NumberInput
                                        value={formData.timeLimit}
                                        onChange={(value: string) => updateNumberField('timeLimit', value)}
                                        min={1}
                                        max={120}
                                        placeholder="15"
                                        suffix="minutes"
                                    />
                                </FormInput>
                            </div>
                        </div>

                        {/* Response Options */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b-2 border-black dark:border-gray-700">
                                <h2 className="text-lg font-bold text-black dark:text-white">
                                    Response Options <span className="text-red-500">*</span>
                                </h2>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Available actions for crisis response (2-4 options)</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {formData.responseOptions.map((option, index) => (
                                        <div key={index} className="relative group">
                                            <div className="absolute right-2 top-2 z-10">
                                                {formData.responseOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => updateResponseOptions(options => options.filter((_, i) => i !== index))}
                                                        className="p-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
                                                        title="Remove option"
                                                    >
                                                        <AlertCircle size={18} className="rotate-45" />
                                                    </button>
                                                )}
                                            </div>
                                            <ResponseOptionEditor
                                                option={option}
                                                index={index}
                                                errors={formErrors.responseOptions?.[index]}
                                                onTextChange={handleResponseOptionText}
                                                onEffectChange={handleResponseOptionEffect}
                                            />
                                        </div>
                                    ))}

                                    {formData.responseOptions.length < 4 && (
                                        <button
                                            type="button"
                                            onClick={() => updateResponseOptions(options => [...options, { text: '', politicalEffect: 0, economicEffect: 0, infrastructureEffect: 0, societyEffect: 0, environmentEffect: 0, score: 0, impactDescription: '' }])}
                                            className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-600 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2 font-medium"
                                        >
                                            <Plus size={20} />
                                            Add Response Option
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Save Button */}
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black dark:bg-blue-600 text-white font-bold border-2 border-black dark:border-blue-500 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(37,99,235,0.5)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            {saving ? 'Saving Changes...' : 'Update Crisis Card'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            <UnsavedChangesModal
                isOpen={showUnsavedModal}
                onConfirm={() => {
                    setShowUnsavedModal(false);
                    router.push('/admin/cards/list');
                }}
                onCancel={() => setShowUnsavedModal(false)}
            />
        </div >
    );
}
