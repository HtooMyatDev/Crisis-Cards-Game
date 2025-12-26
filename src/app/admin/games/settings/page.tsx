"use client"
import React, { useState } from 'react';
import {
    Settings,
    Save,
    Users,
    MessageCircle,
    Eye,
    Gamepad2,
    Zap,
    Plus,
    Minus,
    AlertCircle,
    CheckCircle,
    ArrowLeft,
    HelpCircle,
    Lock,
    Unlock,
    RotateCcw
} from 'lucide-react';
import ConfirmationModal from '@/components/modals/ConfirmationModal';

const SessionSettings = () => {
    const [settings, setSettings] = useState({
        // General Settings
        sessionName: "Crisis Management Training #1",
        description: "Advanced crisis response training for emergency teams",
        maxPlayers: 12,
        isPrivate: false,
        password: "",

        // Game Settings
        gameMode: "Team Challenge",
        difficulty: "Medium",
        timeLimit: 180, // seconds per card
        totalCards: 50,
        randomizeCards: true,
        allowCardSkipping: false,

        // Player Settings
        allowLateJoin: true,
        allowPlayerKick: true,
        autoAssignRoles: true,
        requireRealNames: false,

        // Communication Settings
        enableChat: true,
        allowVoiceChat: false,
        enableEmojis: true,
        moderateChat: true,

        // Observation Settings
        allowObservers: true,
        maxObservers: 5,
        observerChat: false,

        // Recording & Analytics
        recordSession: true,
        savePlayerData: true,
        exportResults: true,
        generateReport: true,

        // Notifications
        notifyOnJoin: true,
        notifyOnLeave: true,
        soundAlerts: true,
        visualAlerts: true,

        // Scoring
        enableScoring: true,
        pointsPerCard: 10,
        timeBonus: true,
        teamScoring: true,

        // Advanced
        autoStart: false,
        autoEnd: true,
        backupInterval: 300, // seconds
        reconnectionTime: 60 // seconds
    });

    const [activeTab, setActiveTab] = useState('general');
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const [showSaveSuccess, setShowSaveSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Modal state
    const [confirmModal, setConfirmModal] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        type: 'danger' | 'warning' | 'info' | 'success';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        type: 'danger'
    });

    const closeConfirmModal = () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'gameplay', label: 'Gameplay', icon: Gamepad2 },
        { id: 'players', label: 'Players', icon: Users },
        { id: 'communication', label: 'Communication', icon: MessageCircle },
        { id: 'monitoring', label: 'Monitoring', icon: Eye },
        { id: 'advanced', label: 'Advanced', icon: Zap }
    ];

    const gameModes = ['Team Challenge', 'Solo Practice', 'Group Learning', 'Time Trial', 'Competitive Mode', 'Training Mode'];
    const difficultyLevels = ['Easy', 'Medium', 'Hard', 'Expert', 'Custom'];

    const handleInputChange = (field: string, value: string | number | boolean) => {
        setSettings(prev => ({
            ...prev,
            [field]: value
        }));
        setHasUnsavedChanges(true);

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleNumberChange = (field: string, increment: boolean, min: number = 1, max: number = 999, step: number = 1) => {
        setSettings(prev => {
            const currentValue = prev[field as keyof typeof prev] as number;
            const newValue = increment ? currentValue + step : currentValue - step;
            const clampedValue = Math.max(min, Math.min(max, newValue));

            return { ...prev, [field]: clampedValue };
        });
        setHasUnsavedChanges(true);
    };

    const validateSettings = () => {
        const newErrors: Record<string, string> = {};

        if (!settings.sessionName.trim()) {
            newErrors.sessionName = 'Session name is required';
        }

        if (settings.maxPlayers < 1 || settings.maxPlayers > 100) {
            newErrors.maxPlayers = 'Max players must be between 1 and 100';
        }

        if (settings.timeLimit < 30 || settings.timeLimit > 600) {
            newErrors.timeLimit = 'Time limit must be between 30 and 600 seconds';
        }

        if (settings.isPrivate && !settings.password.trim()) {
            newErrors.password = 'Password is required for private sessions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateSettings()) {
            return;
        }

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            setHasUnsavedChanges(false);
            setShowSaveSuccess(true);
            setTimeout(() => setShowSaveSuccess(false), 3000);

            console.log('Settings saved:', settings);
        } catch {
            setErrors({ submit: 'Failed to save settings. Please try again.' });
        }
    };

    const handleReset = () => {
        setConfirmModal({
            isOpen: true,
            title: 'Reset Settings',
            message: 'Are you sure you want to reset all settings to default values?',
            type: 'warning',
            onConfirm: () => {
                // Reset to defaults
                setSettings(prev => ({
                    ...prev,
                    maxPlayers: 12,
                    gameMode: "Team Challenge",
                    difficulty: "Medium",
                    timeLimit: 180,
                    totalCards: 50,
                    // ... reset other values
                }));
                setHasUnsavedChanges(true);
                closeConfirmModal();
            }
        });
    };

    const renderGeneralTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-2">
                        Session Name *
                    </label>
                    <input
                        type="text"
                        value={settings.sessionName}
                        onChange={(e) => handleInputChange('sessionName', e.target.value)}
                        className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.sessionName ? 'border-red-500' : 'border-black'
                            }`}
                        placeholder="Enter session name..."
                    />
                    {errors.sessionName && (
                        <p className="text-red-600 text-sm mt-1">{errors.sessionName}</p>
                    )}
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-2">
                        Max Players
                    </label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('maxPlayers', false, 1, 100)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.maxPlayers}
                            onChange={(e) => handleInputChange('maxPlayers', parseInt(e.target.value) || 1)}
                            min="1"
                            max="100"
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('maxPlayers', true, 1, 100)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <label className="block font-medium text-gray-700 mb-2">
                    Description
                </label>
                <textarea
                    value={settings.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Describe the session..."
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <label className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <input
                        type="checkbox"
                        checked={settings.isPrivate}
                        onChange={(e) => handleInputChange('isPrivate', e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    />
                    <div className="flex items-center gap-2">
                        {settings.isPrivate ? <Lock size={20} className="text-red-600" /> : <Unlock size={20} className="text-green-600" />}
                        <div>
                            <span className="font-medium text-gray-700">Private Session</span>
                            <p className="text-sm text-gray-500">Require password to join</p>
                        </div>
                    </div>
                </label>

                {settings.isPrivate && (
                    <div>
                        <label className="block font-medium text-gray-700 mb-2">
                            Session Password *
                        </label>
                        <input
                            type="password"
                            value={settings.password}
                            onChange={(e) => handleInputChange('password', e.target.value)}
                            className={`w-full px-4 py-3 border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-black'
                                }`}
                            placeholder="Enter password..."
                        />
                        {errors.password && (
                            <p className="text-red-600 text-sm mt-1">{errors.password}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );

    const renderGameplayTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-2">Game Mode</label>
                    <select
                        value={settings.gameMode}
                        onChange={(e) => handleInputChange('gameMode', e.target.value)}
                        className="w-full px-3 pr-10 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        {gameModes.map(mode => (
                            <option key={mode} value={mode}>{mode}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-2">Difficulty</label>
                    <select
                        value={settings.difficulty}
                        onChange={(e) => handleInputChange('difficulty', e.target.value)}
                        className="w-full px-3 pr-10 py-3 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] appearance-none bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
                    >
                        {difficultyLevels.map(level => (
                            <option key={level} value={level}>{level}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-2">Time Limit per Card (seconds)</label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('timeLimit', false, 30, 600, 30)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.timeLimit}
                            onChange={(e) => handleInputChange('timeLimit', parseInt(e.target.value) || 30)}
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('timeLimit', true, 30, 600, 30)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-2">Total Cards</label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('totalCards', false, 10, 200, 5)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.totalCards}
                            onChange={(e) => handleInputChange('totalCards', parseInt(e.target.value) || 10)}
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('totalCards', true, 10, 200, 5)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'randomizeCards', label: 'Randomize Cards', desc: 'Shuffle card order for each session' },
                    { key: 'allowCardSkipping', label: 'Allow Card Skipping', desc: 'Players can skip difficult scenarios' },
                    { key: 'autoStart', label: 'Auto Start', desc: 'Start automatically when enough players join' },
                    { key: 'autoEnd', label: 'Auto End', desc: 'End session when all cards completed' }
                ].map(option => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings[option.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleInputChange(option.key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div>
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderPlayersTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'allowLateJoin', label: 'Allow Late Join', desc: 'Players can join after session starts' },
                    { key: 'allowPlayerKick', label: 'Allow Player Kick', desc: 'Admins can remove disruptive players' },
                    { key: 'autoAssignRoles', label: 'Auto Assign Roles', desc: 'Automatically assign team roles' },
                    { key: 'requireRealNames', label: 'Require Real Names', desc: 'Players must use their real names' }
                ].map(option => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings[option.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleInputChange(option.key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div>
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderCommunicationTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'enableChat', label: 'Enable Text Chat', desc: 'Allow players to send text messages' },
                    { key: 'allowVoiceChat', label: 'Allow Voice Chat', desc: 'Enable voice communication (premium)' },
                    { key: 'enableEmojis', label: 'Enable Emojis', desc: 'Allow emoji reactions and responses' },
                    { key: 'moderateChat', label: 'Moderate Chat', desc: 'Filter inappropriate language' }
                ].map(option => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings[option.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleInputChange(option.key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div>
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderMonitoringTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-2">Max Observers</label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('maxObservers', false, 0, 20)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.maxObservers}
                            onChange={(e) => handleInputChange('maxObservers', parseInt(e.target.value) || 0)}
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('maxObservers', true, 0, 20)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'allowObservers', label: 'Allow Observers', desc: 'Non-playing users can watch sessions' },
                    { key: 'observerChat', label: 'Observer Chat', desc: 'Observers can chat with each other' },
                    { key: 'recordSession', label: 'Record Session', desc: 'Save session for later review' },
                    { key: 'savePlayerData', label: 'Save Player Data', desc: 'Store individual player statistics' },
                    { key: 'exportResults', label: 'Export Results', desc: 'Allow downloading session data' },
                    { key: 'generateReport', label: 'Generate Report', desc: 'Create performance analysis report' }
                ].map(option => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings[option.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleInputChange(option.key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div>
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderAdvancedTab = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <label className="block font-medium text-gray-700 mb-2">Backup Interval (seconds)</label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('backupInterval', false, 60, 3600, 60)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.backupInterval}
                            onChange={(e) => handleInputChange('backupInterval', parseInt(e.target.value) || 60)}
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('backupInterval', true, 60, 3600, 60)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block font-medium text-gray-700 mb-2">Reconnection Time (seconds)</label>
                    <div className="flex items-center border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <button
                            type="button"
                            onClick={() => handleNumberChange('reconnectionTime', false, 30, 300, 15)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-l-lg"
                        >
                            <Minus size={20} />
                        </button>
                        <input
                            type="number"
                            value={settings.reconnectionTime}
                            onChange={(e) => handleInputChange('reconnectionTime', parseInt(e.target.value) || 30)}
                            className="flex-1 py-3 px-2 text-center focus:outline-none font-medium"
                        />
                        <button
                            type="button"
                            onClick={() => handleNumberChange('reconnectionTime', true, 30, 300, 15)}
                            className="p-3 hover:bg-gray-100 transition-colors rounded-r-lg"
                        >
                            <Plus size={20} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                    { key: 'notifyOnJoin', label: 'Notify on Join', desc: 'Alert when players join session' },
                    { key: 'notifyOnLeave', label: 'Notify on Leave', desc: 'Alert when players leave session' },
                    { key: 'soundAlerts', label: 'Sound Alerts', desc: 'Play audio notifications' },
                    { key: 'visualAlerts', label: 'Visual Alerts', desc: 'Show popup notifications' },
                    { key: 'enableScoring', label: 'Enable Scoring', desc: 'Track and display player scores' },
                    { key: 'timeBonus', label: 'Time Bonus', desc: 'Award extra points for speed' },
                    { key: 'teamScoring', label: 'Team Scoring', desc: 'Calculate team-based scores' }
                ].map(option => (
                    <label key={option.key} className="flex items-center gap-3 cursor-pointer p-4 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                        <input
                            type="checkbox"
                            checked={settings[option.key as keyof typeof settings] as boolean}
                            onChange={(e) => handleInputChange(option.key, e.target.checked)}
                            className="w-5 h-5 text-blue-600 border-2 border-black rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        />
                        <div>
                            <span className="font-medium text-gray-700">{option.label}</span>
                            <p className="text-sm text-gray-500">{option.desc}</p>
                        </div>
                    </label>
                ))}
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'general': return renderGeneralTab();
            case 'gameplay': return renderGameplayTab();
            case 'players': return renderPlayersTab();
            case 'communication': return renderCommunicationTab();
            case 'monitoring': return renderMonitoringTab();
            case 'advanced': return renderAdvancedTab();
            default: return renderGeneralTab();
        }
    };

    return (
        <div className="p-4 sm:p-6">
            {/* Header */}
            <ConfirmationModal
                isOpen={confirmModal.isOpen}
                onClose={closeConfirmModal}
                onConfirm={confirmModal.onConfirm}
                title={confirmModal.title}
                message={confirmModal.message}
                type={confirmModal.type}
            />

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
                        <h1 className="text-xl sm:text-2xl font-bold">Session Settings</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Configure session parameters and options</p>
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 bg-gray-400 text-white font-bold border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm flex items-center gap-2"
                    >
                        <RotateCcw size={16} />
                        <span className="hidden sm:inline">Reset</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={!hasUnsavedChanges}
                        className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:bg-blue-400 disabled:border-blue-400 text-sm flex items-center gap-2"
                    >
                        <Save size={16} />
                        <span className="hidden sm:inline">Save Settings</span>
                        <span className="sm:hidden">Save</span>
                    </button>
                </div>
            </div>

            {/* Success Message */}
            {showSaveSuccess && (
                <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <CheckCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-green-800">Settings Saved Successfully!</h3>
                            <p className="text-green-700 text-sm">All changes have been applied to the session.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Unsaved Changes Warning */}
            {hasUnsavedChanges && (
                <div className="mb-6 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-500 border-2 border-black rounded-lg">
                            <AlertCircle size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-yellow-800">Unsaved Changes</h3>
                            <p className="text-yellow-700 text-sm">You have unsaved changes. Don&apos;t forget to save before leaving.</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Tab Navigation */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                <div className="flex overflow-x-auto">
                    {tabs.map((tab, index) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-r-2 border-black last:border-r-0 ${activeTab === tab.id
                                    ? 'bg-blue-500 text-white'
                                    : 'hover:bg-gray-100 text-gray-700'
                                    }`}
                            >
                                <Icon size={16} />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                {renderTabContent()}
            </div>
        </div>
    );
};

export default SessionSettings;
