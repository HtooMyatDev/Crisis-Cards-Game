"use client"
import React, { useEffect, useState } from 'react';
import {
    Save,
    X,
    Users,
    Target,
    Info,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    RefreshCw,
    FileText
} from 'lucide-react';

const CreateGameSession = () => {
    const [formData, setFormData] = useState({
        name: '',
        categoryIds: [], // Changed to array for multiple categories
        gameCode: '',
        autoGenerateCode: true,
        gameMode: 'Standard' // Default game mode
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedGameCode, setGeneratedGameCode] = useState('');

    const gameModes = ['Standard', 'Quick Play', 'Advanced', 'Custom'];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await fetch('/api/admin/categories');
                const data = await res.json();
                if (data.success && Array.isArray(data.categories)) {
                    setCategories(data.categories)
                }
            }
            catch (error) {
                console.error('Failed to fetch categories', error)
            }
        };
        fetchCategories();
    }, [])

    const generateGameCode = () => {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }

        if (name === 'autoGenerateCode' && checked) {
            const newCode = generateGameCode();
            setGeneratedGameCode(newCode);
            setFormData(prev => ({ ...prev, gameCode: newCode }));
        }
    };

    const handleCategoryToggle = (categoryId) => {
        setFormData(prev => {
            const isSelected = prev.categoryIds.includes(categoryId);
            return {
                ...prev,
                categoryIds: isSelected
                    ? prev.categoryIds.filter(id => id !== categoryId)
                    : [...prev.categoryIds, categoryId]
            };
        });

        if (errors.categoryIds) {
            setErrors(prev => ({ ...prev, categoryIds: '' }));
        }
    };

    const handleGenerateNewCode = () => {
        const newCode = generateGameCode();
        setGeneratedGameCode(newCode);
        setFormData(prev => ({ ...prev, gameCode: newCode }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Session name is required';
        }

        if (formData.categoryIds.length === 0) {
            newErrors.categoryIds = 'Please select at least one crisis category';
        }

        if (!formData.gameMode) {
            newErrors.gameMode = 'Please select a game mode';
        }

        if (!formData.autoGenerateCode && !formData.gameCode.trim()) {
            newErrors.gameCode = 'Game code is required';
        } else if (!formData.autoGenerateCode && formData.gameCode.trim().length !== 6) {
            newErrors.gameCode = 'Game code must be exactly 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async () => {
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const formattedData = {
                name: formData.name,
                gameCode: formData.gameCode,
                hostId: 2, // Replace with actual admin ID from auth
                categoryIds: formData.categoryIds.map(id => parseInt(id)),
                gameMode: formData.gameMode
            }
            const response = await fetch('/api/admin/games', {
                method: 'POST',
                headers: {
                    'Content-Type': "application/json"
                },
                body: JSON.stringify(formattedData),
            })

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to create a game session')
            }

            const result = await response.json();
            console.log('Game session created successfully:', result);
            setShowSuccess(true);

            // Optionally redirect after success
            setTimeout(() => {
                window.location.href = '/admin/games/manage';
            }, 2000);

        } catch (error) {
            console.error('Error creating session:', error);
            setErrors({ submit: 'Failed to create game session. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            window.history.back();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 sm:p-6">
            <div className="max-w-3xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => window.history.back()}
                            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} className="text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Create Game Session</h1>
                            <p className="text-gray-600 mt-1 text-sm sm:text-base">Start a new crisis card game</p>
                        </div>
                    </div>
                </div>

                {showSuccess && (
                    <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                                <CheckCircle size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-green-800">Game Session Created!</h3>
                                <p className="text-green-700 text-sm">
                                    Game Code: <span className="font-mono font-bold text-lg">{generatedGameCode}</span>
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {errors.submit && (
                    <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500 border-2 border-black rounded-lg">
                                <AlertCircle size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-red-800">Error</h3>
                                <p className="text-red-700 text-sm">{errors.submit}</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-6">
                    {/* Session Name */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-500 border-2 border-black rounded-lg">
                                <FileText size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Session Details</h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label htmlFor="name" className="block font-medium text-gray-700 mb-2">
                                    Session Name *
                                </label>
                                <input
                                    id="name"
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g., Team Building Session, Monday Game..."
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
                                        errors.name ? 'border-red-500' : 'border-black'
                                    }`}
                                />
                                {errors.name && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.name}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    Choose a memorable name to identify this game session
                                </p>
                            </div>

                            <div>
                                <label htmlFor="gameMode" className="block font-medium text-gray-700 mb-2">
                                    Game Mode *
                                </label>
                                <select
                                    id="gameMode"
                                    name="gameMode"
                                    value={formData.gameMode}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium ${
                                        errors.gameMode ? 'border-red-500' : 'border-black'
                                    }`}
                                >
                                    {gameModes.map(mode => (
                                        <option key={mode} value={mode}>
                                            {mode}
                                        </option>
                                    ))}
                                </select>
                                {errors.gameMode && (
                                    <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.gameMode}
                                    </p>
                                )}
                                <p className="text-sm text-gray-500 mt-2">
                                    Select the gameplay style for this session
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Crisis Category */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                                <Target size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Crisis Categories</h2>
                        </div>

                        <div>
                            <label className="block font-medium text-gray-700 mb-3">
                                Select Categories * (You can select multiple)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {categories.map(category => {
                                    const isSelected = formData.categoryIds.includes(category.id.toString());
                                    return (
                                        <button
                                            key={category.id}
                                            type="button"
                                            onClick={() => handleCategoryToggle(category.id.toString())}
                                            className={`p-4 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 text-left ${
                                                isSelected
                                                    ? 'bg-gray-900'
                                                    : 'bg-white hover:bg-gray-50'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-6 h-6 rounded-md border-2 border-black flex items-center justify-center flex-shrink-0 transition-all ${
                                                        isSelected ? 'scale-100' : 'scale-100'
                                                    }`}
                                                    style={{
                                                        backgroundColor: isSelected ? category.color : 'white'
                                                    }}
                                                >
                                                    {isSelected && (
                                                        <svg
                                                            width="16"
                                                            height="16"
                                                            viewBox="0 0 24 24"
                                                            fill="none"
                                                            stroke="white"
                                                            strokeWidth="3"
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                        >
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 flex-1">
                                                    <div
                                                        className="w-3 h-3 rounded-full border-2 border-black flex-shrink-0"
                                                        style={{ backgroundColor: category.color }}
                                                    />
                                                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                                                        {category.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.categoryIds && (
                                <p className="text-red-600 text-sm mt-3 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.categoryIds}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-3">
                                Selected: <span className="font-semibold">{formData.categoryIds.length}</span> {formData.categoryIds.length === 1 ? 'category' : 'categories'}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                                Cards from selected categories will be shuffled and used in the game
                            </p>
                        </div>
                    </div>

                    {/* Game Code */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                                <Users size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Game Code</h2>
                        </div>

                        <div className="space-y-4">
                            <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                                <input
                                    type="checkbox"
                                    name="autoGenerateCode"
                                    checked={formData.autoGenerateCode}
                                    onChange={handleInputChange}
                                    className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                />
                                <div>
                                    <span className="font-medium text-gray-700">Auto-generate game code</span>
                                    <p className="text-sm text-gray-500">Automatically create a unique 6-character code</p>
                                </div>
                            </label>

                            {formData.autoGenerateCode ? (
                                <div>
                                    <label className="block font-medium text-gray-700 mb-2">
                                        Generated Game Code
                                    </label>
                                    <div className="flex gap-2">
                                        <div className="flex-1 px-4 py-3 bg-gray-100 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-mono text-2xl font-bold text-center text-gray-800">
                                            {generatedGameCode || 'XXXXXX'}
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleGenerateNewCode}
                                            className="px-4 py-3 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200"
                                            aria-label="Generate new code"
                                        >
                                            <RefreshCw size={20} />
                                        </button>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2">
                                        A code will be generated when you create the session
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <label htmlFor="gameCode" className="block font-medium text-gray-700 mb-2">
                                        Custom Game Code *
                                    </label>
                                    <input
                                        id="gameCode"
                                        type="text"
                                        name="gameCode"
                                        value={formData.gameCode}
                                        onChange={handleInputChange}
                                        placeholder="Enter 6-character code..."
                                        maxLength={6}
                                        className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl font-bold uppercase text-center ${
                                            errors.gameCode ? 'border-red-500' : 'border-black'
                                        }`}
                                    />
                                    {errors.gameCode && (
                                        <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.gameCode}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-2">
                                        Players will use this code to join your game
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                        <div className="flex gap-3">
                            <Info size={20} className="text-blue-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">What happens next?</p>
                                <ul className="space-y-1 list-disc list-inside">
                                    <li>Your game session will be created with status WAITING</li>
                                    <li>Share the game code with players so they can join</li>
                                    <li>Once players join you can start the game</li>
                                    <li>Cards from the selected category will be used during gameplay</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-end">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-gray-400 text-white font-bold border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span className="flex items-center justify-center gap-2">
                                <X size={20} />
                                Cancel
                            </span>
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-3 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Creating Session...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-2">
                                    <Save size={20} />
                                    Create Session
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateGameSession;
