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

// Helper component for the background cards to ensure high fidelity
const BackgroundCard = ({
    color,
    title,
    description,
    options,
    className,
    mins = "5 Mins",
    category = "Society",
    pillColors = ["#4CAF50", "#EBA937", "#2196F3", "#ED8936", "#F44336"]
}: {
    color: string,
    title: string,
    description: string,
    options: { letter: string, text: string, cost: number, stats: number[] }[],
    className?: string,
    mins?: string,
    category?: string,
    pillColors?: string[]
}) => (
    <div className={`w-56 bg-[${color}] rounded-[2.5rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5 ${className}`} style={{ backgroundColor: color }}>
        {/* Top Decor Pill */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-1.5 rounded-b-[1.2rem] shadow-sm flex gap-1 z-20">
            {pillColors.map((c, i) => (
                <div key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
            ))}
        </div>

        <div className="pt-9 pb-5 px-3.5 w-full flex flex-col h-full font-sans">
            {/* Title */}
            <h3 className="font-serif italic text-2xl text-[#1a1a1a]/90 leading-[1] text-center mb-1.5 drop-shadow-sm min-h-[3rem] flex items-center justify-center pt-2">
                {title}
            </h3>

            {/* Description */}
            <p className="font-sans text-[0.6rem] leading-tight text-[#1a1a1a]/80 text-center mb-2 line-clamp-3 font-medium px-1">
                {description}
            </p>

            {/* Response Options Header */}
            <div className="flex justify-between items-center mb-1 px-1">
                <span className="font-serif italic text-[0.6rem] text-[#1a1a1a]/60">Response Options</span>
                <span className="font-serif italic text-[0.6rem] text-[#1a1a1a]/60">{mins}</span>
            </div>


            {/* Options */}
            <div className="space-y-2 flex-1 mt-1">
                {options.map((opt, i) => (
                    <div key={i} className="flex flex-col relative pb-0.5">
                        {/* Cost Pill Absolute - Positioned top right of the white box */}
                        {opt.cost !== 0 && (
                            <div className="self-end mb-[1px] bg-black/10 px-1 py-[1px] rounded text-[0.4rem] font-black text-[#1a1a1a]/80 font-sans tracking-tight">
                                {opt.cost > 0 ? '+' : ''}{opt.cost}
                            </div>
                        )}
                        {!opt.cost && <div className="h-[14px]"></div>} {/* Spacer if no cost to align */}

                        <div className="flex bg-[#FDFBF7] rounded overflow-hidden shadow-sm min-h-[2.5rem] items-stretch">
                            {/* Letter Box */}
                            <div className="w-6 flex items-center justify-center shrink-0" style={{ backgroundColor: color, filter: 'brightness(0.95)' }}>
                                <span className="font-serif italic text-white font-bold text-sm">{opt.letter}</span>
                            </div>
                            {/* Text */}
                            <div className="flex-1 px-2 py-1.5 flex items-center">
                                <span className="text-[0.5rem] font-semibold text-[#1a1a1a] leading-tight text-left">{opt.text}</span>
                            </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-2 px-1 mt-0.5">
                            {[DollarSign, Heart, Clock, Home, Settings].map((Icon, idx) => (
                                <div key={idx} className="flex items-center gap-0.5">
                                    <div className="p-[1px] rounded-full bg-black/10 flex items-center justify-center">
                                        <Icon size={5} strokeWidth={3} className="text-[#1a1a1a]/70" />
                                    </div>
                                    <span className="text-[0.4rem] font-bold text-[#1a1a1a]/70">
                                        {opt.stats[idx] > 0 ? '+' : ''}{opt.stats[idx]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            {/* Footer Category */}
            <div className="mt-auto pt-1 text-center opacity-60">
                <span className="font-serif text-[0.6rem] tracking-widest uppercase text-[#1a1a1a]">{category}</span>
            </div>
        </div>
    </div>
)

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
            <div className="absolute top-[-5%] left-[2%] transform -rotate-12 opacity-90 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#4ea342"
                    title="Toxic Waste Spill in River"
                    description="Residents along the river fall ill after a factory leaks toxic chemicals, threatening crops and community health."
                    mins="3 Mins"
                    category="Environmental"
                    options={[
                        { letter: 'A', text: 'Deploy emergency cleanup crews with advanced equipment.', cost: -1000, stats: [-3, +3, +2, +1, 0] },
                        { letter: 'B', text: 'Relocate communities & wait for natural recovery.', cost: -400, stats: [-2, -1, -1, -1, 0] },
                        { letter: 'C', text: 'Ignore and let the factory keep operating.', cost: +200, stats: [+1, -3, -5, -2, 0] }
                    ]}
                    className="h-[19rem] w-48"
                />
            </div>

            <div className="absolute bottom-[5%] left-[-5%] transform rotate-12 opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#4A7C8C"
                    title="Urban Decay"
                    description="A once-prosperous neighborhood has fallen into disrepair, with abandoned buildings and rising crime."
                    mins="5 Mins"
                    category="Society"
                    options={[
                        { letter: 'A', text: 'Increase police patrols and fund a few small renovation projects.', cost: -300, stats: [-1, +2, 0, +1, +1] },
                        { letter: 'B', text: 'Launch a community project to restore the area and provide tax breaks for new businesses.', cost: -600, stats: [+3, +5, +1, +4, +3] },
                        { letter: 'C', text: 'Sell the land to a large developer for a single, massive project.', cost: +500, stats: [+2, -3, -1, -2, +2] }
                    ]}
                    className="h-[19rem] w-48"
                />
            </div>

            <div className="absolute top-[20%] right-[-5%] transform rotate-[15deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#D69E2E"
                    title="City Housing Crisis"
                    description="A city's population is growing fast, leading to a shortage of housing and sky-high rents."
                    mins="4 Mins"
                    category="Economic"
                    options={[
                        { letter: 'A', text: 'Offer tax breaks to developers who build new housing.', cost: -600, stats: [+1, +1, 0, +1, 0] },
                        { letter: 'B', text: 'Fund a massive public housing project and change zoning laws.', cost: -1500, stats: [+2, +5, +2, +3, +4] },
                        { letter: 'C', text: 'Let the market decide and do not interfere', cost: 0, stats: [-2, -4, 0, -2, 0] }
                    ]}
                    className="h-[19rem] w-48"
                />
            </div>

            <div className="absolute bottom-[10%] right-[-5%] transform -rotate-[20deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#E53E3E"
                    title="Climate Summit"
                    description="International pressure to reduce carbon emissions is mounting."
                    mins="6 Mins"
                    category="Environmental"
                    options={[
                        { letter: 'A', text: 'Commit to net-zero emissions by 2050, investing heavily in green tech.', cost: -1000, stats: [0, +5, +5, 0, +2] },
                        { letter: 'B', text: 'Invest in renewable energy sources and carbon capture technologies.', cost: -500, stats: [+2, +3, +4, +1, 0] },
                        { letter: 'C', text: 'Withdraw from international climate agreements.', cost: +300, stats: [+1, -3, -5, -1, 0] }
                    ]}
                    className="h-[19rem] w-48"
                />
            </div>

            <div className="absolute bottom-[-10%] right-[20%] transform -rotate-[10deg] opacity-70 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-700">
                <BackgroundCard
                    color="#D68C22"
                    title="Deteriorating Water Pipes"
                    description="An old city water system has frequent pipe bursts, leading to widespread leaks and water waste."
                    mins="3 Mins"
                    category="Infrastructure"
                    options={[
                        { letter: 'A', text: 'Replace broken pipes with modern materials.', cost: -800, stats: [+2, +1, 0, 0, +3] },
                        { letter: 'B', text: 'Fund a complete overhaul of the entire water grid.', cost: -2000, stats: [-2, +4, +1, +3, +5] },
                        { letter: 'C', text: 'Use temporary patches and encourage water conservation.', cost: -100, stats: [-1, -2, -1, -2, -3] }
                    ]}
                    className="h-[19rem] w-48"
                />
            </div>


            {/* Top Logo - Only show when NOT in splash or nickname step (nickname has its own logo) */}
            {step === 'code' && (
                <div className="absolute top-10 flex flex-col items-center gap-1">
                    <h2 className="text-4xl font-serif italic text-black/80 dark:text-[#FDFAE5]">Cards of Crisis</h2>
                    {/* 5 Color bar with border */}
                    <div className="flex -space-x-1 border-[3px] border-[#333] dark:border-[#FDFAE5] px-3 py-1.5 rounded-full bg-transparent items-center">
                        <div className="w-4 h-4 rounded-full bg-[#4CAF50] border border-white/0 z-0"></div>
                        <div className="w-4 h-4 rounded-full bg-[#EBA937] border border-white/0 z-10"></div>
                        <div className="w-4 h-4 rounded-full bg-[#2196F3] border border-white/0 z-20"></div>
                        <div className="w-4 h-4 rounded-full bg-[#ED8936] border border-white/0 z-30"></div>
                        <div className="w-4 h-4 rounded-full bg-[#F44336] border border-white/0 z-40"></div>
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-2xl text-center flex flex-col items-center justify-center min-h-[50vh]">

                {step === 'code' && (
                    <div className="animate-in fade-in zoom-in duration-500 w-full">
                        <h1 className="text-6xl md:text-7xl font-serif text-[#333] dark:text-[#FDFAE5] mb-4 tracking-tight">
                            Join The Game
                        </h1>
                        <p className="text-xl text-[#333] dark:text-[#FDFAE5] mb-10 font-medium font-sans">
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
                                    className="w-14 h-16 md:w-20 md:h-24 border-[3px] border-[#333] dark:border-[#FDFAE5] rounded-2xl text-center text-3xl md:text-5xl font-bold bg-[#FDFBF7] dark:bg-[#FDFAE5] dark:text-[#3E3E3C] text-[#333] shadow-sm focus:outline-none focus:ring-0 focus:border-black dark:focus:border-[#FDFAE5] transition-all uppercase placeholder-transparent transform hover:-translate-y-1 duration-200"
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
                            className="bg-[#333] dark:bg-[#FDFAE5] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl md:text-4xl font-serif px-16 py-4 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed italic transform hover:scale-105 duration-300"
                        >
                            {pending ? <Loader2 className="animate-spin mx-auto w-8 h-8" /> : 'Enter'}
                        </button>

                        <div className="mt-16 flex items-center justify-center gap-3 text-[#333] dark:text-[#FDFAE5] font-bold text-sm md:text-base font-sans tracking-wide">
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
                        <span className="text-3xl font-sans text-[#333] dark:text-[#FDFAE5] mb-4 tracking-tight">Welcome to</span>
                        <h1 className="text-8xl font-serif italic text-[#333] dark:text-[#FDFAE5] mb-6 leading-none">Cards of Crisis</h1>

                        {/* 5 Color bar with border - Large */}
                        <div className="flex -space-x-1.5 border-[4px] border-[#333] dark:border-[#FDFAE5] px-5 py-2.5 rounded-full bg-transparent items-center">
                            <div className="w-6 h-6 rounded-full bg-[#4CAF50] border border-white/0 z-0"></div>
                            <div className="w-6 h-6 rounded-full bg-[#EBA937] border border-white/0 z-10"></div>
                            <div className="w-6 h-6 rounded-full bg-[#2196F3] border border-white/0 z-20"></div>
                            <div className="w-6 h-6 rounded-full bg-[#ED8936] border border-white/0 z-30"></div>
                            <div className="w-6 h-6 rounded-full bg-[#F44336] border border-white/0 z-40"></div>
                        </div>
                    </div>
                )}

                {step === 'nickname' && (
                    <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full max-w-lg flex flex-col items-center">

                        {/* Top Logo Small */}
                        <div className="flex flex-col items-center gap-1 mb-12">
                            <h2 className="text-2xl font-serif italic text-black/80 dark:text-[#FDFAE5]">Cards of Crisis</h2>
                            <div className="flex -space-x-0.5 border-[2px] border-[#333] dark:border-[#FDFAE5] px-2 py-1 rounded-full bg-transparent items-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50] z-0"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937] z-10"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3] z-20"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936] z-30"></div>
                                <div className="w-2.5 h-2.5 rounded-full bg-[#F44336] z-40"></div>
                            </div>
                        </div>

                        <h2 className="text-6xl font-serif italic text-[#333] dark:text-[#FDFAE5] mb-10 text-center leading-tight">Enter Your Name</h2>

                        <div className="w-full relative group">
                            <input
                                type="text"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                placeholder="Enter your name"
                                className="w-full px-8 py-5 border-[3px] border-[#333] dark:border-[#FDFAE5] rounded-2xl text-center text-2xl font-bold bg-[#FDFBF7] dark:bg-[#FDFAE5] dark:text-[#3E3E3C] mb-8 placeholder-[#333]/30 dark:placeholder-[#3E3E3C]/30 focus:outline-none focus:ring-4 focus:ring-black/5 dark:focus:ring-[#FDFAE5]/20 transition-all"
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
                            className="bg-[#333] dark:bg-[#FDFAE5] text-[#FDFBF7] dark:text-[#3E3E3C] text-3xl font-serif italic px-20 py-4 rounded-xl hover:bg-black dark:hover:bg-white transition-all shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 duration-300"
                        >
                            {pending ? <Loader2 className="animate-spin mx-auto w-8 h-8" /> : 'Enter'}
                        </button>

                        <div className="mt-8 text-[#333]/60 dark:text-[#FDFAE5]/60 font-bold font-sans tracking-wide text-sm">
                            Invite Code: {gameCode}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Footer Logos */}
            <div className="absolute bottom-8 right-8 flex items-center gap-6 opacity-90 pointer-events-none hidden md:flex">
                <div className="flex flex-col items-center">
                    <div className="w-8 h-8 rotate-45 bg-[#EBA937] overflow-hidden grid grid-cols-2 shadow-sm">
                        <div className="bg-[#EBA937]"></div>
                        <div className="bg-white/40 rounded-full scale-150 transform -translate-x-1 translate-y-1"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#333] dark:text-[#FDFAE5] mt-1.5 leading-tight text-center font-sans">the<br />change<br />lab</span>
                </div>
                <div className="h-10 w-[1.5px] bg-[#333]/20 dark:bg-[#FDFAE5]/20"></div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-serif italic font-bold text-[#1a1a1a] dark:text-[#FDFAE5]">Cards of Crisis</span>
                    <div className="flex gap-1 mt-1 border-[2px] border-[#333] dark:border-[#FDFAE5] px-1.5 py-0.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#EBA937] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#2196F3] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#ED8936] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#F44336] rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-8 left-8 opacity-90 pointer-events-none hidden md:block">
                <div className="flex items-center gap-1">
                    {/* Left Triangle - Points Left */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFAE5]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>

                    <div className="font-black text-[#333] dark:text-[#FDFAE5] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                        <span className="self-start">Doing</span>
                        <span className="self-end">More With</span>
                        <span className="self-end">Less</span>
                    </div>

                    {/* Right Triangle - Points Right */}
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFAE5]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default JoinGamePage
