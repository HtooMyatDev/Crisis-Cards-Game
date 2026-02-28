"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Loader2 } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { NicknameTakenModal } from '@/components/game/NicknameTakenModal'

type Step = 'code' | 'splash' | 'nickname'

interface GameData {
    gameCode: string;
    status: 'WAITING' | 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';
    players: Array<{
        id: number;
        nickname: string;
    }>;
}



const JoinGamePage: React.FC = () => {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [step, setStep] = useState<Step>('code')
    const [gameCode, setGameCode] = useState<string[]>([])
    const [nickname, setNickname] = useState('')
    const [error, setError] = useState('')
    const [pending, setPending] = useState(false)
    const [gameData, setGameData] = useState<GameData | null>(null)
    const [isNicknameTaken, setIsNicknameTaken] = useState(false)

    // Polling ref
    const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    // Initialize from URL params if available
    useEffect(() => {
        const codeParam = searchParams.get('code')
        if (codeParam) {
            setGameCode(codeParam.toUpperCase().split('').slice(0, 6))
        }
    }, [searchParams])

    // Focus first input on mount
    useEffect(() => {
        if (step === 'code' && inputRefs.current[0]) {
            inputRefs.current[0].focus()
        }
    }, [step])

    // Handle input change for individual code boxes
    const handleCodeInput = (index: number, value: string) => {
        // Only allow alphanumeric
        const cleanValue = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

        if (!cleanValue) {
            // Handle backspace/delete if empty
            const newCode = [...gameCode]
            newCode[index] = ''
            setGameCode(newCode)
            return
        }

        // Update the code character at index
        const newCode = [...gameCode]
        // Pad with empty strings if needed
        while (newCode.length < 6) newCode.push('')

        newCode[index] = cleanValue.slice(0, 1)
        setGameCode(newCode.slice(0, 6))
        setError('')

        // Auto advance
        if (cleanValue && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !gameCode[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6)
        setGameCode(pastedData.split(''))
        if (pastedData.length === 6) {
            // Optional: submit or focus last
            inputRefs.current[5]?.focus()
        }
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
        if (step === 'nickname' && gameCode.join('')) {
            const fetchGameData = async () => {
                try {
                    const res = await fetch(`/api/game/${gameCode.join('')}`)
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

        const code = gameCode.join('')
        if (code.length !== 6) {
            setError('Please enter a complete 6-digit code')
            return
        }

        setPending(true)
        setError('')

        try {
            const res = await fetch(`/api/game/${code}`)
            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Invalid game code')
            }

            if (data.status !== 'WAITING') {
                throw new Error('Game has already started')
            }

            setGameData(data)

            // Show Splash Screen for transition
            setStep('splash')
            setTimeout(() => {
                setStep('nickname')
            }, 3000)

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred')
            // Shake effect could vary
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
                body: JSON.stringify({ gameCode: gameCode.join(''), nickname }),
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 409) {
                    setIsNicknameTaken(true)
                    setPending(false)
                    return
                }
                throw new Error(data.error || 'Failed to join game')
            }

            localStorage.setItem('currentPlayerId', data.playerId.toString())
            localStorage.setItem('currentNickname', data.nickname)

            router.push(`/live/${data.gameCode}`)

        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'Failed to join game')
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFAE5] flex flex-col items-center justify-between p-4 relative overflow-hidden font-sans transition-colors duration-300">
            <NicknameTakenModal
                isOpen={isNicknameTaken}
                onClose={() => setIsNicknameTaken(false)}
            />

            {/* Background - Light Mode */}
            <img
                src="/svg/light/background.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none dark:hidden"
                aria-hidden="true"
            />
            {/* Background - Dark Mode */}
            <img
                src="/svg/dark/background.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none hidden dark:block"
                aria-hidden="true"
            />

            {/* Top Header - Cards of Crisis Logo */}
            {step === 'code' && (
                <div className="w-full flex justify-center pt-8 relative z-20">
                    <img src="/svg/light/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-16 w-auto dark:hidden" />
                    <img src="/svg/dark/cards-of-crisis-logo.svg" alt="Cards of Crisis" className="h-16 w-auto hidden dark:block" />
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center justify-center flex-grow">

                {step === 'code' && (
                    <div className="animate-in fade-in zoom-in duration-500 w-full flex flex-col items-center">
                        <h1 className="text-[66.24px] leading-none font-[family-name:var(--font-perfectly-nostalgic)] text-[#3F3D39] dark:text-yellow-50 mb-4 tracking-tight">
                            Join The Game
                        </h1>
                        <p className="text-[27.27px] text-[#3F3D39] dark:text-yellow-50 mb-12 font-medium font-[family-name:var(--font-nohemi)]">
                            Enter An Invitation Code
                        </p>

                        <div className="flex justify-center gap-4 mb-14">
                            {[0, 1, 2, 3, 4, 5].map((index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el }}
                                    type="text"
                                    maxLength={1}
                                    value={gameCode[index] || ''}
                                    onChange={(e) => handleCodeInput(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    onPaste={index === 0 ? handlePaste : undefined}
                                    className="w-[57.44px] h-[68.93px] border-[4.92px] border-[#3F3D39] dark:border-yellow-50 rounded-[10.13px] text-center text-3xl font-bold bg-[#FDFAE5] dark:bg-yellow-50 text-[#3F3D39] shadow-sm focus:outline-none focus:ring-4 focus:ring-[#3F3D39]/20 transition-all uppercase placeholder-transparent transform hover:-translate-y-1 duration-200"
                                />
                            ))}
                        </div>

                        {error && (
                            <div className="text-red-500 font-bold mb-6 animate-pulse flex items-center justify-center gap-2">
                                <span className="bg-red-100 p-1 rounded-full"><span className="block w-2 h-2 bg-red-500 rounded-full" /></span>
                                {error}
                            </div>
                        )}

                        <button
                            onClick={() => handleValidateCode()}
                            disabled={pending}
                            className="bg-[#3F3D39] text-[#FDFAE5] dark:bg-yellow-50 dark:text-stone-700 text-[35.07px] font-[family-name:var(--font-perfectly-nostalgic)] px-20 py-4 rounded-[6.59px] hover:bg-black dark:hover:bg-white transition-all shadow-[0px_6px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[0px_8px_0px_0px_rgba(0,0,0,0.1)] active:shadow-none translate-y-0 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300 w-[168.32px] flex items-center justify-center h-[54.55px]"
                        >
                            {pending ? <Loader2 className="animate-spin mx-auto w-6 h-6" /> : 'Enter'}
                        </button>

                        <div className="mt-16 flex items-center justify-center gap-8 text-[#3F3D39] dark:text-yellow-50 font-sans tracking-wide">
                            <div className="flex flex-col md:flex-row items-center gap-1">
                                <span className="font-medium text-[15.58px]">Already have an account?</span>
                                <Link href="/auth/login" className="font-extrabold text-[15.58px] underline hover:text-black dark:hover:text-white">Login</Link>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-[#3F3D39] dark:bg-yellow-50 hidden md:block"></div>
                            <div className="flex flex-col md:flex-row items-center gap-1">
                                <span className="font-medium text-[15.58px]">Need an account?</span>
                                <Link href="/auth/register" className="font-extrabold text-[15.58px] underline hover:text-black dark:hover:text-white">Sign Up</Link>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'splash' && (
                    <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center scale-110 z-50">
                        <span className="text-5xl font-light font-[family-name:var(--font-nohemi)] text-[#3F3D39] dark:text-yellow-50 mb-4 text-center leading-[50px]">Welcome to</span>
                        <h1 className="text-8xl font-serif italic font-black text-[#3F3D39] dark:text-yellow-50 mb-12 leading-none text-center">Cards of Crisis</h1>

                        {/* New Color Bar Design */}
                        <div className="relative w-52 h-16 rounded-xl outline outline-[7px] outline-offset-[-3.5px] outline-[#3F3D39] dark:outline-yellow-50 flex items-center justify-center bg-transparent">
                            <div className="flex -space-x-4 items-center justify-center">
                                <div className="w-12 h-12 bg-[#399B2C] rounded-full rotate-90"></div>
                                <div className="w-12 h-12 bg-[#D9AD1F] rounded-full rotate-90"></div>
                                <div className="w-12 h-12 bg-[#4190A9] rounded-full rotate-90"></div>
                                <div className="w-12 h-12 bg-[#CA840C] rounded-full rotate-90"></div>
                                <div className="w-12 h-12 bg-[#CD302F] rounded-full rotate-90"></div>
                            </div>
                        </div>
                    </div>
                )}

                {step === 'nickname' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-lg flex flex-col items-center z-50">

                        <h2 className="text-[70px] leading-[66px] font-serif italic font-black text-[#3F3D39] dark:text-yellow-50 mb-12 text-center">Enter Your Name</h2>

                        <div className="w-full flex flex-col items-center gap-8">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Enter your name"
                                className="w-96 h-16 bg-[#FDFAE5] dark:bg-yellow-50 rounded-[10.13px] outline outline-[4.92px] outline-[#3F3D39] dark:outline-yellow-50 text-center text-3xl font-normal font-[family-name:var(--font-nohemi)] text-[#3F3D39] placeholder-[#3F3D39]/20 focus:outline-[#3F3D39] dark:text-stone-700 dark:placeholder-stone-700/20 dark:focus:outline-white transition-all"
                                maxLength={15}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && nickname && handleJoinGame()}
                            />

                            <button
                                onClick={handleJoinGame}
                                disabled={pending || !nickname}
                                className="w-44 h-14 bg-[#3F3D39] rounded-md text-[#FDFAE5] dark:bg-yellow-50 dark:text-stone-700 text-4xl font-black font-serif italic flex items-center justify-center hover:bg-black dark:hover:bg-white transition-all shadow-none disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300 pb-1"
                            >
                                {pending ? <Loader2 className="animate-spin w-8 h-8" /> : 'Enter'}
                            </button>
                        </div>

                        {error && (
                            <div className="text-red-500 font-bold mt-6">
                                {error}
                            </div>
                        )}

                        <div className="mt-8 text-[#3F3D39] dark:text-yellow-50 font-medium font-[family-name:var(--font-nohemi)] text-base leading-5">
                            Invite Code: {gameCode}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer Logos */}
            <div className="absolute bottom-6 right-6 opacity-80 pointer-events-none hidden md:flex items-center">
                <img src="/svg/light/combined-brand-logo.svg" alt="The Change Lab | Cards of Crisis" className="h-10 w-auto dark:hidden" />
                <img src="/svg/dark/combined-brand-logo.svg" alt="The Change Lab | Cards of Crisis" className="h-10 w-auto hidden dark:block" />
            </div>
            <div className="absolute bottom-6 left-6 opacity-80 pointer-events-none hidden md:block">
                <img src="/svg/light/dmwl-logo.svg" alt="Doing More With Less" className="h-10 w-auto dark:hidden" />
                <img src="/svg/dark/dmwl-logo.svg" alt="Doing More With Less" className="h-10 w-auto hidden dark:block" />
            </div>
        </div>
    )
}

export default JoinGamePage
