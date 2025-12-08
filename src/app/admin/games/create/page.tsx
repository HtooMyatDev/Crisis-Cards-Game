"use client"
import React, { useEffect, useState } from 'react';
import {
    Save,
    X,
    Users,
    Target,
    Info,
    AlertCircle,
    ArrowLeft,
    RefreshCw,
    FileText,
    Layers,
    Shuffle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, GameFormData, GameMode, CreatedGame } from '@/types/game';
import { generateGameCode } from '@/utils/gameCode';
import { GameSuccessModal } from '@/components/admin/GameSuccessModal';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const CreateGameSession = () => {
    const [formData, setFormData] = useState<GameFormData>({
        name: '',
        categoryIds: [],
        gameCode: '',
        autoGenerateCode: true,
        gameMode: 'Standard'
    });

    const [categories, setCategories] = useState<Category[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [generatedGameCode, setGeneratedGameCode] = useState('');
    const [createdGame, setCreatedGame] = useState<CreatedGame | null>(null);

    // Shuffling State
    const [availableCards, setAvailableCards] = useState<{ id: number; title: string }[]>([]);
    const [shuffledCards, setShuffledCards] = useState<{ id: number; title: string }[]>([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [globalError, setGlobalError] = useState<string | null>(null);

    const gameModes: GameMode[] = ['Standard', 'Quick Play', 'Advanced', 'Custom'];

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                // Fetch categories WITH cards
                const res = await fetch('/api/admin/categories?includeCards=true');
                const data = await res.json();
                if (data.success && Array.isArray(data.categories)) {
                    setCategories(data.categories)
                } else {
                    throw new Error(data.error || 'Failed to fetch categories');
                }
            }
            catch (error) {
                console.error('Failed to fetch categories', error);
                setGlobalError('Failed to load categories. Please refresh the page.');
            }
        };
        fetchCategories();
    }, [])

    // Generate initial game code if auto-generate is enabled
    useEffect(() => {
        if (formData.autoGenerateCode && !formData.gameCode) {
            const newCode = generateGameCode();
            setGeneratedGameCode(newCode);
            setFormData(prev => ({ ...prev, gameCode: newCode }));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only run on mount


    // Update available cards when categories change
    useEffect(() => {
        const selectedCategories = categories.filter(c => formData.categoryIds.includes(c.id.toString()));
        const cards = selectedCategories.flatMap(c => c.cards || []);
        setAvailableCards(cards);

        // Initial shuffle (or just set order) when cards change
        // We only reset if the *count* changes significantly or it's the first load
        // to avoid re-shuffling constantly if we were to add more complex logic.
        // For now, let's just set them as is, user must click shuffle to randomize.
        if (shuffledCards.length === 0 || shuffledCards.length !== cards.length) {
            setShuffledCards(cards);
        }
    }, [formData.categoryIds, categories, shuffledCards.length]);


    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;

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

    const handleCategoryToggle = (categoryId: string) => {
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

    const handleShuffleCards = () => {
        if (availableCards.length === 0) return;

        setIsShuffling(true);

        // Simulate a more complex shuffle animation sequence
        let shuffleCount = 0;
        const maxShuffles = 5;
        const interval = setInterval(() => {
            const tempShuffled = [...availableCards];
            for (let i = tempShuffled.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [tempShuffled[i], tempShuffled[j]] = [tempShuffled[j], tempShuffled[i]];
            }
            setShuffledCards(tempShuffled);
            shuffleCount++;

            if (shuffleCount >= maxShuffles) {
                clearInterval(interval);
                setIsShuffling(false);
            }
        }, 150);
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

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
        } else if (formData.autoGenerateCode && !formData.gameCode.trim()) {
            newErrors.gameCode = 'Please generate a game code or enter one manually';
        }



        if (formData.categoryIds.length > 0 && availableCards.length === 0) {
            newErrors.categoryIds = 'Selected categories do not contain any cards. Please select different categories.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const errorContainerRef = React.useRef<HTMLDivElement>(null);

    const handleSubmit = async () => {
        if (!validateForm()) {
            setGlobalError('Please fix the errors in the form.');
            // Scroll to error container
            if (errorContainerRef.current) {
                errorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            return;
        }

        setIsSubmitting(true);
        setGlobalError(null);

        try {
            const formattedData = {
                name: formData.name,
                gameCode: formData.gameCode,
                categoryIds: formData.categoryIds.map(id => parseInt(id)),
                gameMode: formData.gameMode,
                shuffledCardIds: shuffledCards.map(c => c.id) // Send shuffled order
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
                throw new Error(errorData.message || errorData.error || 'Failed to create a game session')
            }

            const result = await response.json();
            console.log('Game session created successfully:', result);
            setCreatedGame({
                name: formData.name,
                gameCode: formData.gameCode,
                id: result.data.id
            });
            setShowSuccess(true);

        } catch (error: unknown) {
            console.error('Error creating session:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create game session. Please try again.';
            setGlobalError(errorMessage);
            setErrors({ submit: 'Failed to create game session.' });
            // Scroll to error container on API error too
            if (errorContainerRef.current) {
                errorContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-6">
            {/* Success Modal */}
            <GameSuccessModal
                isOpen={showSuccess}
                game={createdGame}
                onStartHosting={(gameId) => window.location.href = `/admin/games/${gameId}/host`}
            />


            <div className="max-w-3xl mx-auto">
                <ErrorBoundary>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => window.history.back()}
                                className="p-2 hover:bg-white/50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
                                aria-label="Go back"
                            >
                                <ArrowLeft size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Create Game Session</h1>
                                <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm sm:text-base">Start a new crisis card game</p>
                            </div>
                        </div>
                    </div>

                    {/* Global Error Display */}
                    {globalError && (
                        <div ref={errorContainerRef} className="mb-6 bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 dark:border-red-600 p-4 rounded-r-lg shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" size={20} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-red-800 dark:text-red-300">Something went wrong</h3>
                                    <p className="text-red-700 dark:text-red-400 text-sm mt-1">{globalError}</p>
                                </div>
                                <button
                                    onClick={() => setGlobalError(null)}
                                    className="text-red-400 hover:text-red-600 transition-colors"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Session Name */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-indigo-500 border-2 border-black rounded-lg">
                                    <FileText size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-black dark:text-white">Session Details</h2>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Session Name *
                                    </label>
                                    <input
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Team Building Session, Monday Game..."
                                        className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium bg-white dark:bg-gray-800 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400 ${errors.name ? 'border-red-500 dark:border-red-600' : 'border-black dark:border-gray-700'
                                            }`}
                                    />
                                    {errors.name && (
                                        <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.name}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Choose a memorable name to identify this game session
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="gameMode" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Game Mode
                                    </label>
                                    <select
                                        id="gameMode"
                                        name="gameMode"
                                        value={formData.gameMode}
                                        onChange={handleInputChange}
                                        className={`w-full pl-3 pr-10 py-3 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] appearance-none bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-black dark:text-white ${errors.gameMode ? 'border-red-500 dark:border-red-600' : 'border-black dark:border-gray-700'
                                            }`}
                                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                                    >
                                        {gameModes.map(mode => (
                                            <option key={mode} value={mode}>
                                                {mode}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.gameMode && (
                                        <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                                            <AlertCircle size={16} />
                                            {errors.gameMode}
                                        </p>
                                    )}
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                        Select the gameplay style for this session
                                    </p>
                                </div>


                            </div>
                        </div>

                        {/* Crisis Category */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                                    <Target size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-black dark:text-white">Crisis Categories</h2>
                            </div>

                            <div>
                                <label className="block font-medium text-gray-700 dark:text-gray-300 mb-3">
                                    Select Categories * (You can select multiple)
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {categories.map(category => {
                                        const isSelected = formData.categoryIds.includes(category.id.toString());
                                        return (
                                            <button
                                                key={category.id}
                                                type="button"
                                                onClick={() => handleCategoryToggle(category.id.toString())}
                                                className={`
                                                relative p-3 rounded-lg text-left transition-all duration-300 group flex items-center gap-3 overflow-hidden border-2
                                                ${isSelected
                                                        ? 'translate-x-[-1px] translate-y-[-1px]'
                                                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                                    }
                                            `}
                                                style={isSelected ? {
                                                    backgroundColor: '#0f172a',
                                                    borderColor: category.color,
                                                    boxShadow: `2px 2px 0px 0px ${category.color}`
                                                } : undefined}
                                            >
                                                {/* Subtle Background Gradient (Selected Only) */}
                                                {isSelected && (
                                                    <div
                                                        className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                                                        style={{
                                                            background: `radial-gradient(circle at 50% 50%, ${category.color}20, transparent 70%)`
                                                        }}
                                                    />
                                                )}

                                                {/* Checkbox/Icon Container */}
                                                <div
                                                    className={`relative z-10 w-10 h-10 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300`}
                                                    style={{
                                                        backgroundColor: isSelected ? category.color : '#f3f4f6',
                                                        borderColor: isSelected ? category.color : '#e5e7eb'
                                                    }}
                                                >
                                                    <AnimatePresence mode="wait">
                                                        {isSelected && (
                                                            <motion.div
                                                                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                                                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                                                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                                                                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                                            >
                                                                <svg
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    fill="none"
                                                                    stroke="white"
                                                                    strokeWidth="3"
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                >
                                                                    <polyline points="20 6 9 17 4 12"></polyline>
                                                                </svg>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </div>

                                                {/* Text Content */}
                                                <div className="flex-1 relative z-10">
                                                    <h3
                                                        className={`font-bold text-base leading-tight mb-0.5 transition-colors duration-300 ${isSelected ? 'text-white' : 'text-gray-900 dark:text-white'}`}
                                                    >
                                                        {category.name}
                                                    </h3>
                                                    <p
                                                        className={`text-xs font-medium transition-colors duration-300 ${isSelected ? 'text-gray-400' : 'text-gray-500 dark:text-gray-400'}`}
                                                    >
                                                        {category.cards?.length || 0} Cards
                                                    </p>
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
                            </div>
                        </div>

                        {/* Card Deck & Shuffling */}
                        {formData.categoryIds.length > 0 && (
                            <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500 border-2 border-black rounded-lg">
                                            <Layers size={20} className="text-white" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold text-black dark:text-white">Game Deck</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{shuffledCards.length} Cards Total</p>
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleShuffleCards}
                                        disabled={isShuffling || availableCards.length === 0}
                                        className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                        transition-all duration-200
                                        ${isShuffling
                                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed translate-x-[1px] translate-y-[1px] shadow-none'
                                                : 'bg-yellow-400 hover:bg-yellow-500 hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                                            }
                                    `}
                                    >
                                        <Shuffle size={18} className={isShuffling ? 'animate-spin' : ''} />
                                        {isShuffling ? 'Shuffling...' : 'Shuffle Deck'}
                                    </button>
                                </div>

                                <div className="relative h-48 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center overflow-hidden p-4">
                                    <div className="flex gap-3 px-4 overflow-x-auto w-full no-scrollbar items-center h-full">
                                        <AnimatePresence mode='popLayout'>
                                            {shuffledCards.slice(0, 10).map((card) => (
                                                <motion.div
                                                    layout
                                                    key={card.id}
                                                    initial={{ opacity: 0, scale: 0.8, y: 15 }}
                                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                                    exit={{ opacity: 0, scale: 0.8, y: -15 }}
                                                    transition={{
                                                        type: "spring",
                                                        stiffness: 300,
                                                        damping: 25,
                                                        layout: { duration: 0.3 }
                                                    }}
                                                    className="flex-shrink-0 w-20 h-24 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] flex items-center justify-center p-2 cursor-help group relative"
                                                    title={card.title}
                                                >
                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full border border-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <div className="text-[9px] text-center font-bold line-clamp-4 leading-tight text-black dark:text-white">
                                                        {card.title}
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </AnimatePresence>

                                        {shuffledCards.length > 10 && (
                                            <motion.div
                                                layout
                                                className="flex-shrink-0 w-20 h-24 bg-gray-100 dark:bg-gray-700 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center"
                                            >
                                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500">+{shuffledCards.length - 10}</span>
                                            </motion.div>
                                        )}

                                        {shuffledCards.length === 0 && (
                                            <div className="w-full text-center">
                                                <span className="text-gray-400 dark:text-gray-500 font-medium">No cards available in selected categories</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-500 mt-3">
                                    Cards will appear in this order during the game. Shuffle to randomize.
                                </p>
                            </div>
                        )}

                        {/* Game Code */}
                        <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                                    <Users size={20} className="text-white" />
                                </div>
                                <h2 className="text-xl font-bold text-black dark:text-white">Game Code</h2>
                            </div>

                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                    <input
                                        type="checkbox"
                                        name="autoGenerateCode"
                                        checked={formData.autoGenerateCode}
                                        onChange={handleInputChange}
                                        className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    />
                                    <div>
                                        <span className="font-medium text-gray-700 dark:text-gray-300">Auto-generate game code</span>
                                        <p className="text-sm text-gray-500">Automatically create a unique 6-character code</p>
                                    </div>
                                </label>

                                {formData.autoGenerateCode ? (
                                    <div>
                                        <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Generated Game Code
                                        </label>
                                        <div className="flex gap-2">
                                            <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 border-2 border-black dark:border-gray-700 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] font-mono text-2xl font-bold text-center text-gray-800 dark:text-gray-200 flex justify-center overflow-hidden">
                                                <div className="flex gap-1">
                                                    {(generatedGameCode || 'XXXXXX').split('').map((char, index) => (
                                                        <motion.span
                                                            key={`${generatedGameCode}-${index}`}
                                                            initial={{ y: -50, opacity: 0 }}
                                                            animate={{ y: 0, opacity: 1 }}
                                                            transition={{
                                                                type: "spring",
                                                                damping: 12,
                                                                stiffness: 200,
                                                                delay: index * 0.05
                                                            }}
                                                        >
                                                            {char}
                                                        </motion.span>
                                                    ))}
                                                </div>
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
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
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
                                            className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xl font-bold uppercase text-center bg-white dark:bg-gray-800 text-black dark:text-white ${errors.gameCode ? 'border-red-500 dark:border-red-600' : 'border-black dark:border-gray-700'
                                                }`}
                                        />
                                        {errors.gameCode && (
                                            <p className="text-red-600 dark:text-red-400 text-sm mt-2 flex items-center gap-1">
                                                <AlertCircle size={16} />
                                                {errors.gameCode}
                                            </p>
                                        )}
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                                            Players will use this code to join your game
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 rounded-lg p-4">
                            <div className="flex gap-3">
                                <Info size={20} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                                <div className="text-sm text-blue-800 dark:text-blue-300">
                                    <p className="font-medium mb-1">What happens next?</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Your game session will be created with status WAITING</li>
                                        <li>Share the game code with players so they can join</li>
                                        <li>You can assign players to teams from the view game option</li>
                                        <li>Once teams are assigned you can start the game</li>
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
                        {/* Bottom Error Summary */}
                        {(Object.keys(errors).length > 0 || globalError) && (
                            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center justify-center gap-2 text-red-600 dark:text-red-400 animate-pulse">
                                <AlertCircle size={16} />
                                <span className="font-medium">Please fix the errors above before continuing</span>
                            </div>
                        )}
                    </div>
                </ErrorBoundary>
            </div>
        </div>
    );
};

export default CreateGameSession;
