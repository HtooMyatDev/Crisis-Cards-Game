"use client"
import React, { useState, useEffect } from 'react';
import {
    Palette,
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Copy,
    Check,
    Search,
    Filter,
    X
} from 'lucide-react';
import { useForm } from 'react-hook-form';

interface ColorPreset {
    id: number;
    name: string;
    description?: string;
    backgroundColor: string;
    textColor: string;
    textBoxColor: string;
    isActive: boolean;
    isDefault: boolean;
    usageCount: number;
    createdAt: string;
    updatedAt: string;
}

interface PresetFormData {
    name: string;
    description: string;
    backgroundColor: string;
    textColor: string;
    textBoxColor: string;
    isDefault: boolean;
}

export default function ColorPresetsPage() {
    const [presets, setPresets] = useState<ColorPreset[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingPreset, setEditingPreset] = useState<ColorPreset | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
    const [copiedId, setCopiedId] = useState<number | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
        watch,
        setValue,
        reset
    } = useForm<PresetFormData>({
        defaultValues: {
            name: '',
            description: '',
            backgroundColor: '#F0F9FF',
            textColor: '#1F2937',
            textBoxColor: '#FFFFFF',
            isDefault: false
        }
    });

    const watchedColors = {
        backgroundColor: watch('backgroundColor'),
        textColor: watch('textColor'),
        textBoxColor: watch('textBoxColor')
    };
    const watchedName = watch('name');

    // Fetch presets
    useEffect(() => {
        fetchPresets();
    }, []);

    const fetchPresets = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/admin/color-presets');
            if (!response.ok) throw new Error('Failed to fetch presets');

            const data = await response.json();
            setPresets(data.presets || []);
        } catch (error) {
            console.error('Error fetching presets:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredPresets = presets.filter(preset => {
        const matchesSearch = preset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                             preset.description?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesFilter = filterActive === 'all' ||
                             (filterActive === 'active' && preset.isActive) ||
                             (filterActive === 'inactive' && !preset.isActive);

        return matchesSearch && matchesFilter;
    });

    const onSubmit = async (data: PresetFormData) => {
        try {
            const url = editingPreset
                ? `/api/admin/color-presets/${editingPreset.id}`
                : '/api/admin/color-presets';

            const method = editingPreset ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Failed to save preset');

            await fetchPresets();
            handleCloseForm();
        } catch (error) {
            console.error('Error saving preset:', error);
        }
    };

    const handleEdit = (preset: ColorPreset) => {
        setEditingPreset(preset);
        setValue('name', preset.name);
        setValue('description', preset.description || '');
        setValue('backgroundColor', preset.backgroundColor);
        setValue('textColor', preset.textColor);
        setValue('textBoxColor', preset.textBoxColor);
        setValue('isDefault', preset.isDefault);
        setShowCreateForm(true);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setEditingPreset(null);
        reset();
    };

    const handleDelete = async (id: number) => {
        try {
            const response = await fetch(`/api/admin/color-presets/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Failed to delete preset');

            await fetchPresets();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    const handleToggleActive = async (preset: ColorPreset) => {
        try {
            const response = await fetch(`/api/admin/color-presets/${preset.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...preset,
                    isActive: !preset.isActive
                })
            });

            if (!response.ok) throw new Error('Failed to update preset');

            await fetchPresets();
        } catch (error) {
            console.error('Error updating preset:', error);
        }
    };

    const handleCopyColors = (preset: ColorPreset) => {
        const colorString = `backgroundColor: ${preset.backgroundColor}, textColor: ${preset.textColor}, textBoxColor: ${preset.textBoxColor}`;
        navigator.clipboard.writeText(colorString);
        setCopiedId(preset.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const quickPresets = [
        {
            name: "Ocean Blue",
            backgroundColor: "#EFF6FF",
            textColor: "#1E40AF",
            textBoxColor: "#FFFFFF"
        },
        {
            name: "Forest Green",
            backgroundColor: "#ECFDF5",
            textColor: "#047857",
            textBoxColor: "#F0FDF4"
        },
        {
            name: "Sunset Orange",
            backgroundColor: "#FFF7ED",
            textColor: "#C2410C",
            textBoxColor: "#FFFFFF"
        }
    ];

    const applyQuickPreset = (preset: typeof quickPresets[0]) => {
        setValue('backgroundColor', preset.backgroundColor);
        setValue('textColor', preset.textColor);
        setValue('textBoxColor', preset.textBoxColor);
    };

    return (
        <div>
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <Palette size={28} className="text-orange-600" />
                        <h1 className="text-2xl font-bold">Color Presets</h1>
                    </div>
                    <p className="text-gray-600">Manage color schemes for categories</p>
                </div>

                <button
                    onClick={() => setShowCreateForm(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                >
                    <Plus size={20} />
                    Create Preset
                </button>
            </div>

            {/* Search and Filters */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search presets..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <Filter size={20} />
                        <select
                            value={filterActive}
                            onChange={(e) => setFilterActive(e.target.value as 'all' | 'active' | 'inactive')}
                            className="px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">All Presets</option>
                            <option value="active">Active Only</option>
                            <option value="inactive">Inactive Only</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="text-2xl font-bold">{presets.length}</div>
                    <div className="text-sm text-gray-600">Total Presets</div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="text-2xl font-bold">{presets.filter(p => p.isActive).length}</div>
                    <div className="text-sm text-gray-600">Active</div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="text-2xl font-bold">{presets.filter(p => p.isDefault).length}</div>
                    <div className="text-sm text-gray-600">Default Presets</div>
                </div>
                <div className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="text-2xl font-bold">{presets.reduce((sum, p) => sum + p.usageCount, 0)}</div>
                    <div className="text-sm text-gray-600">Total Usage</div>
                </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                {loading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 animate-pulse">
                            <div className="h-20 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded"></div>
                        </div>
                    ))
                ) : filteredPresets.map((preset) => (
                    <div key={preset.id} className="bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] p-4 hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200">
                        {/* Preview */}
                        <div
                            className="h-20 rounded-lg border-2 border-black mb-4 p-3 relative"
                            style={{ backgroundColor: preset.backgroundColor }}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span
                                    className="font-bold text-sm"
                                    style={{ color: preset.textColor }}
                                >
                                    {preset.name}
                                </span>
                                {preset.isDefault && (
                                    <Star size={16} className="fill-yellow-400 text-yellow-400" />
                                )}
                            </div>
                            <div
                                className="px-2 py-1 rounded text-xs border"
                                style={{
                                    backgroundColor: preset.textBoxColor,
                                    color: preset.textColor,
                                    borderColor: preset.textColor
                                }}
                            >
                                Text Box Sample
                            </div>
                        </div>

                        {/* Info */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold">{preset.name}</h3>
                                <div className="flex items-center gap-1">
                                    {!preset.isActive && (
                                        <EyeOff size={14} className="text-gray-400" />
                                    )}
                                    <span className="text-xs text-gray-500">
                                        Used {preset.usageCount} times
                                    </span>
                                </div>
                            </div>
                            {preset.description && (
                                <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                            )}

                            {/* Color Values */}
                            <div className="grid grid-cols-3 gap-2 text-xs">
                                <div className="text-center">
                                    <div
                                        className="w-6 h-6 mx-auto rounded border mb-1"
                                        style={{ backgroundColor: preset.backgroundColor }}
                                    ></div>
                                    <div className="font-mono text-xs">{preset.backgroundColor}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-6 h-6 mx-auto rounded border mb-1"
                                        style={{ backgroundColor: preset.textColor }}
                                    ></div>
                                    <div className="font-mono text-xs">{preset.textColor}</div>
                                </div>
                                <div className="text-center">
                                    <div
                                        className="w-6 h-6 mx-auto rounded border mb-1"
                                        style={{ backgroundColor: preset.textBoxColor }}
                                    ></div>
                                    <div className="font-mono text-xs">{preset.textBoxColor}</div>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                            <button
                                onClick={() => handleEdit(preset)}
                                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 border-2 border-blue-600 text-blue-600 rounded-lg font-medium text-sm shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-blue-50"
                            >
                                <Edit size={14} />
                                Edit
                            </button>
                            <button
                                onClick={() => handleCopyColors(preset)}
                                className="flex items-center justify-center px-3 py-2 border-2 border-green-600 text-green-600 rounded-lg font-medium text-sm shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-[1px_1px_0px_0px_rgba(34,197,94,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-green-50"
                            >
                                {copiedId === preset.id ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                            <button
                                onClick={() => handleToggleActive(preset)}
                                className="flex items-center justify-center px-3 py-2 border-2 border-gray-600 text-gray-600 rounded-lg font-medium text-sm shadow-[2px_2px_0px_0px_rgba(75,85,99,1)] hover:shadow-[1px_1px_0px_0px_rgba(75,85,99,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-gray-50"
                            >
                                {preset.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                                onClick={() => setDeleteConfirm(preset.id)}
                                className="flex items-center justify-center px-3 py-2 border-2 border-red-600 text-red-600 rounded-lg font-medium text-sm shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-[1px_1px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-red-50"
                            >
                                <Trash2 size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* No Results */}
            {!loading && filteredPresets.length === 0 && (
                <div className="text-center py-12 bg-white border-2 border-black rounded-lg shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <Palette size={48} className="mx-auto text-gray-400 mb-4" />
                    <div className="text-gray-500 text-lg mb-2">No presets found</div>
                    <div className="text-gray-400 text-sm">Try adjusting your search or create a new preset</div>
                </div>
            )}

            {/* Create/Edit Form Modal */}
            {showCreateForm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">
                                    {editingPreset ? 'Edit Preset' : 'Create New Preset'}
                                </h2>
                                <button
                                    onClick={handleCloseForm}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block font-bold mb-2">
                                            Preset Name <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            {...register('name', { required: 'Name is required' })}
                                            className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                            placeholder="Ocean Blue"
                                        />
                                        {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>}
                                    </div>

                                    <div>
                                        <label className="flex items-center gap-2 font-bold">
                                            <input
                                                {...register('isDefault')}
                                                type="checkbox"
                                                className="w-4 h-4"
                                            />
                                            Set as Default Preset
                                        </label>
                                        <p className="text-sm text-gray-600 mt-1">Default presets appear in the quick selection</p>
                                    </div>
                                </div>

                                <div>
                                    <label className="block font-bold mb-2">Description</label>
                                    <textarea
                                        {...register('description')}
                                        className="w-full p-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] h-20"
                                        placeholder="Professional blue theme for business categories..."
                                    />
                                </div>

                                {/* Quick Presets */}
                                <div>
                                    <label className="block font-bold mb-3">Quick Start Templates</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {quickPresets.map((preset, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => applyQuickPreset(preset)}
                                                className="p-3 border-2 border-black rounded-lg hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                                style={{
                                                    backgroundColor: preset.backgroundColor,
                                                    color: preset.textColor
                                                }}
                                            >
                                                <div className="text-xs font-medium">{preset.name}</div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Color Configuration */}
                                <div className="space-y-4">
                                    <h3 className="font-bold text-lg">Color Configuration</h3>

                                    {/* Background Color */}
                                    <div>
                                        <label className="block font-bold mb-2">Background Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                {...register('backgroundColor')}
                                                type="color"
                                                className="w-16 h-12 border-2 border-black rounded-lg cursor-pointer"
                                            />
                                            <input
                                                {...register('backgroundColor')}
                                                type="text"
                                                className="flex-1 p-3 border-2 border-black rounded-lg font-mono"
                                                placeholder="#F0F9FF"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Color */}
                                    <div>
                                        <label className="block font-bold mb-2">Text Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                {...register('textColor')}
                                                type="color"
                                                className="w-16 h-12 border-2 border-black rounded-lg cursor-pointer"
                                            />
                                            <input
                                                {...register('textColor')}
                                                type="text"
                                                className="flex-1 p-3 border-2 border-black rounded-lg font-mono"
                                                placeholder="#1F2937"
                                            />
                                        </div>
                                    </div>

                                    {/* Text Box Color */}
                                    <div>
                                        <label className="block font-bold mb-2">Text Box Color</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                {...register('textBoxColor')}
                                                type="color"
                                                className="w-16 h-12 border-2 border-black rounded-lg cursor-pointer"
                                            />
                                            <input
                                                {...register('textBoxColor')}
                                                type="text"
                                                className="flex-1 p-3 border-2 border-black rounded-lg font-mono"
                                                placeholder="#FFFFFF"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Live Preview */}
                                <div>
                                    <label className="block font-bold mb-3">Live Preview</label>
                                    <div
                                        className="p-4 border-2 border-black rounded-lg"
                                        style={{ backgroundColor: watchedColors.backgroundColor }}
                                    >
                                        <div className="flex items-center gap-2 mb-3">
                                            <div
                                                className="w-4 h-4 rounded-full border-2"
                                                style={{ backgroundColor: watchedColors.textColor }}
                                            ></div>
                                            <span
                                                className="font-bold"
                                                style={{ color: watchedColors.textColor }}
                                            >
                                                {watchedName || 'Preset Name'}
                                            </span>
                                        </div>
                                        <div
                                            className="p-2 rounded border-2 text-sm"
                                            style={{
                                                backgroundColor: watchedColors.textBoxColor,
                                                color: watchedColors.textColor,
                                                borderColor: watchedColors.textColor
                                            }}
                                        >
                                            Sample text box content
                                        </div>
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="flex gap-3 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={handleCloseForm}
                                        className="flex-1 px-4 py-3 border-2 border-gray-400 text-gray-700 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="flex-1 px-4 py-3 bg-black text-white font-bold border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? 'Saving...' : (editingPreset ? 'Update Preset' : 'Create Preset')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white border-4 border-black rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Delete Color Preset</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this color preset? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 border-2 border-gray-400 text-gray-700 rounded-lg font-bold shadow-[2px_2px_0px_0px_rgba(156,163,175,1)] hover:shadow-[1px_1px_0px_0px_rgba(156,163,175,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 bg-white hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteConfirm)}
                                className="flex-1 px-4 py-2 bg-red-600 text-white font-bold border-2 border-red-600 rounded-lg shadow-[4px_4px_0px_0px_rgba(220,38,38,1)] hover:shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-200"
                            >
                                Delete Preset
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
