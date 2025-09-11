"use client"
import React, { useState } from 'react';
import {
    Save,
    X,
    Calendar,
    Clock,
    Users,
    Target,
    Settings,
    Info,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    Plus,
    Minus
} from 'lucide-react';

const CreateGameSession = () => {
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        gameMode: 'Team Challenge',
        difficulty: 'Medium',
        maxPlayers: 12,
        duration: 60,
        startDate: '',
        startTime: '',
        endDate: '',
        endTime: '',
        isScheduled: true,
        tags: [],
        allowLateJoin: true,
        autoStart: false,
        enableChat: true,
        recordSession: true,
        categories: []
    });

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [currentTag, setCurrentTag] = useState('');

    // Available options
    const gameModes = [
        'Team Challenge',
        'Solo Practice',
        'Group Learning',
        'Time Trial',
        'Competitive Mode',
        'Training Mode'
    ];

    const difficultyLevels = [
        'Easy',
        'Medium',
        'Hard',
        'Expert',
        'Custom'
    ];

    const availableCategories = [
        'Fire Emergency',
        'Medical Crisis',
        'Natural Disaster',
        'Security Incident',
        'Equipment Failure',
        'Communication Breakdown',
        'Leadership Challenge',
        'Team Coordination'
    ];

    // Form handlers
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNumberChange = (field, increment) => {
        setFormData(prev => {
            const currentValue = prev[field];
            let newValue;

            if (field === 'maxPlayers') {
                newValue = increment ? currentValue + 1 : currentValue - 1;
                newValue = Math.max(1, Math.min(100, newValue));
            } else if (field === 'duration') {
                const step = increment ? 5 : -5;
                newValue = currentValue + step;
                newValue = Math.max(5, Math.min(480, newValue));
            }

            return { ...prev, [field]: newValue };
        });

        // Clear any existing error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleTagAdd = () => {
        const trimmedTag = currentTag.trim();
        if (trimmedTag && !formData.tags.includes(trimmedTag)) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, trimmedTag]
            }));
            setCurrentTag('');
        }
    };

    const handleTagRemove = (tagToRemove) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(tag => tag !== tagToRemove)
        }));
    };

    const handleCategoryToggle = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: prev.categories.includes(category)
                ? prev.categories.filter(cat => cat !== category)
                : [...prev.categories, category]
        }));
    };

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Session name is required';
        } else if (formData.name.trim().length < 3) {
            newErrors.name = 'Session name must be at least 3 characters';
        }

        if (formData.maxPlayers < 1 || formData.maxPlayers > 100) {
            newErrors.maxPlayers = 'Max players must be between 1 and 100';
        }

        if (formData.duration < 5 || formData.duration > 480) {
            newErrors.duration = 'Duration must be between 5 and 480 minutes';
        }

        if (formData.isScheduled) {
            if (!formData.startDate) {
                newErrors.startDate = 'Start date is required for scheduled sessions';
            } else {
                const startDate = new Date(formData.startDate);
                const today = new Date();
                today.setHours(0, 0, 0, 0);

                if (startDate < today) {
                    newErrors.startDate = 'Start date cannot be in the past';
                }
            }

            if (!formData.startTime) {
                newErrors.startTime = 'Start time is required for scheduled sessions';
            }

            // Validate end date if provided
            if (formData.endDate && formData.startDate) {
                const startDate = new Date(formData.startDate);
                const endDate = new Date(formData.endDate);

                if (endDate < startDate) {
                    newErrors.endDate = 'End date cannot be before start date';
                }
            }

            // Validate end time if both start and end dates are the same
            if (formData.endTime && formData.startTime &&
                formData.endDate === formData.startDate) {
                const startTime = formData.startTime;
                const endTime = formData.endTime;

                if (endTime <= startTime) {
                    newErrors.endTime = 'End time must be after start time';
                }
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Submit handler
    const handleSubmit = async () => {
        if (!validateForm()) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
            if (errorElement) {
                errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                errorElement.focus();
            }
            return;
        }

        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            console.log('Creating session:', formData);
            setShowSuccess(true);

            // Reset form after success
            setTimeout(() => {
                setShowSuccess(false);
                // Reset form data
                setFormData({
                    name: '',
                    description: '',
                    gameMode: 'Team Challenge',
                    difficulty: 'Medium',
                    maxPlayers: 12,
                    duration: 60,
                    startDate: '',
                    startTime: '',
                    endDate: '',
                    endTime: '',
                    isScheduled: true,
                    tags: [],
                    allowLateJoin: true,
                    autoStart: false,
                    enableChat: true,
                    recordSession: true,
                    categories: []
                });
            }, 3000);

        } catch (error) {
            console.error('Error creating session:', error);
            setErrors({ submit: 'Failed to create session. Please try again.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
            // In real app, navigate back or reset form
            window.history.back();
        }
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => window.history.back()}
                        className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                        aria-label="Go back"
                    >
                        <ArrowLeft size={20} className="text-gray-600" />
                    </button>
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold">Create Game Session</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Set up a new crisis card game session</p>
                    </div>
                </div>
            </div>

            {/* Success Message */}
            {showSuccess && (
                <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-800">Session Created Successfully!</h3>
                            <p className="text-green-700 text-sm">Your game session has been created and is ready to use.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* General Error Message */}
            {errors.submit && (
                <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
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

            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-6">
                {/* Basic Information */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                            <Info size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Basic Information</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Session Name */}
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
                                placeholder="Enter session name..."
                                className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                    errors.name ? 'border-red-500' : 'border-black'
                                }`}
                                maxLength={100}
                                required
                            />
                            {errors.name && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.name}
                                </p>
                            )}
                        </div>

                        {/* Game Mode */}
                        <div>
                            <label htmlFor="gameMode" className="block font-medium text-gray-700 mb-2">
                                Game Mode
                            </label>
                            <select
                                id="gameMode"
                                name="gameMode"
                                value={formData.gameMode}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                {gameModes.map(mode => (
                                    <option key={mode} value={mode}>{mode}</option>
                                ))}
                            </select>
                        </div>

                        {/* Description */}
                        <div className="lg:col-span-2">
                            <label htmlFor="description" className="block font-medium text-gray-700 mb-2">
                                Description
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                placeholder="Describe the session objectives and context..."
                                rows={3}
                                maxLength={500}
                                className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.description.length}/500 characters
                            </p>
                        </div>
                    </div>
                </div>

                {/* Session Configuration */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                            <Settings size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Session Configuration</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Difficulty */}
                        <div>
                            <label htmlFor="difficulty" className="block font-medium text-gray-700 mb-2">
                                Difficulty Level
                            </label>
                            <select
                                id="difficulty"
                                name="difficulty"
                                value={formData.difficulty}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                            >
                                {difficultyLevels.map(level => (
                                    <option key={level} value={level}>{level}</option>
                                ))}
                            </select>
                        </div>

                        {/* Max Players */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Max Players
                            </label>
                            <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <button
                                    type="button"
                                    onClick={() => handleNumberChange('maxPlayers', false)}
                                    className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                                    disabled={formData.maxPlayers <= 1}
                                    aria-label="Decrease max players"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    name="maxPlayers"
                                    value={formData.maxPlayers}
                                    onChange={handleInputChange}
                                    min="1"
                                    max="100"
                                    className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                                    aria-label="Max players"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleNumberChange('maxPlayers', true)}
                                    className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50"
                                    disabled={formData.maxPlayers >= 100}
                                    aria-label="Increase max players"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {errors.maxPlayers && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.maxPlayers}
                                </p>
                            )}
                        </div>

                        {/* Duration */}
                        <div>
                            <label className="block font-medium text-gray-700 mb-2">
                                Duration (minutes)
                            </label>
                            <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                                <button
                                    type="button"
                                    onClick={() => handleNumberChange('duration', false)}
                                    className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg disabled:opacity-50"
                                    disabled={formData.duration <= 5}
                                    aria-label="Decrease duration"
                                >
                                    <Minus size={20} />
                                </button>
                                <input
                                    type="number"
                                    name="duration"
                                    value={formData.duration}
                                    onChange={handleInputChange}
                                    min="5"
                                    max="480"
                                    step="5"
                                    className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                                    aria-label="Duration in minutes"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleNumberChange('duration', true)}
                                    className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg disabled:opacity-50"
                                    disabled={formData.duration >= 480}
                                    aria-label="Increase duration"
                                >
                                    <Plus size={20} />
                                </button>
                            </div>
                            {errors.duration && (
                                <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                    <AlertCircle size={16} />
                                    {errors.duration}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Scheduling */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <Calendar size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Scheduling</h2>
                    </div>

                    <div className="mb-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="isScheduled"
                                checked={formData.isScheduled}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                            <span className="font-medium text-gray-700">Schedule this session</span>
                        </label>
                    </div>

                    {formData.isScheduled && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {/* Start Date */}
                            <div>
                                <label htmlFor="startDate" className="block font-medium text-gray-700 mb-2">
                                    Start Date *
                                </label>
                                <input
                                    id="startDate"
                                    type="date"
                                    name="startDate"
                                    value={formData.startDate}
                                    onChange={handleInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                                        errors.startDate ? 'border-red-500' : 'border-black'
                                    }`}
                                    required={formData.isScheduled}
                                />
                                {errors.startDate && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.startDate}
                                    </p>
                                )}
                            </div>

                            {/* Start Time */}
                            <div>
                                <label htmlFor="startTime" className="block font-medium text-gray-700 mb-2">
                                    Start Time *
                                </label>
                                <input
                                    id="startTime"
                                    type="time"
                                    name="startTime"
                                    value={formData.startTime}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                                        errors.startTime ? 'border-red-500' : 'border-black'
                                    }`}
                                    required={formData.isScheduled}
                                />
                                {errors.startTime && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.startTime}
                                    </p>
                                )}
                            </div>

                            {/* End Date */}
                            <div>
                                <label htmlFor="endDate" className="block font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    id="endDate"
                                    type="date"
                                    name="endDate"
                                    value={formData.endDate}
                                    onChange={handleInputChange}
                                    min={formData.startDate || new Date().toISOString().split('T')[0]}
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                                        errors.endDate ? 'border-red-500' : 'border-black'
                                    }`}
                                />
                                {errors.endDate && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.endDate}
                                    </p>
                                )}
                            </div>

                            {/* End Time */}
                            <div>
                                <label htmlFor="endTime" className="block font-medium text-gray-700 mb-2">
                                    End Time
                                </label>
                                <input
                                    id="endTime"
                                    type="time"
                                    name="endTime"
                                    value={formData.endTime}
                                    onChange={handleInputChange}
                                    className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium ${
                                        errors.endTime ? 'border-red-500' : 'border-black'
                                    }`}
                                />
                                {errors.endTime && (
                                    <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                                        <AlertCircle size={16} />
                                        {errors.endTime}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Crisis Categories */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-orange-500 border-2 border-black rounded-lg">
                            <Target size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Crisis Categories</h2>
                    </div>

                    <p className="text-gray-600 mb-4">Select the types of crisis scenarios to include in this session</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                        {availableCategories.map(category => (
                            <label key={category} className="flex items-center gap-3 p-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                                <input
                                    type="checkbox"
                                    checked={formData.categories.includes(category)}
                                    onChange={() => handleCategoryToggle(category)}
                                    className="w-4 h-4 text-blue-600 border-2 border-gray-400 rounded"
                                />
                                <span className="text-sm font-medium text-gray-700">{category}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Tags */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-cyan-500 border-2 border-black rounded-lg">
                            <Target size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Tags</h2>
                    </div>

                    <div className="mb-4">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleTagAdd();
                                    }
                                }}
                                placeholder="Add a tag..."
                                maxLength={50}
                                className="flex-1 px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={handleTagAdd}
                                disabled={!currentTag.trim()}
                                className="px-4 py-3 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:bg-blue-400 disabled:border-blue-400"
                            >
                                Add
                            </button>
                        </div>
                    </div>

                    {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {formData.tags.map(tag => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium border-2 border-blue-300"
                                >
                                    {tag}
                                    <button
                                        type="button"
                                        onClick={() => handleTagRemove(tag)}
                                        className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                                        aria-label={`Remove ${tag} tag`}
                                    >
                                        <X size={14} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Session Options */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gray-500 border-2 border-black rounded-lg">
                            <Settings size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Session Options</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="allowLateJoin"
                                checked={formData.allowLateJoin}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                            <div>
                                <span className="font-medium text-gray-700">Allow Late Join</span>
                                <p className="text-sm text-gray-500">Players can join after the session has started</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="autoStart"
                                checked={formData.autoStart}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                            <div>
                                <span className="font-medium text-gray-700">Auto Start</span>
                                <p className="text-sm text-gray-500">Automatically start when minimum players join</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="enableChat"
                                checked={formData.enableChat}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                            <div>
                                <span className="font-medium text-gray-700">Enable Chat</span>
                                <p className="text-sm text-gray-500">Allow players to communicate during the session</p>
                            </div>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                name="recordSession"
                                checked={formData.recordSession}
                                onChange={handleInputChange}
                                className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            />
                            <div>
                                <span className="font-medium text-gray-700">Record Session</span>
                                <p className="text-sm text-gray-500">Save session data for later review and analysis</p>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-end">
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={isSubmitting}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-gray-400 text-white font-bold border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:bg-gray-300 disabled:border-gray-400 text-sm sm:text-base"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 sm:px-6 sm:py-3 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:bg-blue-400 disabled:border-blue-400 text-sm sm:text-base flex items-center justify-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span className="hidden sm:inline">Creating Session...</span>
                                <span className="sm:hidden">Creating...</span>
                            </>
                        ) : (
                            <>
                                <Save size={16} className="sm:w-5 sm:h-5" />
                                <span className="hidden sm:inline">Create Session</span>
                                <span className="sm:hidden">Create</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateGameSession;
