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
    RefreshCw
} from 'lucide-react';
const CreateGameSession = () => {
    const [formData, setFormData] = useState({
        categoryId: '',
        gameCode: '',
        autoGenerateCode: true
    });

    const [categories, setCategories] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedGameCode, setGeneratedGameCode] = useState('');

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

    const handleGenerateNewCode = () => {
        const newCode = generateGameCode();
        setGeneratedGameCode(newCode);
        setFormData(prev => ({ ...prev, gameCode: newCode }));
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.categoryId) {
            newErrors.categoryId = 'Please select a crisis category';
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
                gameCode: formData.gameCode,
                hostId: 2,
                categoryId: parseInt(formData.categoryId),
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
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                                <Target size={20} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold">Crisis Category</h2>
                        </div>

                        <div>
                            <label htmlFor="categoryId" className="block font-medium text-gray-700 mb-2">
                                Select Category *
                            </label>
                            <select
                                id="categoryId"
                                name="categoryId"
                                value={formData.categoryId}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium ${errors.categoryId ? 'border-red-500' : 'border-black'
                                    }`}
                            >
                                <option value="">Choose a crisis category...</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))}
                            </select>
                            {errors.categoryId && (
                                <p className="text-red-600 text-sm mt-2 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.categoryId}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-2">
                                Cards from this category will be used in the game session
                            </p>
                        </div>
                    </div>

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
                                        className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl font-bold uppercase text-center ${errors.gameCode ? 'border-red-500' : 'border-black'
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
