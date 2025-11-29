"use client"
import React, { useState } from 'react'
import { Gamepad2, Loader2, Users, Zap, LogIn } from 'lucide-react'
import Link from 'next/link'

import { useRouter } from 'next/navigation'

const JoinGamePage: React.FC = () => {
    const router = useRouter()
    const [gameCode, setGameCode] = useState('')
    const [nickname, setNickname] = useState('')
    const [pending, setPending] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<any>(null);

    const handleGameCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Auto-format and uppercase the game code
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        setGameCode(value)
        setError('')
    }

    // Check for authenticated user and redirect them
    React.useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        // Redirect authenticated users to user home
                        router.push('/user/home');
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            }
        };
        checkAuth();
    }, [router]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleSubmit = async (e?: any) => {
        if (e) e.preventDefault()

        if (gameCode.length < 4) {
            setError('Game code must be at least 4 characters')
            return
        }

        if (!nickname.trim()) {
            setError('Please enter a nickname')
            return
        }

        setPending(true)
        setError('')

        try {
            const response = await fetch('/api/game/join', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ gameCode, nickname }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to join game')
            }

            // Store player info in session storage or context if needed
            sessionStorage.setItem('currentPlayerId', data.playerId.toString())
            sessionStorage.setItem('currentNickname', data.nickname)

            // Redirect to game lobby
            router.push(`/play/${data.gameCode}`)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-8 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-400 transform rotate-45"></div>
                <div className="absolute top-32 right-16 w-16 h-16 border-4 border-green-500 transform rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-blue-400 rounded-full"></div>
                <div className="absolute bottom-32 right-12 w-18 h-18 border-4 border-red-500 transform -rotate-45"></div>
                <div className="absolute top-1/2 left-8 w-12 h-12 bg-purple-500 transform rotate-45 opacity-30"></div>
                <div className="absolute top-1/4 right-8 w-14 h-14 bg-orange-500 rounded-full opacity-30"></div>
                <div className="absolute top-2/3 right-1/4 w-16 h-16 border-4 border-yellow-400 rounded-full"></div>
                <div className="absolute bottom-1/3 left-1/3 w-10 h-10 bg-green-500 transform rotate-12 opacity-30"></div>
                <div className="absolute top-1/3 left-2/3 w-18 h-18 border-4 border-blue-400 transform rotate-45"></div>
            </div>

            {/* Subtle Grid Pattern */}
            <div
                className="absolute inset-0 opacity-3 pointer-events-none"
                style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-6 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] mb-6 relative">
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-blue-400 transform rotate-45"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <Gamepad2 size={48} className="mx-auto text-blue-500" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2 transform -rotate-1 relative">
                        <span className="absolute -inset-1 bg-white dark:bg-gray-800 transform -skew-x-12 -z-10 border-4 border-black dark:border-gray-700"></span>
                        <span className="relative text-black dark:text-white px-4">Join Crisis Game</span>
                    </h1>
                    <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                        Enter your game code to start!
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8 relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 transform rotate-45"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-500 transform rotate-45"></div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 font-bold text-center animate-shake">
                            {error.error || error.message || 'Failed to join game'}
                        </div>
                    )}

                    <div className="space-y-6 relative z-10">
                        {/* Nickname Input */}
                        <div>
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                Your Nickname
                            </label>
                            <input
                                required
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="ENTER NICKNAME"
                                className="w-full px-4 py-3 border-4 border-black rounded-lg font-bold text-lg
                                    bg-white dark:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]
                                    focus:translate-x-[1px] focus:translate-y-[1px]
                                    transition-all duration-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500
                                    uppercase text-black dark:text-white border-black dark:border-gray-700"
                                maxLength={12}
                            />
                        </div>

                        {/* Game Code Input */}
                        <div className="relative">
                            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-center">
                                Game Code
                            </label>
                            <div className="flex justify-center gap-2 mb-2">
                                {[0, 1, 2, 3, 4, 5].map((index) => (
                                    <div
                                        key={index}
                                        className={`w-14 h-16 border-4 rounded-lg flex items-center justify-center
                                            bg-white dark:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] transition-all duration-200
                                            ${error ? 'border-red-500 dark:border-red-600' : 'border-black dark:border-gray-700'}
                                            ${gameCode[index] ? 'bg-yellow-100 dark:bg-yellow-900/30' : 'bg-white dark:bg-gray-800'}`}
                                    >
                                        <span className="text-3xl font-black text-black dark:text-white">
                                            {gameCode[index] || ''}
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <input
                                required
                                type="text"
                                value={gameCode}
                                onChange={handleGameCodeChange}
                                placeholder="Enter game code"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && gameCode.length >= 4 && nickname) {
                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                        handleSubmit(e as any)
                                    }
                                }}
                                className="w-full px-4 py-3 border-4 border-black rounded-lg font-bold text-lg text-center
                                    bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    focus:translate-x-[1px] focus:translate-y-[1px]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500
                                    tracking-wide uppercase text-black dark:text-white dark:bg-gray-800 dark:border-gray-700 dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] dark:placeholder-gray-500"
                                maxLength={6}
                            />
                        </div>

                        <div className="text-center">
                            <p className="text-sm font-bold text-gray-600 dark:text-gray-400">
                                Enter the 4-6 character code from your game host
                            </p>
                        </div>

                        {/* Submit Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={pending || gameCode.length < 4 || !nickname}
                            className="w-full px-6 py-4 border-4 border-black rounded-lg font-bold text-lg
                                bg-blue-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                flex items-center justify-center gap-2 relative overflow-hidden group
                                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            {pending ? (
                                <>
                                    <Loader2 size={20} className="relative z-10 animate-spin" />
                                    <span className="relative z-10">Joining Game...</span>
                                </>
                            ) : (
                                <>
                                    <Zap size={20} className="relative z-10" />
                                    <span className="relative z-10">Join Crisis Game</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Auth Links */}
                    <div className="mt-8 pt-6 border-t-4 border-black dark:border-gray-700 flex gap-4 justify-center">
                        <Link
                            href="/auth/login"
                            className="px-6 py-3 border-4 border-black rounded-lg font-bold text-lg
                                bg-red-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            <LogIn size={20} className="relative z-10" />
                            <span className="relative z-10">Login</span>
                        </Link>

                        <Link
                            href="/auth/register"
                            className="px-6 py-3 border-4 border-black rounded-lg font-bold text-lg
                                bg-green-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            <Users size={20} className="relative z-10" />
                            <span className="relative z-10">Register</span>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <div className="inline-block bg-white dark:bg-gray-800 px-6 py-2 border-4 border-black dark:border-gray-700 transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                        <p className="text-black dark:text-white font-bold transform skew-x-12">
                            Ready for the challenge? 🎮
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default JoinGamePage
