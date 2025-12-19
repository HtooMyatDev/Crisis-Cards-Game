"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Loader2, Users, Gamepad2, ArrowRight } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NicknameTakenModal } from '@/components/game/NicknameTakenModal'

interface GameData {
    gameCode: string;
    status: string;
    players: Array<{
        id: number;
        nickname: string;
        score: number;
        isLeader: boolean;
        isConnected: boolean;
    }>;
}

const JoinGamePage: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    // Steps: 'code' -> 'nickname'
    const [step, setStep] = useState<'code' | 'nickname'>('code')

    const [gameCode, setGameCode] = useState('')
    const [nickname, setNickname] = useState('')
    const [pending, setPending] = useState(false)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [error, setError] = useState<any>(null)
    const [gameData, setGameData] = useState<GameData | null>(null)
    const [showNicknameTakenModal, setShowNicknameTakenModal] = useState(false)

    // Polling ref
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

    // Initialize from URL params if available
    useEffect(() => {
        const codeParam = searchParams.get('code')
        if (codeParam) {
            setGameCode(codeParam.toUpperCase())
        }
    }, [searchParams])

    const handleGameCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        setGameCode(value)
        setError('')
    }

    // Check for authenticated user and redirect them
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    if (data.user) {
                        router.push('/user/home');
                    }
                }
            } catch (error) {
                console.error('Error checking auth:', error);
            }
        };
        checkAuth();
    }, [router]);

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
            }
        }
    }, [])

    // Poll for game data when in nickname step
    useEffect(() => {
        if (step === 'nickname' && gameCode) {
            const fetchGameData = async () => {
                try {
                    const res = await fetch(`/api/game/${gameCode}`)
                    if (res.ok) {
                        const data = await res.json()
                        setGameData(data)
                    } else {
                        setError('Game not found or ended')
                        setStep('code')
                    }
                } catch (error) {
                    console.error('Error fetching game data:', error)
                }
            }

            fetchGameData()
            pollIntervalRef.current = setInterval(fetchGameData, 3000)
        }

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current)
            }
        }
    }, [step, gameCode])

    const handleValidateCode = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()

        if (gameCode.length < 4) {
            setError('Game code must be at least 4 characters')
            return
        }

        setPending(true)
        setError('')

        try {
            const res = await fetch(`/api/game/${gameCode}`)
            if (res.ok) {
                const data = await res.json()
                setGameData(data)
                setStep('nickname')
            } else {
                const data = await res.json()
                setError(data.error || 'Game not found')
            }
        } catch (err) {
            console.error(err)
            setError('Failed to connect to server')
        } finally {
            setPending(false)
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleJoinGame = async (e?: any) => {
        if (e) e.preventDefault()

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
                if (response.status === 409) {
                    setShowNicknameTakenModal(true)
                    setPending(false)
                    return
                }
                throw new Error(data.error || 'Failed to join game')
            }

            localStorage.setItem('currentPlayerId', data.playerId.toString())
            localStorage.setItem('currentNickname', data.nickname)

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
            <NicknameTakenModal
                isOpen={showNicknameTakenModal}
                onClose={() => setShowNicknameTakenModal(false)}
            />

            {/* Decorative Background Elements */}
            <div className="absolute inset-0 opacity-8 pointer-events-none">
                <div className="absolute top-10 left-10 w-20 h-20 border-4 border-yellow-400 transform rotate-45"></div>
                <div className="absolute top-32 right-16 w-16 h-16 border-4 border-green-500 transform rotate-12"></div>
                <div className="absolute bottom-20 left-20 w-24 h-24 border-4 border-blue-400 rounded-full"></div>
                <div className="absolute bottom-32 right-12 w-18 h-18 border-4 border-red-500 transform -rotate-45"></div>
            </div>

            <div className="w-full max-w-5xl relative z-10">
                {step === 'code' ? (
                    /* STEP 1: GAME CODE */
                    <div className="max-w-md mx-auto">
                        <div className="text-center mb-8">
                            <div className="inline-block p-6 bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] mb-6">
                                <Gamepad2 size={48} className="mx-auto text-blue-500" />
                            </div>
                            <h1 className="text-4xl font-black text-gray-800 dark:text-white mb-2">
                                Join Crisis Game
                            </h1>
                            <p className="text-xl font-bold text-gray-600 dark:text-gray-400">
                                Enter your game code to start!
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 font-bold text-center animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide text-center">
                                        Game Code
                                    </label>
                                    <div className="flex justify-center gap-2 mb-4">
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
                                        type="text"
                                        value={gameCode}
                                        onChange={handleGameCodeChange}
                                        placeholder="Enter game code"
                                        onKeyDown={(e) => e.key === 'Enter' && gameCode.length >= 4 && handleValidateCode()}
                                        className="w-full px-4 py-3 border-4 border-black dark:border-gray-700 rounded-lg font-bold text-lg text-center
                                            bg-white dark:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]
                                            focus:translate-x-[1px] focus:translate-y-[1px]
                                            transition-all duration-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500
                                            tracking-wide uppercase text-black dark:text-white"
                                        maxLength={6}
                                    />
                                </div>

                                <button
                                    onClick={() => handleValidateCode()}
                                    disabled={pending || gameCode.length < 4}
                                    className="w-full px-6 py-4 border-4 border-black dark:border-gray-700 rounded-lg font-bold text-lg
                                        bg-blue-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]
                                        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:bg-blue-600
                                        hover:translate-x-[2px] hover:translate-y-[2px]
                                        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                        flex items-center justify-center gap-2
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                                >
                                    {pending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        <>
                                            <span>Continue</span>
                                            <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* STEP 2: NICKNAME & LOBBY */
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Left: Nickname Input */}
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-8">
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">Enter Your Nickname</h2>
                                <div className="inline-block px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg border-2 border-black dark:border-gray-600">
                                    <span className="text-sm font-bold text-gray-600 dark:text-gray-300">Game Code: </span>
                                    <span className="text-lg font-black text-black dark:text-white tracking-wider">{gameCode}</span>
                                </div>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border-2 border-red-500 dark:border-red-600 rounded-lg text-red-600 dark:text-red-400 font-bold text-sm animate-shake">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 uppercase tracking-wide">
                                        Your Nickname
                                    </label>
                                    <input
                                        type="text"
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        placeholder="ENTER NICKNAME"
                                        className="w-full px-4 py-3 border-4 border-black dark:border-gray-700 rounded-lg font-bold text-lg
                                            bg-white dark:bg-gray-800 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)]
                                            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:focus:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]
                                            focus:translate-x-[1px] focus:translate-y-[1px]
                                            transition-all duration-200 focus:outline-none placeholder-gray-400 dark:placeholder-gray-500
                                            uppercase text-black dark:text-white"
                                        maxLength={15}
                                        onKeyDown={(e) => e.key === 'Enter' && nickname && handleJoinGame()}
                                        autoFocus
                                    />
                                </div>

                                <button
                                    onClick={handleJoinGame}
                                    disabled={pending || !nickname}
                                    className="w-full px-6 py-4 border-4 border-black dark:border-gray-700 rounded-lg font-bold text-lg
                                        bg-green-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]
                                        hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:bg-green-600
                                        hover:translate-x-[2px] hover:translate-y-[2px]
                                        active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                        flex items-center justify-center gap-2
                                        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                                >
                                    {pending ? (
                                        <Loader2 className="animate-spin" />
                                    ) : (
                                        'OK, go!'
                                    )}
                                </button>

                                <button
                                    onClick={() => setStep('code')}
                                    className="w-full py-2 text-gray-500 dark:text-gray-400 font-bold text-sm hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                                >
                                    ← Back to Game Code
                                </button>
                            </div>
                        </div>

                        {/* Right: Who Joined */}
                        <div className="bg-white dark:bg-gray-800 border-4 border-black dark:border-gray-700 rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.1)] p-6">
                            <div className="flex items-center justify-between mb-4 pb-4 border-b-4 border-black dark:border-gray-700">
                                <h3 className="text-xl font-black text-gray-800 dark:text-white flex items-center gap-2">
                                    <Users size={24} />
                                    Who Joined?
                                </h3>
                                <span className="bg-blue-500 text-white px-4 py-2 rounded-lg font-black text-lg border-2 border-black dark:border-gray-700">
                                    {gameData?.players?.length || 0}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2">
                                {gameData?.players?.map((player) => (
                                    <div
                                        key={player.id}
                                        className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg border-2 border-black dark:border-gray-600 shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <div className="font-bold text-gray-900 dark:text-gray-100 truncate flex items-center gap-2">
                                            <Users size={16} className="text-blue-500" />
                                            {player.nickname}
                                        </div>
                                    </div>
                                ))}

                                {(!gameData?.players || gameData.players.length === 0) && (
                                    <div className="col-span-2 text-center py-12 text-gray-500 dark:text-gray-400 italic">
                                        <Users size={48} className="mx-auto mb-2 opacity-30" />
                                        <p>Waiting for players to join...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex items-center justify-center gap-6 mt-8">
                    <Link
                        href="/auth/login"
                        className="text-gray-600 dark:text-gray-400 font-bold hover:text-blue-500 dark:hover:text-blue-400 transition-colors flex items-center gap-1 group"
                    >
                        <span>Already have an account?</span>
                        <span className="text-black dark:text-white border-b-2 border-black dark:border-white group-hover:text-blue-500 group-hover:border-blue-500">Login</span>
                    </Link>
                    <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-700"></div>
                    <Link
                        href="/auth/register"
                        className="text-gray-600 dark:text-gray-400 font-bold hover:text-green-500 dark:hover:text-green-400 transition-colors flex items-center gap-1 group"
                    >
                        <span>Need an account?</span>
                        <span className="text-black dark:text-white border-b-2 border-black dark:border-white group-hover:text-green-500 group-hover:border-green-500">Sign Up</span>
                    </Link>
                </div>
            </div>

        </div>
    )
}

export default JoinGamePage
