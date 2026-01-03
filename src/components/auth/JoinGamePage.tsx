"use client"
import React, { useState, useEffect, useRef } from 'react'
import { Loader2, DollarSign, Heart, Clock, Home, Settings } from 'lucide-react'
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

import { BackgroundCard } from '@/components/auth/BackgroundCard'

// Removed local BackgroundCard definition


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

        } catch (err: any) {
            setError(err.message)
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

            router.push(`/play/${data.gameCode}`)

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setError(err.message)
        } finally {
            setPending(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
            <NicknameTakenModal
                isOpen={isNicknameTaken}
                onClose={() => setIsNicknameTaken(false)}
            />

            {/* Background Grain */}
            <div className="absolute inset-0 bg-grain pointer-events-none opacity-40 mix-blend-overlay"></div>


            {/* Decorative Elements - High Fidelity Background Cards */}
            {/* Decorative Elements - High Fidelity Background Cards */}
            <div className="absolute top-[-108px] left-[137px] transform rotate-[35.44deg] opacity-90 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#399B2C"
                    title="Toxic Waste Spill in River"
                    description="Residents along the river fall ill after a factory leaks toxic chemicals, threatening crops and community health."
                    mins="3 Mins"
                    category="Environmental"
                    options={[
                        { letter: 'A', text: 'Deploy emergency cleanup crews with advanced equipment.', cost: -1000, stats: [-3, +3, +2, +1, 0] },
                        { letter: 'B', text: 'Relocate communities & wait for natural recovery.', cost: -400, stats: [-2, -1, -1, -1, 0] },
                        { letter: 'C', text: 'Ignore and let the factory keep operating.', cost: +200, stats: [+1, -3, -5, -2, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[391px] left-[-46px] transform -rotate-[18.3deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#4190A9"
                    title="Urban Decay"
                    description="A once-prosperous neighborhood has fallen into disrepair, with abandoned buildings and rising crime."
                    mins="5 Mins"
                    category="Society"
                    options={[
                        { letter: 'A', text: 'Increase police patrols and fund a few small renovation projects.', cost: -300, stats: [-1, +2, 0, +1, +1] },
                        { letter: 'B', text: 'Launch a community project to restore the area and provide tax breaks for new businesses.', cost: -600, stats: [+3, +5, +1, +4, +3] },
                        { letter: 'C', text: 'Sell the land to a large developer for a single, massive project.', cost: +500, stats: [+2, -3, -1, -2, +2] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[50px] left-[1079px] transform -rotate-[55.79deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#D9AD1F"
                    title="City Housing Crisis"
                    description="A city's population is growing fast, leading to a shortage of housing and sky-high rents."
                    mins="4 Mins"
                    category="Economic"
                    options={[
                        { letter: 'A', text: 'Offer tax breaks to developers who build new housing.', cost: -600, stats: [+1, +1, 0, +1, 0] },
                        { letter: 'B', text: 'Fund a massive public housing project and change zoning laws.', cost: -1500, stats: [+2, +5, +2, +3, +4] },
                        { letter: 'C', text: 'Let the market decide and do not interfere', cost: 0, stats: [-2, -4, 0, -2, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[485px] left-[1219px] transform -rotate-[127.88deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#CD302F"
                    title="International Climate Summit"
                    description="Your country is asked to raise its climate commitments at a global summit."
                    mins="5 Mins"
                    category="Political"
                    options={[
                        { letter: 'A', text: 'Commit to bold new targets and invest heavily in renewables.', cost: -1200, stats: [-1, +2, +5, +4, +3] },
                        { letter: 'B', text: 'Pledge modest targets with limited sustainable projects.', cost: -600, stats: [+1, +1, +2, +1, 0] },
                        { letter: 'C', text: 'Refuse new pledges and defend domestic industries.', cost: +400, stats: [+2, -2, -4, -3, 0] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>

            <div className="absolute top-[697px] left-[535px] transform rotate-[62.31deg] opacity-70 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700 z-0">
                <BackgroundCard
                    color="#CA840C"
                    title="Deteriorating Water Pipes"
                    description="An old city water system has frequent pipe bursts, leading to widespread leaks and water waste."
                    mins="3 Mins"
                    category="Infrastructure"
                    options={[
                        { letter: 'A', text: 'Replace broken pipes with modern materials.', cost: -800, stats: [+2, +1, 0, 0, +3] },
                        { letter: 'B', text: 'Fund a complete overhaul of the entire water grid.', cost: -2000, stats: [-2, +4, +1, +3, +5] },
                        { letter: 'C', text: 'Use temporary patches and encourage water conservation.', cost: -100, stats: [-1, -2, -1, -2, -3] }
                    ]}
                    className="h-[259px] w-[185px]"
                />
            </div>


            {/* Top Logo - Only show when NOT in splash or nickname step (nickname has its own logo) */}
            {step === 'code' && (
                <div className="absolute top-10 flex flex-col items-center gap-1">
                    <h2 className="text-4xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-1.5 border-[3px] border-[#333] dark:border-[#FDFBF7] px-3 py-1.5 rounded-full bg-transparent items-center">
                        <div className="w-4 h-4 rounded-full bg-[#399B2C] border border-white/0 z-0"></div>
                        <div className="w-4 h-4 rounded-full bg-[#D9AD1F] border border-white/0 z-10"></div>
                        <div className="w-4 h-4 rounded-full bg-[#4190A9] border border-white/0 z-20"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CA840C] border border-white/0 z-30"></div>
                        <div className="w-4 h-4 rounded-full bg-[#CD302F] border border-white/0 z-40"></div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center justify-center min-h-[50vh]">

                {step === 'code' && (
                    <div className="animate-in fade-in zoom-in duration-500 w-full">
                        <h1 className="text-6xl md:text-7xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-4 tracking-tight">
                            Join The Game
                        </h1>
                        <p className="text-xl text-[#333] dark:text-[#FDFBF7] mb-10 font-medium font-sans">
                            Enter An Invitation Code
                        </p>

                        <div className="flex justify-center gap-3 mb-12">
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

                                    className="w-14 h-16 md:w-20 md:h-24 border-[3px] border-[#333] dark:border-[#3E3E3C] rounded-2xl text-center text-3xl md:text-5xl font-bold bg-[#FDFBF7] dark:bg-[#FDFBF7] dark:text-[#3E3E3C] text-[#333] shadow-sm focus:outline-none focus:ring-0 focus:border-black dark:focus:border-[#3E3E3C] transition-all uppercase placeholder-transparent transform hover:-translate-y-1 duration-200"
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
                            className="bg-[#333] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl md:text-4xl font-serif italic px-16 py-4 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
                        >
                            {pending ? <Loader2 className="animate-spin mx-auto w-8 h-8" /> : 'Enter'}
                        </button>

                        <div className="mt-16 flex items-center justify-center gap-3 text-[#333] dark:text-[#FDFBF7] font-bold text-sm md:text-base font-sans tracking-wide">
                            <span className="opacity-70">Already have an account?</span>
                            <Link href="/auth/login" className="font-black hover:underline opacity-100">Login</Link>
                            <span className="mx-2 text-xl opacity-40">•</span>
                            <span className="opacity-70">Need an account?</span>
                            <Link href="/auth/register" className="font-black hover:underline opacity-100">Sign Up</Link>
                        </div>
                    </div>
                )}

                {step === 'splash' && (
                    <div className="animate-in fade-in zoom-in duration-700 flex flex-col items-center justify-center scale-110">
                        <span className="text-3xl font-sans text-[#333] dark:text-[#FDFBF7] mb-4 tracking-tight">Welcome to</span>
                        <h1 className="text-8xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-6 leading-none">Cards of Crisis</h1>

                        {/* 5 Color bar with border - Large */}
                        <div className="flex -space-x-2 border-[4px] border-[#333] dark:border-[#FDFBF7] px-5 py-2.5 rounded-full bg-transparent items-center">
                            <div className="w-6 h-6 rounded-full bg-[#399B2C] border border-white/0 z-0"></div>
                            <div className="w-6 h-6 rounded-full bg-[#D9AD1F] border border-white/0 z-10"></div>
                            <div className="w-6 h-6 rounded-full bg-[#4190A9] border border-white/0 z-20"></div>
                            <div className="w-6 h-6 rounded-full bg-[#CA840C] border border-white/0 z-30"></div>
                            <div className="w-6 h-6 rounded-full bg-[#CD302F] border border-white/0 z-40"></div>
                        </div>
                    </div>
                )}

                {step === 'nickname' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-lg flex flex-col items-center">

                        {/* Top Logo Small */}
                        <div className="flex flex-col items-center gap-1 mb-12">
                            <h2 className="text-2xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                            <div className="flex -space-x-1 border-[2px] border-[#333] dark:border-[#FDFBF7] px-2 py-1 rounded-full bg-transparent items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#399B2C] z-0"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#D9AD1F] z-10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4190A9] z-20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#CA840C] z-30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#CD302F] z-40"></div>
                            </div>
                        </div>

                        <h2 className="text-6xl font-serif italic text-[#333] dark:text-[#FDFBF7] mb-10 text-center leading-tight">Enter Your Name</h2>

                        <div className="w-full relative group">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-8 py-5 border-[3px] border-[#333] dark:border-[#FDFBF7] rounded-2xl text-center text-2xl font-bold bg-[#FDFBF7] dark:bg-[#FDFBF7] dark:text-[#3E3E3C] mb-8 placeholder-[#333]/30 dark:placeholder-[#3E3E3C]/30 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-[#FDFBF7]/20 transition-all"
                                maxLength={15}
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && nickname && handleJoinGame()}
                            />
                        </div>

                        {error && (
                            <div className="text-red-500 font-bold mb-6">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleJoinGame}
                            disabled={pending || !nickname}
                            className="bg-[#333] dark:bg-[#FDFBF7] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl font-serif italic px-20 py-4 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
                        >
                            {pending ? <Loader2 className="animate-spin mx-auto w-8 h-8" /> : 'Enter'}
                        </button>

                        <div className="mt-8 text-[#333]/60 dark:text-[#FDFBF7]/60 font-bold font-sans tracking-wide text-sm">
                            Invite Code: {gameCode}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer Logos */}
            <div className="absolute bottom-8 right-8 flex items-center gap-6 opacity-90 pointer-events-none hidden md:flex">
                <div className="flex flex-col items-center">
                    <div className="relative w-8 h-8 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-[#FCD34D] drop-shadow-sm">
                            <path d="M12 2C13.1 2 14 2.9 14 4V10H20C21.1 10 22 10.9 22 12C22 13.1 21.1 14 20 14H14V20C14 21.1 13.1 22 12 22C10.9 22 10 21.1 10 20V14H4C2.9 14 2 13.1 2 12C2 10.9 2.9 10 4 10H10V4C10 2.9 10.9 2 12 2Z" fill="currentColor" />
                            <circle cx="12" cy="12" r="2" className="fill-[#FDFBF7] dark:fill-[#3E3E3C]" />
                        </svg>
                    </div>
                    <div className="text-[10px] font-bold text-[#333] dark:text-[#FDFBF7] mt-1 leading-[0.9] text-left font-[family-name:var(--font-pixel)] tracking-wide">
                        the<br />change<br />lab
                    </div>
                </div>
                <div className="h-10 w-[1.5px] bg-[#333]/20 dark:bg-[#FDFBF7]/20"></div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-serif italic font-bold text-[#1a1a1a] dark:text-[#FDFBF7]">Cards of Crisis</span>
                    <div className="flex -space-x-1 mt-1 border-[2px] border-[#333] dark:border-[#FDFBF7] px-1.5 py-0.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-[#399B2C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#D9AD1F] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#4190A9] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CA840C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CD302F] rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 left-8 opacity-90 pointer-events-none hidden md:block">
                <div className="flex items-center gap-1">
                    {/* Left Triangle - Points Left */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>

                    <div className="font-black text-[#333] dark:text-[#FDFBF7] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                        <span className="self-start">Doing</span>
                        <span className="self-end">More With</span>
                        <span className="self-end">Less</span>
                    </div>

                    {/* Right Triangle - Points Right */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default JoinGamePage
