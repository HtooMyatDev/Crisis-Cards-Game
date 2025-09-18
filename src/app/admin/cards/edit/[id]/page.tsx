"use client"
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, X, Clock, Tag, AlertCircle, Eye, Zap, Shield, TrendingUp, Heart, Users } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';

type Category = {
    id: number;
    name: string;
    color: string;
    accent?: string;
    bg?: string;
    text?: string;
    shadow?: string;
};

type ResponseOption = {
    text: string;
    pwEffect: number;
    efEffect: number;
    psEffect: number;
    grEffect: number;
};

type FormState = {
    title: string;
    description: string;
    categoryId: number | '';
    categoryName: string;
    status: 'Active' | 'Inactive';
    timeLimit: number;
    // Base values
    pwValue: number;
    efValue: number;
    psValue: number;
    grValue: number;
    responseOptions: ResponseOption[];
};

type ResponseOptionErrors = Partial<{
    text: string;
    pwEffect: string;
    efEffect: string;
    psEffect: string;
    grEffect: string;
}>;

type FormErrors = Partial<{
    title: string;
    description: string;
    categoryId: string;
    timeLimit: string;
    pwValue: string;
    efValue: string;
    psValue: string;
    grValue: string;
    responseOptions: ResponseOptionErrors[];
}>;

export default function EditCrisisCardDesign() {
    const router = useRouter();
    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<FormState>({
        title: '',
        description: '',
        categoryId: '',
        categoryName: '',
        status: 'Active',
        timeLimit: 15,
        pwValue: 0,
        efValue: 0,
        psValue: 0,
        grValue: 0,
        responseOptions: [{ text: '', pwEffect: 0, efEffect: 0, psEffect: 0, grEffect: 0 }]
    });
    const [saving, setSaving] = useState(false);
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showUnsavedModal, setShowUnsavedModal] = useState(false);

    const validateForm = (): boolean => {
        const errors: FormErrors = {};

        if (!formData.title || formData.title.trim().length < 2) {
            errors.title = 'Title is required (min 2 characters)';
        }

        if (!formData.description || formData.description.trim().length < 10) {
            errors.description = 'Description is required (min 10 characters)';
        }

        if (formData.categoryId === '' || typeof formData.categoryId !== 'number') {
            errors.categoryId = 'Category is required';
        }

        if (typeof formData.timeLimit !== 'number' || formData.timeLimit < 1 || formData.timeLimit > 120) {
            errors.timeLimit = 'Time limit must be between 1 and 120 minutes';
        }

        const inRange50 = (v: number) => v >= -50 && v <= 50;
        if (!inRange50(formData.pwValue)) errors.pwValue = 'PW must be between -50 and 50';
        if (!inRange50(formData.efValue)) errors.efValue = 'EF must be between -50 and 50';
        if (!inRange50(formData.psValue)) errors.psValue = 'PS must be between -50 and 50';
        if (!inRange50(formData.grValue)) errors.grValue = 'GR must be between -50 and 50';

        const optionErrors: ResponseOptionErrors[] = [];
        const effectInRange = (v: number) => v >= -10 && v <= 10;

        const nonEmptyOptions = formData.responseOptions.filter(o => o.text.trim().length > 0);
        if (nonEmptyOptions.length === 0) {
            optionErrors[0] = { ...(optionErrors[0] || {}), text: 'At least one response option is required' };
        }

        formData.responseOptions.forEach((opt, idx) => {
            const oe: ResponseOptionErrors = {};
            const textLen = opt.text.trim().length;
            if (textLen > 0 && (textLen < 2 || textLen > 100)) {
                oe.text = 'Text must be 2-100 characters when provided';
            }
            if (!effectInRange(opt.pwEffect)) oe.pwEffect = 'PW effect must be between -10 and 10';
            if (!effectInRange(opt.efEffect)) oe.efEffect = 'EF effect must be between -10 and 10';
            if (!effectInRange(opt.psEffect)) oe.psEffect = 'PS effect must be between -10 and 10';
            if (!effectInRange(opt.grEffect)) oe.grEffect = 'GR effect must be between -10 and 10';
            if (Object.keys(oe).length > 0) optionErrors[idx] = oe;
        });

        if (optionErrors.length > 0) errors.responseOptions = optionErrors;

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Fetch card data and categories
    useEffect(() => {
        async function fetchData() {
            try {
                // Fetch categories first
                const categoriesRes = await fetch('/api/admin/categories');
                const categoriesData = await categoriesRes.json();
                const categoriesList = Array.isArray(categoriesData?.categories) ? categoriesData.categories : [];
                setCategories(categoriesList);

                // Fetch card data
                const cardRes = await fetch(`/api/admin/cards/${id}`);
                const cardData = await cardRes.json();
                const card = cardData?.card ?? null;

                // Update form data with fetched card data
                if (card) {
                    setFormData({
                        title: card.title || '',
                        description: card.description || '',
                        categoryId: typeof card.categoryId === 'number' ? card.categoryId : '',
                        categoryName: card.category?.name || '',
                        status: card.status || 'Active',
                        timeLimit: typeof card.timeLimit === 'number' ? card.timeLimit : 15,
                        pwValue: typeof card.pwValue === 'number' ? card.pwValue : 0,
                        efValue: typeof card.efValue === 'number' ? card.efValue : 0,
                        psValue: typeof card.psValue === 'number' ? card.psValue : 0,
                        grValue: typeof card.grValue === 'number' ? card.grValue : 0,
                        responseOptions: Array.isArray(card.cardResponses) && card.cardResponses.length > 0
                            ? card.cardResponses.map((r: { text: string; pwEffect: number; efEffect: number; psEffect: number; grEffect: number; }) => ({
                                text: typeof r.text === 'string' ? r.text : '',
                                pwEffect: typeof r.pwEffect === 'number' ? r.pwEffect : 0,
                                efEffect: typeof r.efEffect === 'number' ? r.efEffect : 0,
                                psEffect: typeof r.psEffect === 'number' ? r.psEffect : 0,
                                grEffect: typeof r.grEffect === 'number' ? r.grEffect : 0,
                            }))
                            : [{ text: '', pwEffect: 0, efEffect: 0, psEffect: 0, grEffect: 0 }]
                    });
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [id]);

    const handleInputChange = <K extends keyof FormState>(field: K, value: FormState[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setHasUnsavedChanges(true);
    };

    const handleNumberInputChange = (field: keyof Pick<FormState, 'pwValue' | 'efValue' | 'psValue' | 'grValue' | 'timeLimit'>, value: string) => {
        // Allow empty string for user to clear the field
        if (value === '') {
            handleInputChange(field, 0);
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                handleInputChange(field, numValue);
            }
        }
    };

    const handleEffectInputChange = (index: number, field: keyof Pick<ResponseOption, 'pwEffect' | 'efEffect' | 'psEffect' | 'grEffect'>, value: string) => {
        // Allow empty string for user to clear the field
        if (value === '') {
            updateResponseOptionEffect(index, field, 0);
        } else {
            const numValue = Number(value);
            if (!isNaN(numValue)) {
                updateResponseOptionEffect(index, field, numValue);
            }
        }
    };

    const handleCategoryChange = (categoryId: string) => {
        const category = categories.find(cat => cat.id === parseInt(categoryId));
        if (category) {
            setFormData(prev => ({
                ...prev,
                categoryId: category.id,
                categoryName: category.name
            }));
            setHasUnsavedChanges(true);
        }
    };

    const addResponseOption = () => {
        if (formData.responseOptions.length < 3) {
            setFormData(prev => ({
                ...prev,
                responseOptions: [...prev.responseOptions, { text: '', pwEffect: 0, efEffect: 0, psEffect: 0, grEffect: 0 }]
            }));
            setHasUnsavedChanges(true);
        }
    };

    const removeResponseOption = (index: number) => {
        if (formData.responseOptions.length > 1) {
            setFormData(prev => ({
                ...prev,
                responseOptions: prev.responseOptions.filter((_, i) => i !== index)
            }));
            setHasUnsavedChanges(true);
        }
    };

    const updateResponseOptionText = (index: number, value: string) => {
        setFormData(prev => ({
            ...prev,
            responseOptions: prev.responseOptions.map((option, i) => i === index ? { ...option, text: value } : option)
        }));
        setHasUnsavedChanges(true);
    };

    const updateResponseOptionEffect = (index: number, field: keyof Pick<ResponseOption, 'pwEffect' | 'efEffect' | 'psEffect' | 'grEffect'>, value: number) => {
        setFormData(prev => ({
            ...prev,
            responseOptions: prev.responseOptions.map((option, i) => i === index ? { ...option, [field]: value } as ResponseOption : option)
        }));
        setHasUnsavedChanges(true);
    };

    const handleSave = async () => {
        if (!validateForm()) {
            alert('Please fix the highlighted errors before saving.');
            return;
        }
        setSaving(true);
        try {
            const response = await fetch(`/api/admin/cards/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
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

    const handleConfirmLeave = () => {
        setShowUnsavedModal(false);
        router.push('/admin/cards/list');
    };

    const handleCancelLeave = () => {
        setShowUnsavedModal(false);
    };

    // Get category colors based on current selection
    const getCurrentCategory = () => {
        return Array.isArray(categories)
            ? categories.find(cat => cat.name === formData.categoryName)
            : undefined;
    };

    // Helper function to convert hex to RGB for transparency effects
    const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

    // Generate color styles based on category hex color
    const getCategoryStyles = (category: { name: string; color?: string }) => {
        const defaultColor = '#6b7280'; // gray-500
        const hexColor = category?.color || defaultColor;

        // Ensure hex color starts with #
        const normalizedHex = hexColor.startsWith('#') ? hexColor : `#${hexColor}`;

        const rgb = hexToRgb(normalizedHex);
        if (!rgb) {
            return {
                accentStyle: { backgroundColor: defaultColor },
                borderStyle: { borderColor: defaultColor },
                bgStyle: { backgroundColor: `rgba(107, 114, 128, 0.1)` },
                textStyle: { color: defaultColor },
                shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(107, 114, 128, 1)` }
            };
        }

        return {
            accentStyle: { backgroundColor: normalizedHex },
            borderStyle: { borderColor: normalizedHex },
            bgStyle: { backgroundColor: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)` },
            textStyle: { color: normalizedHex },
            shadowStyle: { boxShadow: `4px 4px 0px 0px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)` }
        };
    };

    // Helper function to format effect values
    const formatEffect = (value: number) => {
        return value >= 0 ? `+${value}` : `${value}`;
    };

    // Helper function to get effect color
    const getEffectColor = (value: number) => {
        if (value > 0) return 'text-green-600';
        if (value < 0) return 'text-red-600';
        return 'text-gray-600';
    };

    const previewColors = (() => {
        const currentCategory = getCurrentCategory();
        if (currentCategory) {
            // Use the new getCategoryStyles function for dynamic colors
            const styles = getCategoryStyles(currentCategory);
            return {
                accent: styles.accentStyle.backgroundColor,
                bg: styles.bgStyle.backgroundColor,
                text: styles.textStyle.color,
                shadow: styles.shadowStyle.boxShadow,
                border: styles.borderStyle.borderColor
            };
        }
        return {
            accent: '#6b7280',
            bg: 'rgba(107, 114, 128, 0.1)',
            text: '#6b7280',
            shadow: '4px 4px 0px 0px rgba(107, 114, 128, 1)',
            border: '#6b7280'
        };
    })();

    if (loading) return (
        <div className="min-h-screen bg-white">
            <div className="bg-gray-50 border-b-2 border-black sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="h-8 w-40 bg-gray-200 animate-pulse rounded" />
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Form skeleton */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                                <div className="h-5 w-36 bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-64 bg-gray-200 animate-pulse rounded mt-2" />
                            </div>
                            <div className="p-6 space-y-6">
                                <div>
                                    <div className="h-4 w-28 bg-gray-200 animate-pulse rounded mb-2" />
                                    <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                </div>
                                <div>
                                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded mb-2" />
                                    <div className="h-28 w-full bg-gray-200 animate-pulse rounded" />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <div className="h-4 w-20 bg-gray-200 animate-pulse rounded mb-2" />
                                        <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                    </div>
                                    <div>
                                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mb-2" />
                                        <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                    </div>
                                </div>
                                <div>
                                    <div className="h-4 w-52 bg-gray-200 animate-pulse rounded mb-2" />
                                    <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                            <div className="h-5 w-40 bg-gray-200 animate-pulse rounded mb-4" />
                            <div className="space-y-4">
                                <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                                <div className="h-12 w-full bg-gray-200 animate-pulse rounded" />
                            </div>
                            <div className="h-12 w-full bg-gray-300 animate-pulse rounded mt-6" />
                        </div>
                    </div>

                    {/* Preview skeleton */}
                    <div className="space-y-6">
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-24">
                            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                                <div className="h-5 w-28 bg-gray-200 animate-pulse rounded" />
                                <div className="h-4 w-56 bg-gray-200 animate-pulse rounded mt-2" />
                            </div>
                            <div className="p-6">
                                <div className="bg-white border-2 border-black rounded-lg p-6 relative">
                                    <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded mb-4" />
                                    <div className="h-16 w-full bg-gray-200 animate-pulse rounded mb-6" />
                                    <div className="space-y-3 mb-6">
                                        <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
                                        <div className="h-5 w-48 bg-gray-200 animate-pulse rounded" />
                                    </div>
                                    <div className="space-y-2">
                                        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                                        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                                        <div className="h-10 w-full bg-gray-200 animate-pulse rounded" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
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
                                {/* Title */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Card Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={(e) => handleInputChange('title', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                        placeholder="Enter a clear, descriptive title"
                                    />
                                    {formErrors.title && <p className="text-red-600 text-xs mt-1">{formErrors.title}</p>}
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Description <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange('description', e.target.value)}
                                        className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none h-32 resize-none"
                                        placeholder="Describe the crisis scenario and context"
                                    />
                                    {formErrors.description && <p className="text-red-600 text-xs mt-1">{formErrors.description}</p>}
                                    <div className="flex justify-between mt-2">
                                        <p className="text-xs text-gray-500">Provide clear context for responders</p>
                                        <p className="text-xs text-gray-500">{formData.description.length}/500</p>
                                    </div>
                                </div>

                                {/* Category and Status */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="editCategorySelect" className="block text-sm font-bold text-black mb-2">
                                            Category <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            id="editCategorySelect"
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
                                        {formErrors.categoryId && <p className="text-red-600 text-xs mt-1">{formErrors.categoryId}</p>}
                                    </div>
                                    <div>
                                        <label htmlFor="editStatusSelect" className="block text-sm font-bold text-black mb-2">Status</label>
                                        <select
                                            id="editStatusSelect"
                                            value={formData.status}
                                            onChange={(e) => handleInputChange('status', e.target.value as FormState['status'])}
                                            className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                        >
                                            <option value="Active">Active</option>
                                            <option value="Inactive">Inactive</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Card Base Values */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-3">Card Base Values</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium mb-2 h-5">
                                                <Shield size={14} className="text-blue-500" />
                                                PW (Power)
                                            </label>
                                            <input
                                                type="number"
                                                min="-50"
                                                max="50"
                                                value={formData.pwValue === 0 ? '' : formData.pwValue}
                                                onChange={(e) => handleNumberInputChange('pwValue', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
                                                placeholder="0"
                                            />
                                            {formErrors.pwValue && <p className="text-red-600 text-xs mt-1">{formErrors.pwValue}</p>}
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium mb-2 h-5">
                                                <TrendingUp size={14} className="text-green-500" />
                                                EF (Efficiency)
                                            </label>
                                            <input
                                                type="number"
                                                min="-50"
                                                max="50"
                                                value={formData.efValue === 0 ? '' : formData.efValue}
                                                onChange={(e) => handleNumberInputChange('efValue', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
                                                placeholder="0"
                                            />
                                            {formErrors.efValue && <p className="text-red-600 text-xs mt-1">{formErrors.efValue}</p>}
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium mb-2 h-5">
                                                <Heart size={14} className="text-red-500" />
                                                PS (Precision)
                                            </label>
                                            <input
                                                type="number"
                                                min="-50"
                                                max="50"
                                                value={formData.psValue === 0 ? '' : formData.psValue}
                                                onChange={(e) => handleNumberInputChange('psValue', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
                                                placeholder="0"
                                            />
                                            {formErrors.psValue && <p className="text-red-600 text-xs mt-1">{formErrors.psValue}</p>}
                                        </div>
                                        <div>
                                            <label className="flex items-center gap-2 text-xs font-medium mb-2 h-5">
                                                <Users size={14} className="text-yellow-500" />
                                                GR (Growth)
                                            </label>
                                            <input
                                                type="number"
                                                min="-50"
                                                max="50"
                                                value={formData.grValue === 0 ? '' : formData.grValue}
                                                onChange={(e) => handleNumberInputChange('grValue', e.target.value)}
                                                onFocus={(e) => e.target.select()}
                                                className="w-full p-2 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-sm"
                                                placeholder="0"
                                            />
                                            {formErrors.grValue && <p className="text-red-600 text-xs mt-1">{formErrors.grValue}</p>}
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-2">Set base values. Range: -50 to +50.</p>
                                </div>

                                {/* Time Limit */}
                                <div>
                                    <label className="block text-sm font-bold text-black mb-2">
                                        Response Time Limit <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            min="1"
                                            max="120"
                                            value={formData.timeLimit === 0 ? '' : formData.timeLimit}
                                            onChange={(e) => handleNumberInputChange('timeLimit', e.target.value)}
                                            onFocus={(e) => e.target.select()}
                                            className="w-full px-4 py-3 pr-20 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                            placeholder="15"
                                        />
                                        {formErrors.timeLimit && <p className="text-red-600 text-xs mt-1">{formErrors.timeLimit}</p>}
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <span className="text-gray-500 text-sm font-bold">minutes</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">Maximum time allowed for response selection</p>
                                </div>
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
                                        <div key={index} className="p-4 border-2 border-gray-300 rounded-lg bg-gray-50">
                                            <div className="flex items-center gap-3 mb-3">
                                                <input
                                                    type="text"
                                                    value={option.text}
                                                    onChange={(e) => updateResponseOptionText(index, e.target.value)}
                                                    className="flex-1 px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] focus:translate-x-[1px] focus:translate-y-[1px] transition-all duration-200 outline-none"
                                                    placeholder={`Response option ${index + 1}`}
                                                />
                                                {formErrors.responseOptions?.[index]?.text && (
                                                    <p className="text-red-600 text-xs">{formErrors.responseOptions[index]?.text}</p>
                                                )}
                                                {formData.responseOptions.length > 1 && (
                                                    <button
                                                        onClick={() => removeResponseOption(index)}
                                                        className="p-3 text-red-600 bg-white border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                                                        aria-label={`Remove response option ${index + 1}`}
                                                        title={`Remove response option ${index + 1}`}
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                                <div>
                                                    <label className="flex items-center gap-1 text-xs font-medium mb-1">
                                                        <Shield size={12} className="text-blue-500" />
                                                        PW Effect
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="-10"
                                                        max="10"
                                                        value={option.pwEffect === 0 ? '' : option.pwEffect}
                                                        onChange={(e) => handleEffectInputChange(index, 'pwEffect', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full p-2 text-sm border border-gray-400 rounded"
                                                        placeholder="0"
                                                    />
                                                    {formErrors.responseOptions?.[index]?.pwEffect && (
                                                        <p className="text-red-600 text-xs mt-1">{formErrors.responseOptions[index]?.pwEffect}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1 text-xs font-medium mb-1">
                                                        <TrendingUp size={12} className="text-green-500" />
                                                        EF Effect
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="-10"
                                                        max="10"
                                                        value={option.efEffect === 0 ? '' : option.efEffect}
                                                        onChange={(e) => handleEffectInputChange(index, 'efEffect', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full p-2 text-sm border border-gray-400 rounded"
                                                        placeholder="0"
                                                    />
                                                    {formErrors.responseOptions?.[index]?.efEffect && (
                                                        <p className="text-red-600 text-xs mt-1">{formErrors.responseOptions[index]?.efEffect}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1 text-xs font-medium mb-1">
                                                        <Heart size={12} className="text-red-500" />
                                                        PS Effect
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="-10"
                                                        max="10"
                                                        value={option.psEffect === 0 ? '' : option.psEffect}
                                                        onChange={(e) => handleEffectInputChange(index, 'psEffect', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full p-2 text-sm border border-gray-400 rounded"
                                                        placeholder="0"
                                                    />
                                                    {formErrors.responseOptions?.[index]?.psEffect && (
                                                        <p className="text-red-600 text-xs mt-1">{formErrors.responseOptions[index]?.psEffect}</p>
                                                    )}
                                                </div>
                                                <div>
                                                    <label className="flex items-center gap-1 text-xs font-medium mb-1">
                                                        <Users size={12} className="text-yellow-500" />
                                                        GR Effect
                                                    </label>
                                                    <input
                                                        type="number"
                                                        min="-10"
                                                        max="10"
                                                        value={option.grEffect === 0 ? '' : option.grEffect}
                                                        onChange={(e) => handleEffectInputChange(index, 'grEffect', e.target.value)}
                                                        onFocus={(e) => e.target.select()}
                                                        className="w-full p-2 text-sm border border-gray-400 rounded"
                                                        placeholder="0"
                                                    />
                                                    {formErrors.responseOptions?.[index]?.grEffect && (
                                                        <p className="text-red-600 text-xs mt-1">{formErrors.responseOptions[index]?.grEffect}</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
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
                        <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sticky top-24">
                            <div className="bg-gray-50 px-6 py-4 border-b-2 border-black">
                                <div className="flex items-center gap-2">
                                    <Eye size={18} className="text-black" />
                                    <h2 className="text-lg font-bold text-black">Live Preview</h2>
                                </div>
                                <p className="text-sm text-gray-600 mt-1">How your crisis card will appear</p>
                            </div>
                            <div className="p-6">
                                <div
                                    className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 relative"
                                    style={{ boxShadow: previewColors.shadow }}
                                >
                                    {/* Color accent bar */}
                                    {formData.categoryName && (
                                        <div
                                            className="absolute top-0 left-0 w-full h-1 rounded-t-md"
                                            style={{ backgroundColor: previewColors.accent }}
                                        ></div>
                                    )}

                                    {/* Card Header */}
                                    <div className="flex justify-between items-start mb-3">
                                        <h3 className="text-lg font-bold text-gray-900 line-clamp-2">
                                            {formData.title || 'Card Title'}
                                        </h3>
                                        <span className={`px-2 py-1 text-xs font-semibold rounded border-2 ${formData.status === 'Active'
                                            ? 'bg-green-100 text-green-800 border-green-800'
                                            : 'bg-red-100 text-red-800 border-red-800'
                                            }`}>
                                            {formData.status}
                                        </span>
                                    </div>

                                    {/* Description */}
                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                        {formData.description || 'Card description will appear here...'}
                                    </p>

                                    {/* Card Details */}
                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center gap-2 text-sm">
                                            <Tag size={16} className="text-gray-500" />
                                            <span
                                                className="font-medium px-2 py-1 border-2 border-gray-200 rounded-full text-xs"
                                                style={{
                                                    backgroundColor: previewColors.bg,
                                                    color: previewColors.text
                                                }}
                                            >
                                                {formData.categoryName || 'Unknown'}
                                            </span>
                                            {getCurrentCategory()?.color && (
                                                <span className="text-xs text-gray-400 font-mono">
                                                    {getCurrentCategory()?.color}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm">
                                            <Clock size={16} className="text-gray-500" />
                                            <span className="text-gray-700">{formData.timeLimit} minutes</span>
                                        </div>
                                    </div>

                                    {/* Card Base Values */}
                                    <div className="mb-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Zap size={16} className="text-gray-500" />
                                            <p className="text-sm font-semibold text-gray-700">Card Values:</p>
                                        </div>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                                <Shield size={14} className="text-blue-500" />
                                                <span className="text-sm font-bold text-gray-800">{formData.pwValue || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                                <TrendingUp size={14} className="text-green-500" />
                                                <span className="text-sm font-bold text-gray-800">{formData.efValue || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                                <Heart size={14} className="text-red-500" />
                                                <span className="text-sm font-bold text-gray-800">{formData.psValue || 0}</span>
                                            </div>
                                            <div className="flex items-center justify-center gap-2 p-2 bg-gray-50 rounded border">
                                                <Users size={14} className="text-yellow-500" />
                                                <span className="text-sm font-bold text-gray-800">{formData.grValue || 0}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Response Options with Effects */}
                                    <div className="mb-4">
                                        <p className="text-sm font-semibold mb-2 text-gray-700">Response Options:</p>
                                        <div className="space-y-2">
                                            {formData.responseOptions.filter(option => option.text.trim()).length > 0 ? (
                                                formData.responseOptions.filter(option => option.text.trim()).slice(0, 2).map((option, index) => (
                                                    <div key={index} className="text-xs bg-gray-100 p-2 rounded border border-gray-300">
                                                        <div className="text-gray-700 mb-1">{option.text}</div>
                                                        <div className="flex gap-2 text-xs">
                                                            <span className={`flex items-center gap-1 font-medium ${getEffectColor(option.pwEffect)}`}>
                                                                <Shield size={10} />
                                                                PW: {formatEffect(option.pwEffect)}
                                                            </span>
                                                            <span className={`flex items-center gap-1 font-medium ${getEffectColor(option.efEffect)}`}>
                                                                <TrendingUp size={10} />
                                                                EF: {formatEffect(option.efEffect)}
                                                            </span>
                                                            <span className={`flex items-center gap-1 font-medium ${getEffectColor(option.psEffect)}`}>
                                                                <Heart size={10} />
                                                                PS: {formatEffect(option.psEffect)}
                                                            </span>
                                                            <span className={`flex items-center gap-1 font-medium ${getEffectColor(option.grEffect)}`}>
                                                                <Users size={10} />
                                                                GR: {formatEffect(option.grEffect)}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="text-xs text-gray-500 bg-yellow-50 p-2 rounded border border-yellow-200">
                                                    No response options found for this card
                                                </div>
                                            )}

                                            {/* Show count of remaining options */}
                                            {formData.responseOptions.filter(option => option.text.trim()).length > 2 && (
                                                <div className="text-xs text-gray-500">
                                                    +{formData.responseOptions.filter(option => option.text.trim()).length - 2} more options
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamps */}
                                    <div className="text-xs text-gray-400 mt-3 pt-2 border-t border-gray-100">
                                        <div>Created: {new Date().toLocaleDateString()}</div>
                                        <div>Updated: {new Date().toLocaleDateString()}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unsaved Changes Modal */}
            {showUnsavedModal && (
                <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center z-50">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full mx-4">
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <AlertCircle size={24} className="text-orange-600" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Unsaved Changes</h3>
                            </div>
                            <p className="text-gray-600 mb-6">
                                You have unsaved changes to this crisis card. Are you sure you want to leave without saving?
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={handleCancelLeave}
                                    className="px-4 py-2 text-gray-600 bg-white border-2 border-gray-300 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleConfirmLeave}
                                    className="px-4 py-2 text-white bg-red-600 border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 font-bold"
                                >
                                    Leave Without Saving
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
