"use client"
import React, { useState, useEffect } from 'react';
import {
    Play,
    Pause,
    Square,
    Users,
    Clock,
    MessageCircle,
    Settings,
    Eye,
    EyeOff,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
    Target,
    Trophy,
    AlertCircle,
    CheckCircle,
    Timer,
    Activity,
    BarChart3,
    Zap,
    Shield,
    Heart,
    Flame,
    ArrowLeft
} from 'lucide-react';

const ActiveSessionMonitor = () => {
    const [sessionData, setSessionData] = useState({
        id: 1,
        name: "Crisis Management Training #1",
        status: "Active",
        players: [
            { id: 1, name: "Sarah Johnson", role: "Team Leader", status: "active", score: 245, cardsCompleted: 12 },
            { id: 2, name: "Mike Wilson", role: "Communications", status: "active", score: 189, cardsCompleted: 8 },
            { id: 3, name: "Lisa Chen", role: "Medic", status: "active", score: 267, cardsCompleted: 15 },
            { id: 4, name: "John Davis", role: "Coordinator", status: "idle", score: 156, cardsCompleted: 6 },
            { id: 5, name: "Emma Brown", role: "Support", status: "active", score: 198, cardsCompleted: 9 },
            { id: 6, name: "Alex Thompson", role: "Security", status: "active", score: 223, cardsCompleted: 11 }
        ],
        maxPlayers: 12,
        gameMode: "Team Challenge",
        difficulty: "Medium",
        currentCard: {
            id: 23,
            title: "Medical Emergency in Building B",
            category: "Medical Crisis",
            difficulty: "Medium",
            timeLimit: 180,
            timeRemaining: 127
        },
        totalCards: 50,
        completedCards: 22,
        startTime: "2024-03-15 14:30",
        elapsedTime: 45 * 60 + 30, // 45 minutes 30 seconds
        estimatedEndTime: "2024-03-15 15:15"
    });

    const [chatMessages, setChatMessages] = useState([
        { id: 1, player: "Sarah Johnson", message: "Medical team needs backup in sector 3", timestamp: "14:45", type: "urgent" },
        { id: 2, player: "Mike Wilson", message: "Communications with HQ restored", timestamp: "14:47", type: "info" },
        { id: 3, player: "Lisa Chen", message: "Patient stabilized, ready for transport", timestamp: "14:48", type: "success" },
        { id: 4, player: "System", message: "New scenario card activated", timestamp: "14:49", type: "system" }
    ]);

    const [newMessage, setNewMessage] = useState('');
    const [isObserving, setIsObserving] = useState(true);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showPlayerDetails, setShowPlayerDetails] = useState(false);

    // Timer effect
    useEffect(() => {
        const timer = setInterval(() => {
            setSessionData(prev => ({
                ...prev,
                elapsedTime: prev.elapsedTime + 1,
                currentCard: {
                    ...prev.currentCard,
                    timeRemaining: Math.max(0, prev.currentCard.timeRemaining - 1)
                }
            }));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const getPlayerStatusColor = (status) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800 border-green-300';
            case 'idle': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'disconnected': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getChatMessageType = (type) => {
        switch (type) {
            case 'urgent': return 'border-l-4 border-red-500 bg-red-50';
            case 'success': return 'border-l-4 border-green-500 bg-green-50';
            case 'info': return 'border-l-4 border-blue-500 bg-blue-50';
            case 'system': return 'border-l-4 border-gray-500 bg-gray-50';
            default: return 'border-l-4 border-gray-300 bg-white';
        }
    };

    const handleSessionControl = (action) => {
        setSessionData(prev => ({
            ...prev,
            status: action === 'pause' ? 'Paused' : action === 'stop' ? 'Completed' : 'Active'
        }));
    };

    const sendMessage = () => {
        if (newMessage.trim()) {
            const message = {
                id: chatMessages.length + 1,
                player: "Admin",
                message: newMessage,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                type: "admin"
            };
            setChatMessages(prev => [...prev, message]);
            setNewMessage('');
        }
    };

    const getScenarioIcon = (category) => {
        switch (category) {
            case 'Medical Crisis': return <Heart size={16} className="text-red-500" />;
            case 'Fire Emergency': return <Flame size={16} className="text-orange-500" />;
            case 'Security Incident': return <Shield size={16} className="text-blue-500" />;
            default: return <AlertCircle size={16} className="text-gray-500" />;
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
                        <h1 className="text-xl sm:text-2xl font-bold">Active Session Monitor</h1>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">{sessionData.name}</p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    <button
                        onClick={() => setIsObserving(!isObserving)}
                        className={`px-3 py-2 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm ${isObserving ? 'bg-green-500 text-white border-green-600' : 'bg-gray-400 text-white border-gray-500'
                            }`}
                        title="Toggle observation mode"
                    >
                        {isObserving ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>

                    <button
                        onClick={() => setAudioEnabled(!audioEnabled)}
                        className={`px-3 py-2 font-bold border-2 rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm ${audioEnabled ? 'bg-blue-500 text-white border-blue-600' : 'bg-gray-400 text-white border-gray-500'
                            }`}
                        title="Toggle audio"
                    >
                        {audioEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>

                    {sessionData.status === 'Active' && (
                        <button
                            onClick={() => handleSessionControl('pause')}
                            className="px-3 py-2 bg-orange-500 text-white font-bold border-2 border-orange-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(249,115,22,1)] hover:shadow-[1px_1px_0px_0px_rgba(249,115,22,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm"
                            title="Pause Session"
                        >
                            <Pause size={16} />
                        </button>
                    )}

                    <button
                        onClick={() => handleSessionControl('stop')}
                        className="px-3 py-2 bg-red-500 text-white font-bold border-2 border-red-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] hover:shadow-[1px_1px_0px_0px_rgba(239,68,68,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm"
                        title="End Session"
                    >
                        <Square size={16} />
                    </button>
                </div>
            </div>

            {/* Status Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <Activity size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessionData.status}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Session Status</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                            <Users size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessionData.players.length}/{sessionData.maxPlayers}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Players</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-purple-500 border-2 border-black rounded-lg">
                            <Timer size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{formatTime(sessionData.elapsedTime)}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Elapsed Time</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-2 bg-yellow-500 border-2 border-black rounded-lg">
                            <Target size={20} className="text-white" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-lg sm:text-2xl font-bold">{sessionData.completedCards}/{sessionData.totalCards}</p>
                            <p className="text-gray-600 text-xs sm:text-sm font-medium">Cards</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Current Scenario */}
                <div className="lg:col-span-2">
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-red-500 border-2 border-black rounded-lg">
                                <Zap size={20} className="text-white" />
                            </div>
                            <h2 className="text-lg sm:text-xl font-bold">Current Scenario</h2>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    {getScenarioIcon(sessionData.currentCard.category)}
                                    <h3 className="font-bold text-lg">{sessionData.currentCard.title}</h3>
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mb-4">
                                    <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs font-medium border border-orange-300">
                                        {sessionData.currentCard.category}
                                    </span>
                                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium border border-blue-300">
                                        {sessionData.currentCard.difficulty}
                                    </span>
                                </div>
                            </div>

                            <div className="text-center">
                                <div className={`text-3xl font-bold mb-1 ${sessionData.currentCard.timeRemaining < 30 ? 'text-red-600' : 'text-blue-600'}`}>
                                    {formatTime(sessionData.currentCard.timeRemaining)}
                                </div>
                                <p className="text-sm text-gray-600">Time Remaining</p>
                                <div className="w-20 bg-gray-200 rounded-full h-2 mt-2">
                                    <div
                                        className={`h-2 rounded-full transition-all duration-300 ${sessionData.currentCard.timeRemaining < 30 ? 'bg-red-500' : 'bg-blue-500'
                                            }`}
                                        style={{ width: `${(sessionData.currentCard.timeRemaining / sessionData.currentCard.timeLimit) * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Players */}
                    <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500 border-2 border-black rounded-lg">
                                    <Users size={20} className="text-white" />
                                </div>
                                <h2 className="text-lg sm:text-xl font-bold">Active Players</h2>
                            </div>
                            <button
                                onClick={() => setShowPlayerDetails(!showPlayerDetails)}
                                className="px-3 py-2 bg-gray-400 text-white font-medium border-2 border-gray-500 rounded-lg shadow-[2px_2px_0px_0px_rgba(107,114,128,1)] hover:shadow-[1px_1px_0px_0px_rgba(107,114,128,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 text-sm"
                            >
                                <BarChart3 size={16} />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {sessionData.players.map(player => (
                                <div key={player.id} className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                    <div className="w-10 h-10 bg-blue-100 border-2 border-blue-300 rounded-full flex items-center justify-center text-blue-800 font-bold text-sm">
                                        {player.name.split(' ').map(n => n[0]).join('')}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-gray-900 truncate">{player.name}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPlayerStatusColor(player.status)}`}>
                                                {player.status}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{player.role}</p>
                                    </div>

                                    {showPlayerDetails && (
                                        <div className="text-right">
                                            <div className="text-sm font-medium text-gray-900">{player.score} pts</div>
                                            <div className="text-xs text-gray-600">{player.cardsCompleted} cards</div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chat Panel */}
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-green-500 border-2 border-black rounded-lg">
                            <MessageCircle size={20} className="text-white" />
                        </div>
                        <h2 className="text-lg sm:text-xl font-bold">Live Chat</h2>
                    </div>p

                    <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                        {chatMessages.map(msg => (
                            <div key={msg.id} className={`p-3 rounded-lg ${getChatMessageType(msg.type)}`}>
                                <div className="flex justify-between items-start mb-1">
                                    <span className="font-medium text-sm">{msg.player}</span>
                                    <span className="text-xs text-gray-500">{msg.timestamp}</span>
                                </div>
                                <p className="text-sm">{msg.message}</p>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    sendMessage();
                                }
                            }}
                            placeholder="Send message to players..."
                            className="flex-1 px-3 py-2 border-2 border-black rounded-lg shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!newMessage.trim()}
                            className="px-4 py-2 bg-blue-500 text-white font-bold border-2 border-blue-600 rounded-lg shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-[1px_1px_0px_0px_rgba(37,99,235,1)] hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-200 disabled:bg-blue-400 disabled:border-blue-400 text-sm"
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActiveSessionMonitor;
