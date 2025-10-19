"use client"
import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Users,
    Play,
    Pause,
    Square,
    Calendar,
    Clock,
    Gamepad2,
    Target,
    AlertCircle
} from 'lucide-react';

const GameDetailsPage = () => {
    const params = useParams();
    const router = useRouter();
    const gameId = params.id as string;

    const [game, setGame] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGameDetails();
    }, [gameId]);

    const fetchGameDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/games/${gameId}`);

            if (!response.ok) {
                throw new Error('Failed to fetch game details');
            }

            const data = await response.json();
            setGame(data.game);
        } catch (error) {
            console.error('Error:', error);
            setError(error.message);
        } finally {
            setLoading(false);
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
        <div className="p-6">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button
                    onClick={() => router.back()}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                    <ArrowLeft size={24} />
                </button>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold">{game.name}</h1>
                    <p className="text-gray-600">Game Code: <span className="font-mono font-bold">{game.gameCode}</span></p>
                </div>
                <span className={`px-4 py-2 rounded-lg font-bold border-2 border-black ${
                    game.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-800' :
                    game.status === 'WAITING' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                }`}>
                    {game.status}
                </span>
            </div>

            {/* Game Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Gamepad2 size={20} className="text-blue-600" />
                        <h3 className="font-bold">Game Mode</h3>
                    </div>
                    <p className="text-2xl font-bold">{game.gameMode}</p>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Users size={20} className="text-purple-600" />
                        <h3 className="font-bold">Host</h3>
                    </div>
                    <p className="text-lg font-semibold">{game.host?.name || 'Unknown'}</p>
                </div>

                <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                    <div className="flex items-center gap-3 mb-2">
                        <Calendar size={20} className="text-green-600" />
                        <h3 className="font-bold">Created</h3>
                    </div>
                    <p className="text-lg">{new Date(game.createdAt).toLocaleString()}</p>
                </div>
            </div>

            {/* Categories */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                    <Target size={20} className="text-orange-600" />
                    <h3 className="font-bold text-lg">Categories</h3>
                </div>
                <div className="flex flex-wrap gap-3">
                    {game.categories?.map((gc) => (
                        <div
                            key={gc.id}
                            className="px-4 py-2 rounded-lg border-2 border-black font-semibold"
                            style={{
                                backgroundColor: gc.category.color || '#gray',
                                color: 'white'
                            }}
                        >
                            {gc.category.name}
                        </div>
                    ))}
                </div>
            </div>

            {/* Players */}
            <div className="bg-white border-2 border-black rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Users size={20} className="text-blue-600" />
                    <h3 className="font-bold text-lg">Players ({game.players?.length || 0})</h3>
                </div>
                {game.players && game.players.length > 0 ? (
                    <div className="space-y-2">
                        {game.players.map((player) => (
                            <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                                <span className="font-semibold">{player.nickname}</span>
                                <span className="text-gray-600">Score: {player.score}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-center py-8">No players have joined yet</p>
                )}
            </div>
        </div>
    );
};

export default GameDetailsPage;
