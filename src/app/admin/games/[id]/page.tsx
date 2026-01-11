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
    AlertCircle,
    Hash,
    Activity,
    Shuffle,
    QrCode,
    Copy,
    Check,
    Download,
    X,
    Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import toast, { Toaster } from 'react-hot-toast';
import {
    DndContext,
    DragEndEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useDraggable, useDroppable } from '@dnd-kit/core';

import { GameSession } from '@/types/game';

// Draggable Player Component
interface DraggablePlayerProps {
    player: { id: number; nickname: string };
    teamColor?: string;
}

const DraggablePlayer: React.FC<DraggablePlayerProps> = ({ player, teamColor }) => {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: player.id,
    });

    const style = transform ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    } : undefined;

    return (
        <motion.div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            animate={{
                opacity: isDragging ? 0.5 : 1,
                scale: isDragging ? 1.05 : 1
            }}
            transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
        >
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 rounded flex items-center justify-center text-xs font-bold border-2"
                    style={{
                        backgroundColor: teamColor ? `${teamColor}20` : '#f3f4f6',
                        borderColor: teamColor || '#d1d5db',
                        color: teamColor || '#6b7280'
                    }}
                >
                    {player.nickname.substring(0, 2).toUpperCase()}
                </div>
                <span className="font-bold text-black dark:text-white">{player.nickname}</span>
            </div>
        </motion.div>
    );
};

// Droppable Area Component
interface DroppableAreaProps {
    id: string;
    title: string;
    color: string;
    children: React.ReactNode;
}

const DroppableArea: React.FC<DroppableAreaProps> = ({ id, title, color, children }) => {
    const { setNodeRef, isOver } = useDroppable({
        id,
    });

    return (
        <motion.div
            ref={setNodeRef}
            animate={{
                scale: isOver ? 1.02 : 1,
                borderColor: isOver ? color : undefined
            }}
            transition={{ duration: 0.2 }}
            className={`bg-gray-50 dark:bg-gray-700/30 rounded-xl p-4 border-2 transition-all min-h-[300px] ${isOver ? 'bg-blue-50 dark:bg-blue-900/20 shadow-lg' : 'border-gray-200 dark:border-gray-600'
                }`}
        >
            <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-600">
                <motion.div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                    animate={{ scale: isOver ? 1.3 : 1 }}
                    transition={{ duration: 0.2 }}
                />
                <h3 className="font-bold text-lg uppercase" style={{ color }}>
                    {title}
                </h3>
            </div>
            <div className="space-y-2">
                {children}
            </div>
        </motion.div>
    );
};

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
    const [error, setError] = useState<string | null>('');

    // Store the hash of the last fetched data to prevent unnecessary updates
    const lastDataHashRef = useRef<string>('');

    // Fetch game details
    const fetchGameDetails = useCallback(async () => {
        try {
            const response = await fetch(`/api/admin/games/${gameId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch game details');
            }

            const data = await response.json();
            const newHash = hashObject(data.game);

            // Only update if data changed
            if (newHash !== lastDataHashRef.current) {
                lastDataHashRef.current = newHash;
                setGame(data.game);

                // Initialize config form from data
                if (data.game) {
                    setConfigForm({
                        initialBudget: data.game.initialBudget || 5000,
                        initialBaseValue: data.game.initialBaseValue || 5,
                        leaderTermLength: data.game.leaderTermLength || 4,
                        gameDurationMinutes: data.game.gameDurationMinutes || 60,
                        totalRounds: data.game.totalRounds || 3
                    });
                }
            }

            setError('');
            setLoading(false);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            console.error('Failed to fetch game details:', error);
            setError(error.message || 'Failed to load game details');
            setLoading(false);
        }
    }, [gameId]);

    // Initial fetch and polling setup
    useEffect(() => {
        setLoading(true);
        fetchGameDetails();

        // Poll every 3 seconds for updates (reduced from 1s to save resources)
        const interval = setInterval(() => {
            fetchGameDetails();
        }, 3000);

        return () => clearInterval(interval);
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
    const [activePlayerId, setActivePlayerId] = useState<number | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const [showAddTeamModal, setShowAddTeamModal] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');
    const [newTeamColor, setNewTeamColor] = useState('#3B82F6');
    const [showDeleteTeamModal, setShowDeleteTeamModal] = useState(false);
    const [teamToDelete, setTeamToDelete] = useState<{ id: string, name: string } | null>(null);

    // Configuration editing state
    const [isEditingConfig, setIsEditingConfig] = useState(false);
    const [configForm, setConfigForm] = useState({
        initialBudget: 5000,
        initialBaseValue: 5,
        leaderTermLength: 4,
        gameDurationMinutes: 60,
        totalRounds: 3
    });
    const [isSavingConfig, setIsSavingConfig] = useState(false);

    // Team renaming state
    const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
    const [editingTeamName, setEditingTeamName] = useState('');
    const [isRenamingTeam, setIsRenamingTeam] = useState(false);

    // Drag and drop sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

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
            const joinUrl = `${window.location.origin}/live?code=${game.gameCode}`;
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

    // Handle drag start
    const handleDragStart = (event: DragStartEvent) => {
        setActivePlayerId(event.active.id as number);
    };

    // Handle drag end
    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActivePlayerId(null);

        if (!over) return;

        const playerId = active.id as number;
        const teamId = over.id as string;

        // If dropped on the same team or unassigned area, do nothing
        const player = game?.players?.find(p => p.id === playerId);
        if (player?.teamId === teamId) return;

        // Optimistic update
        setGame(prevGame => {
            if (!prevGame) return null;
            const updatedPlayers = prevGame.players?.map(p =>
                p.id === playerId ? { ...p, teamId: teamId === 'unassigned' ? null : teamId } : p
            );
            return { ...prevGame, players: updatedPlayers };
        });

        // Assign player to team
        await handleAssignPlayer(playerId, teamId === 'unassigned' ? null : teamId);
    };

    // Assign a single player to a team
    const handleAssignPlayer = async (playerId: number, teamId: string | null) => {
        try {
            setIsAssigning(true);
            const res = await fetch(`/api/admin/games/${gameId}/players`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assignments: [{ playerId, teamId }]
                })
            });

            if (!res.ok) throw new Error('Failed to assign player');

            const data = await res.json();

            // Update local state with the authoritative player list from server
            if (data.players) {
                setGame(prevGame => {
                    if (!prevGame) return null;
                    return { ...prevGame, players: data.players };
                });
            }

            toast.success('Player assigned!');
            // Removed fetchGameDetails() to prevent N+1 fetch spam
        } catch (err) {
            console.error('Error assigning player:', err);
            toast.error('Failed to assign player');
            fetchGameDetails(); // Revert optimistic update only on error
        } finally {
            setIsAssigning(false);
        }
    };

    // Random team assignment
    const handleRandomAssignment = async () => {
        if (!confirm('Randomly assign all unassigned players to teams?')) return;

        try {
            setIsAssigning(true);
            const res = await fetch(`/api/admin/games/${gameId}/assign-teams`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to assign teams');

            const data = await res.json();

            // Update local state with returned players
            if (data.players) {
                setGame(prevGame => {
                    if (!prevGame) return null;
                    return { ...prevGame, players: data.players };
                });
            }

            toast.success('Teams assigned randomly!');
        } catch (err) {
            console.error('Error assigning teams:', err);
            toast.error('Failed to assign teams');
        } finally {
            setIsAssigning(false);
        }
    };

    // Start the game
    const handleStartGame = async () => {
        const unassignedCount = game?.players?.filter(p => !p.teamId).length || 0;
        if (unassignedCount > 0) {
            toast.error(`Cannot start: ${unassignedCount} player(s) not assigned to teams`);
            return;
        }

        if (!confirm('Start the game? Players will begin receiving cards.')) return;

        try {
            const res = await fetch(`/api/game/${game?.gameCode}/start`, {
                method: 'POST'
            });

            if (!res.ok) throw new Error('Failed to start game');

            toast.success('Game started!');
            fetchGameDetails();
        } catch (err) {
            console.error('Error starting game:', err);
            toast.error('Failed to start game');
        }
    };

    // Add a new team
    const handleAddTeam = async () => {
        if (!newTeamName.trim()) {
            toast.error('Team name is required');
            return;
        }

        try {
            const res = await fetch(`/api/admin/games/${gameId}/teams`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: newTeamName,
                    color: newTeamColor
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create team');
            }

            toast.success(`Team "${newTeamName}" created!`);
            setShowAddTeamModal(false);
            setNewTeamName('');
            setNewTeamColor('#3B82F6');

            // Immediate refresh without hard reload
            await fetchGameDetails();
        } catch (err: unknown) {
            console.error('Error creating team:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to create team');
        }
    };

    // Show delete confirmation modal
    const handleDeleteTeamClick = (teamId: string, teamName: string) => {
        console.log('Delete team clicked:', teamId, teamName);
        setTeamToDelete({ id: teamId, name: teamName });
        setShowDeleteTeamModal(true);
    };

    // Actually delete the team
    const confirmDeleteTeam = async () => {
        if (!teamToDelete) return;

        try {
            console.log('Sending delete request for team:', teamToDelete.id);
            const res = await fetch(`/api/admin/games/${gameId}/teams?teamId=${teamToDelete.id}`, {
                method: 'DELETE'
            });

            console.log('Delete response status:', res.status);

            if (!res.ok) {
                const data = await res.json();
                console.error('Delete failed:', data);
                throw new Error(data.error || 'Failed to delete team');
            }

            const data = await res.json();
            console.log('Delete successful:', data);
            toast.success(`Team "${teamToDelete.name}" deleted!`);
            setShowDeleteTeamModal(false);
            setTeamToDelete(null);
            await fetchGameDetails();
        } catch (err: unknown) {
            console.error('Error deleting team:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to delete team');
            setShowDeleteTeamModal(false);
            setTeamToDelete(null);
        }
    };

    // Update game configuration
    const handleUpdateConfig = async () => {
        try {
            setIsSavingConfig(true);
            const res = await fetch(`/api/admin/games/${gameId}/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(configForm)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update configuration');
            }

            toast.success('Configuration updated!');
            setIsEditingConfig(false);
            fetchGameDetails();
        } catch (err: unknown) {
            console.error('Error updating config:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to update configuration');
        } finally {
            setIsSavingConfig(false);
        }
    };

    // Rename a team
    const handleRenameTeam = async (teamId: string) => {
        if (!editingTeamName.trim()) return;

        try {
            setIsRenamingTeam(true);
            const res = await fetch(`/api/admin/games/${gameId}/teams`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    teamId,
                    name: editingTeamName
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to rename team');
            }

            toast.success('Team renamed!');
            setEditingTeamId(null);
            fetchGameDetails();
        } catch (err: unknown) {
            console.error('Error renaming team:', err);
            toast.error(err instanceof Error ? err.message : 'Failed to rename team');
        } finally {
            setIsRenamingTeam(false);
        }
    };

    // Bulk create/set number of teams
    const handleSetTeamCount = async (count: number) => {
        if (!game) return;
        try {
            const currentCount = game.teams?.length || 0;
            if (count === currentCount) return;

            if (count < currentCount) {
                toast.error(`Please delete teams manually down to ${count}.`);
                return;
            }

            // Create missing teams
            const teamsToCreate = count - currentCount;
            const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

            for (let i = 0; i < teamsToCreate; i++) {
                const color = colors[(currentCount + i) % colors.length];
                await fetch(`/api/admin/games/${gameId}/teams`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: `Team ${currentCount + i + 1}`,
                        color: color,
                        order: currentCount + i,
                        budget: game.initialBudget || 5000,
                        baseValue: game.initialBaseValue || 5
                    })
                });
            }

            toast.success(`Created ${teamsToCreate} new teams!`);
            fetchGameDetails();
        } catch (err: unknown) {
            console.error('Error setting team count:', err);
            toast.error('Failed to create new teams');
        }
    };

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

                {/* Delete Team Confirmation Modal */}
                {showDeleteTeamModal && teamToDelete && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 border-2 border-black dark:border-gray-700">
                            <h3 className="text-xl font-bold text-black dark:text-white mb-4">Delete Team?</h3>
                            <p className="text-gray-700 dark:text-gray-300 mb-6">
                                Are you sure you want to delete team <strong>&quot;{teamToDelete.name}&quot;</strong>?
                                This can only be done if no players are assigned.
                            </p>
                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => {
                                        setShowDeleteTeamModal(false);
                                        setTeamToDelete(null);
                                    }}
                                    className="px-4 py-2 text-sm font-bold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmDeleteTeam}
                                    className="px-4 py-2 text-sm font-bold text-white bg-red-600 rounded hover:bg-red-700 transition-colors"
                                >
                                    Delete Team
                                </button>
                            </div>
                        </div>
                    </div>
                )}

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

                    <button
                        onClick={() => router.push(`/admin/games/${gameId}/host`)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-bold rounded-lg border-2 border-black dark:border-gray-500 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all text-sm"
                        title="Open Live Spectator View"
                    >
                        <Play size={16} />
                        <span className="hidden sm:inline">Live View</span>
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

            {/* Team Assignment Section - Only show when WAITING */}
            {game.status === 'WAITING' && game.players && game.players.length > 0 && (
                <DndContext
                    sensors={sensors}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                >
                    <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-black dark:text-white mb-2 flex items-center gap-2">
                                    <Users size={28} className="text-blue-600" />
                                    Team Assignment
                                </h2>
                                <p className="text-gray-600 dark:text-gray-400">Drag players to teams or use random assignment</p>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowAddTeamModal(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    <Users size={18} />
                                    Add Team
                                </button>
                                <button
                                    onClick={handleRandomAssignment}
                                    disabled={isAssigning || !game.players?.some(p => !p.teamId)}
                                    className="flex items-center gap-2 px-4 py-2 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-purple-600 disabled:border-gray-400 shadow-[2px_2px_0px_0px_rgba(147,51,234,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    <Sparkles size={18} />
                                    Random Assignment
                                </button>
                                <button
                                    onClick={handleStartGame}
                                    disabled={game.players?.some(p => !p.teamId)}
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-lg border-2 border-green-600 disabled:border-gray-400 shadow-[2px_2px_0px_0px_rgba(34,197,94,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    <Play size={18} />
                                    Start Game
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Unassigned Players */}
                            <DroppableArea id="unassigned" title="Unassigned Players" color="#f59e0b">
                                <AnimatePresence>
                                    {game.players?.filter(p => !p.teamId).map(player => (
                                        <DraggablePlayer key={player.id} player={player} />
                                    ))}
                                </AnimatePresence>
                                {game.players?.filter(p => !p.teamId).length === 0 && (
                                    <div className="text-center py-8 text-gray-400 italic text-sm">
                                        All players assigned!
                                    </div>
                                )}
                            </DroppableArea>

                            {/* Team Columns */}
                            {game.teams?.map(team => (
                                <div key={team.id} className="space-y-2">
                                    <DroppableArea id={team.id} title={team.name} color={team.color}>
                                        <div className="flex justify-between items-center mb-2 px-2">
                                            {editingTeamId === team.id ? (
                                                <div className="flex items-center gap-1 w-full">
                                                    <input
                                                        type="text"
                                                        value={editingTeamName}
                                                        onChange={(e) => setEditingTeamName(e.target.value)}
                                                        className="flex-1 px-2 py-0.5 text-xs border border-blue-500 rounded outline-none"
                                                        autoFocus
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter') handleRenameTeam(team.id);
                                                            if (e.key === 'Escape') setEditingTeamId(null);
                                                        }}
                                                    />
                                                    <button onClick={() => handleRenameTeam(team.id)} className="text-green-500">
                                                        <Check size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => {
                                                        setEditingTeamId(team.id);
                                                        setEditingTeamName(team.name);
                                                    }}
                                                    className="text-[10px] text-gray-400 hover:text-blue-500 underline font-bold"
                                                >
                                                    Rename
                                                </button>
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {game.players?.filter(p => p.teamId === team.id).map(player => (
                                                <DraggablePlayer key={player.id} player={player} teamColor={team.color} />
                                            ))}
                                        </AnimatePresence>
                                        {game.players?.filter(p => p.teamId === team.id).length === 0 && (
                                            <div className="text-center py-8 text-gray-400 italic text-sm">
                                                No players yet
                                            </div>
                                        )}
                                    </DroppableArea>
                                    {/* Delete Team Button - Outside DroppableArea */}
                                    <button
                                        onClick={() => handleDeleteTeamClick(team.id, team.name)}
                                        className="w-full py-2 text-xs font-bold text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 border-2 border-red-300 dark:border-red-700 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                    >
                                        Delete Team
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <DragOverlay>
                        {activePlayerId ? (
                            <div className="bg-white dark:bg-gray-800 p-3 rounded-lg border-2 border-blue-500 shadow-lg opacity-90">
                                <div className="font-bold text-black dark:text-white">
                                    {game.players?.find(p => p.id === activePlayerId)?.nickname}
                                </div>
                            </div>
                        ) : null}
                    </DragOverlay>
                </DndContext>
            )}

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

                            {/* Game Settings Section */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase">Game Settings</span>
                                    {game.status === 'WAITING' && (
                                        <button
                                            onClick={() => setIsEditingConfig(!isEditingConfig)}
                                            className="text-[10px] font-black text-blue-500 hover:text-blue-600 uppercase"
                                        >
                                            {isEditingConfig ? 'Cancel' : 'Edit'}
                                        </button>
                                    )}
                                </div>

                                {isEditingConfig ? (
                                    <div className="space-y-3 bg-blue-50 dark:bg-blue-900/10 p-3 rounded border border-blue-100 dark:border-blue-900/30">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Initial Budget ($)</label>
                                            <input
                                                type="number"
                                                value={configForm.initialBudget}
                                                onChange={(e) => setConfigForm({ ...configForm, initialBudget: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-blue-500 outline-none font-bold"
                                                placeholder="Enter budget..."
                                                step={100}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Number of Rounds</label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    value={configForm.totalRounds}
                                                    onChange={(e) => setConfigForm({ ...configForm, totalRounds: parseInt(e.target.value) || 1 })}
                                                    className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-blue-500 outline-none font-bold"
                                                    min={1}
                                                    max={10}
                                                />
                                                <span className="text-[10px] text-gray-400 whitespace-nowrap">
                                                    ({(configForm.totalRounds || 3) * 3} cards)
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Initial Base Value</label>
                                            <input
                                                type="number"
                                                value={configForm.initialBaseValue}
                                                onChange={(e) => setConfigForm({ ...configForm, initialBaseValue: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Game Duration (Mins)</label>
                                            <input
                                                type="number"
                                                value={configForm.gameDurationMinutes}
                                                onChange={(e) => setConfigForm({ ...configForm, gameDurationMinutes: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Leader term (Rounds)</label>
                                            <input
                                                type="number"
                                                value={configForm.leaderTermLength}
                                                onChange={(e) => setConfigForm({ ...configForm, leaderTermLength: parseInt(e.target.value) || 0 })}
                                                className="w-full px-2 py-1 text-xs border-2 border-gray-200 rounded focus:border-blue-500 outline-none"
                                            />
                                        </div>
                                        <button
                                            onClick={handleUpdateConfig}
                                            disabled={isSavingConfig}
                                            className="w-full py-1.5 bg-green-500 text-white text-xs font-black rounded border-b-4 border-green-700 active:border-b-0 active:translate-y-1 transition-all"
                                        >
                                            {isSavingConfig ? 'Saving...' : 'SAVE SETTINGS'}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Initial Budget</span>
                                            <span className="font-bold">${(game.initialBudget || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Rounds</span>
                                            <span className="font-bold">{game.totalRounds || 3} ({((game.totalRounds || 3) * (game.cardsPerRound || 3))} cards)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Game Duration</span>
                                            <span className="font-bold">{game.gameDurationMinutes || 60} Mins</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-bold">{game.leaderTermLength || 4} Rounds Term</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Initial Base Value</span>
                                            <span className="font-bold">{game.initialBaseValue || 5}</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Team Control Section */}
                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase mb-2 block">Set Team Count</span>
                                <div className="flex gap-2">
                                    {[2, 3, 4, 6].map(num => (
                                        <button
                                            key={num}
                                            onClick={() => handleSetTeamCount(num)}
                                            className={`flex-1 py-1 text-xs font-bold border-2 rounded transition-all ${game.teams?.length === num ? 'bg-orange-500 text-white border-orange-600' : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300'}`}
                                        >
                                            {num}
                                        </button>
                                    ))}
                                </div>
                                <p className="text-[10px] text-gray-400 mt-1 italic italic">
                                    Setting a higher number will instantly add new teams.
                                </p>
                            </div>

                            <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
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

            {/* Add Team Modal */}
            {showAddTeamModal && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddTeamModal(false)}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6 max-w-md w-full"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-black text-black dark:text-white flex items-center gap-2">
                                <Users size={24} className="text-blue-600 dark:text-blue-400" />
                                Add New Team
                            </h3>
                            <button
                                onClick={() => setShowAddTeamModal(false)}
                                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                                <X size={20} className="text-gray-600 dark:text-gray-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Team Name
                                </label>
                                <input
                                    type="text"
                                    value={newTeamName}
                                    onChange={(e) => setNewTeamName(e.target.value)}
                                    placeholder="e.g., Team Alpha"
                                    className="w-full px-4 py-2 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-black dark:text-white focus:border-blue-500 focus:outline-none"
                                    autoFocus
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">
                                    Team Color
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="color"
                                        value={newTeamColor}
                                        onChange={(e) => setNewTeamColor(e.target.value)}
                                        className="h-10 w-20 rounded border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                                    />
                                    <span className="text-sm font-mono text-gray-600 dark:text-gray-400">{newTeamColor}</span>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={handleAddTeam}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg border-2 border-blue-600 shadow-[2px_2px_0px_0px_rgba(37,99,235,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    <Users size={18} />
                                    Create Team
                                </button>
                                <button
                                    onClick={() => setShowAddTeamModal(false)}
                                    className="flex-1 px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-lg border-2 border-gray-300 dark:border-gray-600 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                                >
                                    Cancel
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
