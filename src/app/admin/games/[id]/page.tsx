"use client"
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Users,
    Play,
    Clock,
    Gamepad2,
    CheckCircle,
    Wifi,
    WifiOff,
    AlertCircle,
    Hash,
    Calendar,
    Activity,
    Shuffle,
    QrCode,
    Copy,
    Check,
    Download,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import toast, { Toaster } from 'react-hot-toast';

import { GameSession } from '@/types/game';

// Simple hash function for comparing objects
const hashObject = (obj: unknown): string => {
    return JSON.stringify(obj, Object.keys(obj as object).sort());
};

const GameDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const gameId = params.id as string;

    const [game, setGame] = useState<GameSession | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Store the hash of the last fetched data to prevent unnecessary updates
    const lastDataHashRef = useRef<string>('');

    const fetchGameDetails = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/games/${gameId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch game details');
            }

            const data = await response.json();

            // Create a hash of the relevant data to detect changes
            const newDataHash = hashObject({
                status: data.game.status,
                currentCardIndex: data.game.currentCardIndex,
                players: data.game.players?.map((p: { id: number; nickname: string; score: number; isConnected: boolean }) => ({
                    id: p.id,
                    nickname: p.nickname,
                    score: p.score,
                    isConnected: p.isConnected
                }))
            });

            // Only update if data has actually changed
            if (lastDataHashRef.current !== newDataHash) {
                lastDataHashRef.current = newDataHash;
                setGame(data.game);
                setError('');
                setLoading(false);
            }
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Error:', error);
            setError(error.message);
            setLoading(false);
        }
    }, [gameId]); // Removed 'game' from dependencies to prevent re-creation

    useEffect(() => {
        setLoading(true); // Show loading only on initial mount
        fetchGameDetails();

        // Set up polling for real-time updates (every 2 seconds)
        const pollInterval = setInterval(() => {
            fetchGameDetails();
        }, 2000);

        // Cleanup interval on unmount
        return () => clearInterval(pollInterval);
    }, [fetchGameDetails]);

    const formatDuration = (start: string | number | Date, end: string | number | Date) => {
        if (!start || !end) return 'N/A';
        const startTime = new Date(start).getTime();
        const endTime = new Date(end).getTime();
        const durationMs = endTime - startTime;

        const hours = Math.floor(durationMs / (1000 * 60 * 60));
        const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) return `${hours}h ${minutes}m`;
        return `${minutes}m`;
    };

    const [shuffledPlayerIds, setShuffledPlayerIds] = useState<number[]>([]);
    const [isShuffling, setIsShuffling] = useState(false);
    const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
    const [showQRModal, setShowQRModal] = useState(false);
    const [copied, setCopied] = useState(false);

    // Sort players based on shuffled IDs
    const getSortedPlayers = () => {
        if (!game?.players) return [];

        // If no shuffle yet, return original order (or maybe sort by join time?)
        if (shuffledPlayerIds.length === 0) return game.players;

        const players = [...game.players];
        return players.sort((a, b) => {
            const indexA = shuffledPlayerIds.indexOf(a.id);
            const indexB = shuffledPlayerIds.indexOf(b.id);

            // If both are in shuffled list, sort by index
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;

            // If only A is in list, A comes first
            if (indexA !== -1) return -1;

            // If only B is in list, B comes first
            if (indexB !== -1) return 1;

            // If neither, keep original relative order (or sort by ID/name)
            return 0;
        });
    };

    const handleShufflePlayers = () => {
        if (!game?.players || game.players.length === 0) return;

        setIsShuffling(true);

        // Animate shuffle
        let shuffleCount = 0;
        const maxShuffles = 5;
        const interval = setInterval(() => {
            const currentIds = game.players!.map(p => p.id);
            // Fisher-Yates
            for (let i = currentIds.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [currentIds[i], currentIds[j]] = [currentIds[j], currentIds[i]];
            }
            setShuffledPlayerIds(currentIds);
            shuffleCount++;

            if (shuffleCount >= maxShuffles) {
                clearInterval(interval);
                setIsShuffling(false);
            }
        }, 150);
    };

    // Generate QR Code
    const generateQRCode = async () => {
        if (!game) return;

        try {
            // Generate join URL
            const joinUrl = `${window.location.origin}/play?code=${game.gameCode}`;
            const qrDataUrl = await QRCode.toDataURL(joinUrl, {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#FFFFFF'
                }
            });
            setQrCodeUrl(qrDataUrl);
            setShowQRModal(true);
            toast.success('QR Code generated!');
        } catch (error) {
            console.error('Error generating QR code:', error);
            toast.error('Failed to generate QR code');
        }
    };

    // Copy game code to clipboard
    const copyGameCode = async () => {
        if (!game) return;

        try {
            await navigator.clipboard.writeText(game.gameCode);
            setCopied(true);
            toast.success(`Game code "${game.gameCode}" copied!`);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Error copying to clipboard:', error);
            toast.error('Failed to copy game code');
        }
    };

    // Download QR Code
    const downloadQRCode = () => {
        if (!qrCodeUrl || !game) return;

        const link = document.createElement('a');
        link.href = qrCodeUrl;
        link.download = `game-${game.gameCode}-qr.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('QR Code downloaded!');
    };

    const sortedPlayers = getSortedPlayers();

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center h-screen">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading game details...</p>
                </div>
            </div>
        );
    }

    if (error || !game) {
        return (
            <div className="p-6">
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="text-red-600" size={24} />
                        <div>
                            <h3 className="font-bold text-red-800">Error</h3>
                            <p className="text-red-700">{error || 'Game not found'}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 max-w-7xl mx-auto">
            {/* Compact Header */}
            <div className="flex items-center justify-between bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border-2 border-transparent hover:border-black dark:hover:border-gray-500 text-black dark:text-white"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-3 text-black dark:text-white">
                            {game.name}
                            <span className={`px-2 py-0.5 rounded text-xs font-bold border border-black dark:border-gray-600 flex items-center gap-1 ${game.status === 'IN_PROGRESS' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                                game.status === 'WAITING' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' :
                                    'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300'
                                }`}>
                                {game.status === 'IN_PROGRESS' && <Play size={10} />}
                                {game.status === 'WAITING' && <Clock size={10} />}
                                {game.status === 'COMPLETED' && <CheckCircle size={10} />}
                                {game.status}
                            </span>
                        </h1>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                            <span className="flex items-center gap-1 text-gray-600 dark:text-gray-300 font-mono bg-gray-50 dark:bg-gray-700 px-1.5 rounded border border-gray-200 dark:border-gray-600">
                                <Hash size={12} /> {game.gameCode}
                            </span>
                            <span className="text-gray-400 dark:text-gray-500">|</span>
                            <span className="text-gray-500 dark:text-gray-400 text-xs">ID: {game.id}</span>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={copyGameCode}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
                        title="Copy game code"
                    >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        <span className="hidden sm:inline">{copied ? 'Copied!' : 'Copy Code'}</span>
                    </button>
                    <button
                        onClick={generateQRCode}
                        className="flex items-center gap-2 px-3 py-1.5 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg border-2 border-purple-600 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
                        title="Generate QR Code"
                    >
                        <QrCode size={16} />
                        <span className="hidden sm:inline">QR Code</span>
                    </button>

                    {/* Live Indicator */}
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600 rounded-lg">
                        <div className="relative flex items-center">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="absolute w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
                        </div>
                        <span className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide">Live</span>
                    </div>
                </div>
            </div>

            {/* Toast Container */}
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                        fontWeight: 'bold',
                    },
                    success: {
                        iconTheme: {
                            primary: '#10b981',
                            secondary: '#fff',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ef4444',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            {/* Main Content Grid - 3 Columns with better spacing */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                {/* Left Column: Game Info & Categories (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                            <Gamepad2 size={16} className="text-purple-600" />
                            Configuration
                        </h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Mode</span>
                                <span className="font-bold text-black dark:text-white">{game.gameMode}</span>
                            </div>

                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
                                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Host</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center border border-black dark:border-gray-600 text-xs">
                                        <Users size={12} className="text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <span className="font-bold text-sm text-black dark:text-white">{game.host?.name || 'Unknown'}</span>
                                </div>
                            </div>

                            <div className="pt-2">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 block">Categories</span>
                                <div className="flex flex-wrap gap-2">
                                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                    {game.categories?.map((gc: any) => (
                                        <div
                                            key={gc.id}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-md border-2 bg-white dark:bg-gray-700 text-xs font-bold shadow-sm"
                                            style={{
                                                borderColor: gc.category.color || '#6b7280',
                                                color: gc.category.color || '#6b7280'
                                            }}
                                        >
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: gc.category.color || '#6b7280' }}
                                            />
                                            {gc.category.name}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-4 flex items-center gap-2">
                            <Activity size={16} className="text-blue-600" />
                            Timeline
                        </h3>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500 dark:text-gray-400">Created</span>
                                <span className="font-mono text-black dark:text-white">{new Date(game.createdAt).toLocaleDateString()}</span>
                            </div>
                            {game.startedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Started</span>
                                    <span className="font-mono text-black dark:text-white">{new Date(game.startedAt).toLocaleTimeString()}</span>
                                </div>
                            )}
                            {game.endedAt && game.startedAt && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500 dark:text-gray-400">Ended</span>
                                    <span className="font-mono text-black dark:text-white">{new Date(game.endedAt).toLocaleTimeString()}</span>
                                </div>
                            )}
                            {game.startedAt && game.endedAt && (
                                <div className="mt-2 pt-2 border-t border-dashed border-gray-200 dark:border-gray-600 flex justify-between font-bold">
                                    <span className="text-black dark:text-white">Duration</span>
                                    <span className="text-blue-600 dark:text-blue-400">{formatDuration(game.startedAt, game.endedAt)}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Middle Column: Progress & Status (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 h-full">
                        <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-6 flex items-center gap-2">
                            <Play size={16} className="text-green-600" />
                            Live Status
                        </h3>

                        {game.status === 'IN_PROGRESS' ? (
                            <div className="space-y-8">
                                <div className="text-center py-4">
                                    <span className="text-4xl font-black text-black dark:text-white">{game.currentCardIndex + 1}</span>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm font-bold uppercase mt-1">Current Card</p>
                                </div>

                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1 text-black dark:text-white">
                                        <span>Progress</span>
                                        <span>{Math.round(((game.currentCardIndex || 0) / 10) * 100)}%</span>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-3 border border-black dark:border-gray-600 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full transition-all duration-500 relative"
                                            style={{ width: `${Math.min(((game.currentCardIndex || 0) / 10) * 100, 100)}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-40 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800 rounded border-2 border-dashed border-gray-200 dark:border-gray-700">
                                {game.status === 'WAITING' ? (
                                    <>
                                        <Clock size={32} className="mb-2 opacity-50" />
                                        <p className="font-bold text-sm">Waiting to Start</p>
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={32} className="mb-2 opacity-50" />
                                        <p className="font-bold text-sm">Game Finished</p>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Players (4 cols) */}
                <div className="lg:col-span-4">
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6 h-full flex flex-col">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-sm uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-2">
                                <Users size={16} className="text-orange-600" />
                                Players
                            </h3>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleShufflePlayers}
                                    disabled={isShuffling || !game.players || game.players.length < 2}
                                    className={`
                                            p-1.5 rounded-md border-2 border-black dark:border-gray-600 transition-all
                                            ${isShuffling || !game.players || game.players.length < 2
                                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                                            : 'bg-yellow-400 dark:bg-yellow-500 hover:bg-yellow-500 dark:hover:bg-yellow-600 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[-1px] hover:translate-y-[-1px]'
                                        }
                                        `}
                                    title="Shuffle Players"
                                >
                                    <Shuffle size={14} className={isShuffling ? 'animate-spin' : ''} />
                                </button>
                                <span className="bg-black dark:bg-white text-white dark:text-black px-2 py-0.5 rounded text-xs font-bold">
                                    {game.players?.length || 0}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto max-h-[400px] space-y-2 pr-1">
                            <AnimatePresence mode="popLayout">
                                {sortedPlayers && sortedPlayers.length > 0 ? (
                                    sortedPlayers.map((player) => (
                                        <motion.div
                                            layout
                                            key={player.id}
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                            className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-black dark:border-gray-700 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)] transition-all"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center border border-black dark:border-gray-600 font-bold text-xs text-black dark:text-white">
                                                    {player.nickname.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-sm leading-tight text-black dark:text-white">{player.nickname}</p>
                                                    <div className="flex items-center gap-1 mt-0.5">
                                                        {player.isConnected ? (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                        ) : (
                                                            <span className="w-1.5 h-1.5 rounded-full bg-gray-300"></span>
                                                        )}
                                                        <span className="text-[10px] text-gray-500 uppercase font-bold">
                                                            {player.isConnected ? 'Online' : 'Offline'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className="font-mono font-bold text-blue-600 dark:text-blue-400 text-sm">
                                                {player.score}
                                            </span>
                                        </motion.div>
                                    ))
                                ) : (
                                    <div className="text-center py-8">
                                        <p className="text-gray-400 text-sm italic">No players joined</p>
                                    </div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>
            </div>

            {/* QR Code Modal */}
            {showQRModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowQRModal(false)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-black dark:text-white flex items-center gap-2">
                                <QrCode size={24} className="text-purple-600 dark:text-purple-400" />
                                Join Game QR Code
                            </h3>
                            <button
                                onClick={() => setShowQRModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                <X size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="bg-white p-4 rounded-lg border-2 border-gray-200 dark:border-gray-600 mb-4">
                            {qrCodeUrl && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={qrCodeUrl}
                                    alt="Game QR Code"
                                    className="w-full h-auto"
                                />
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg border-2 border-gray-200 dark:border-gray-600">
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Game Code</p>
                                <p className="text-2xl font-black font-mono text-black dark:text-white text-center">{game?.gameCode}</p>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={downloadQRCode}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    <Download size={18} />
                                    Download
                                </button>
                                <button
                                    onClick={() => setShowQRModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default GameDetailsPage;
