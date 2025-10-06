"use client"
import React, { useState } from 'react';
import { ArrowLeft, Save, Plus, AlertCircle, Shield, TrendingUp, Heart, Users } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

// Import all the components and hooks
import { FormState, ResponseOption, FormErrors } from '@/types/crisisCard';
import { useCrisisCardData } from '@/hooks/useCrisisCardData';
import { useFormState } from '@/hooks/useFormState'
import { useFormValidation } from '@/hooks/useFormValidation';
import { FormInput } from '@/components/FormInput';
import { NumberInput } from '@/components/NumberInput';
import { ResponseOptionEditor } from '@/components/ResponseOptionEditor';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CardPreview } from '@/components/CardPreview';
import { UnsavedChangesModal } from '@/components/UnsavedChangesModal';

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

    const handleResponseOptionText = (index: number, value: string) => {
        updateResponseOptions(options =>
            options.map((option, i) => i === index ? { ...option, text: value } : option)
        );
    };

    const handleResponseOptionEffect = (
        index: number,
        field: keyof Pick<ResponseOption, 'pwEffect' | 'efEffect' | 'psEffect' | 'grEffect'>,
        value: string
    ) => {
        const numValue = value === '' ? 0 : Number(value);
        if (!isNaN(numValue)) {
            updateResponseOptions(options =>
                options.map((option, i) => i === index ? { ...option, [field]: numValue } : option)
            );
        }
    };

    const addResponseOption = () => {
        if (formData.responseOptions.length < 3) {
            updateResponseOptions(options => [
                ...options,
                { text: '', pwEffect: 0, efEffect: 0, psEffect: 0, grEffect: 0 }
            ]);
        }
    };

    const removeResponseOption = (index: number) => {
        if (formData.responseOptions.length > 1) {
            updateResponseOptions(options => options.filter((_, i) => i !== index));
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
                body: JSON.stringify(formData)
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

    if (loading) return <LoadingSpinner />;
    if (error) return <div className="max-w-7xl mx-auto px-6 py-2 text-red-600">Error: {error}</div>;

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <div className="bg-gray-50 border-b-2 border-black sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleBackToList}
                                className="flex items-center gap-2 px-4 py-2 text-black bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                            >
                                <ArrowLeft size={18} />
                                Back to List
                            </button>
                            <div className="h-6 w-px bg-black"></div>
                            <div>
                                <h1 className="text-2xl font-bold text-black">Edit Crisis Card</h1>
                                <p className="text-sm text-gray-600 mt-1">Modify card details and response options</p>
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

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Form Section */}
                    <div className="space-y-6">
                        {/* Card Details */}
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                                <h2 className="text-lg font-bold text-black">Card Details</h2>
                                <p className="text-sm text-gray-600 mt-1">Basic information about the crisis card</p>
                            </div>
                            <div className="p-6 space-y-6">
                                <FormInput label="Card Title" required error={formErrors.title}>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => updateField('title', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                        placeholder="Enter a clear, descriptive title"
                                    />
                                </FormInput>

                                <FormInput label="Description" required error={formErrors.description}>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => updateField('description', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none h-32 resize-none"
                                        placeholder="Describe the crisis scenario and context"
                                    />
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500">Provide clear context for responders</p>
                                        <p className="text-xs text-gray-500">{formData.description.length}/500</p>
                                    </div>
                                </FormInput>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <FormInput label="Category" required error={formErrors.categoryId}>
                                        <select
                                            id="category"
                                            aria-label="Category"
                                            value={formData.categoryId}
                                            onChange={(e) => handleCategoryChange(e.target.value)}
                                            className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
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
                                            className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </FormInput>
                                </div>

                                {/* Card Base Values */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-3">Card Base Values</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                        {[
                                            { key: 'pwValue' as const, label: 'PW (Power)', icon: Shield, color: 'text-blue-500', error: formErrors.pwValue },
                                            { key: 'efValue' as const, label: 'EF (Efficiency)', icon: TrendingUp, color: 'text-green-500', error: formErrors.efValue },
                                            { key: 'psValue' as const, label: 'PS (Precision)', icon: Heart, color: 'text-red-500', error: formErrors.psValue },
                                            { key: 'grValue' as const, label: 'GR (Growth)', icon: Users, color: 'text-yellow-500', error: formErrors.grValue },
                                        ].map(({ key, label, icon: Icon, color, error }) => (
                                            <div key={key}>
                                                <label className="flex items-center gap-2 text-xs font-medium mb-2 h-5">
                                                    <Icon size={14} className={color} />
                                                    {label}
                                                </label>
                                                <NumberInput
                                                    value={formData[key]}
                                                    onChange={(value) => updateNumberField(key, value)}
                                                    min={-50}
                                                    max={50}
                                                    placeholder="0"
                                                    className="p-2 text-sm"
                                                />
                                                {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">Set base values. Range: -50 to +50.</p>
                                </div>

                                <FormInput
                                    label="Response Time Limit"
                                    required
                                    error={formErrors.timeLimit}
                                    helpText="Maximum time allowed for response selection"
                                >
                                    <NumberInput
                                        value={formData.timeLimit}
                                        onChange={(value) => updateNumberField('timeLimit', value)}
                                        min={1}
                                        max={120}
                                        placeholder="15"
                                        suffix="minutes"
                                    />
                                </FormInput>
                            </div>
                        </div>

                        {/* Response Options */}
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                                <h2 className="text-lg font-bold text-black">
                                    Response Options <span className="text-red-500">*</span>
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">Available actions for crisis response (1-3 options)</p>
                            </div>
                            <div className="p-6">
                                <div className="space-y-4">
                                    {formData.responseOptions.map((option, index) => (
                                        <ResponseOptionEditor
                                            key={index}
                                            option={option}
                                            index={index}
                                            errors={formErrors.responseOptions?.[index]}
                                            onTextChange={handleResponseOptionText}
                                            onEffectChange={handleResponseOptionEffect}
                                            onRemove={removeResponseOption}
                                            canRemove={formData.responseOptions.length > 1}
                                        />
                                    ))}

                                    {formData.responseOptions.length < 3 && (
                                        <button
                                            onClick={addResponseOption}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-blue-600 bg-white border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(59,130,246,1)] hover:shadow-[1px_1px_0px_0px_rgba(59,130,246,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                                        >
                                            <Plus size={18} />
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
                            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Save size={20} />
                            {saving ? 'Saving Changes...' : 'Update Crisis Card'}
                        </button>
                    </div>

                    {/* Preview Section */}
                    <div className="space-y-6">
                        <CardPreview formData={formData} categories={categories} />
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
        </div>
    );
}
