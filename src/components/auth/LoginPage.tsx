"use client"
import React, { useState, useActionState, useEffect, startTransition } from 'react'
import { Mail, Lock, LogIn, Loader2, UserPlus, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

import { BackgroundCard } from '@/components/auth/BackgroundCard'

const LoginPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const router = useRouter()

    // Form data state to persist values
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [state, formAction, pending] = useActionState(loginAction, {
        success: false,
        message: '',
        errors: {},
        redirectTo: null
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    useEffect(() => {
        if (!state.success && state.message && Object.keys(state.errors).length > 0) {
            setFormData(prev => ({
                ...prev,
                password: '',
            }))
        }
    }, [state.success, state.message, state.errors])

    useEffect(() => {
        if (state.success && state.redirectTo) {
            router.push(state.redirectTo)
        }
    }, [state.success, state.redirectTo, router])

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formDataObj = new FormData(form)
        startTransition(() => {
            formAction(formDataObj)
        })
    }
    return (
        <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#3E3E3C] flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">

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

            {/* Top Logo */}
            <div className="absolute top-10 flex flex-col items-center gap-1">
                <h2 className="text-4xl font-serif italic text-black/80 dark:text-[#FDFBF7]">Cards of Crisis</h2>
                <div className="flex -space-x-1.5 border-[3px] border-[#333] dark:border-[#FDFBF7] px-3 py-1.5 rounded-full bg-transparent items-center">
                    <div className="w-4 h-4 rounded-full bg-[#399B2C] z-0"></div>
                    <div className="w-4 h-4 rounded-full bg-[#D9AD1F] z-10"></div>
                    <div className="w-4 h-4 rounded-full bg-[#4190A9] z-20"></div>
                    <div className="w-4 h-4 rounded-full bg-[#CA840C] z-30"></div>
                    <div className="w-4 h-4 rounded-full bg-[#CD302F] z-40"></div>
                </div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500 mt-12 bg-white/80 dark:bg-[#FDFBF7] backdrop-blur-sm p-8 rounded-2xl border-[3px] border-[#333] shadow-xl transition-colors duration-300">
                <h1 className="text-5xl font-serif text-[#333] mb-2 text-center">Login</h1>
                <p className="text-[#666] font-bold text-center mb-8 uppercase tracking-widest text-sm">Welcome Back</p>

                {/* Success Message */}
                {state.success && (
                    <div className="mb-6 p-4 bg-green-50 rounded-xl border-2 border-green-500 text-green-700 font-bold flex items-center gap-2">
                        <UserPlus size={20} />
                        {state.message}
                    </div>
                )}

                {/* General Error Message */}
                {!state.success && state.message && Object.keys(state.errors).length === 0 && (
                    <div className="mb-6 p-4 bg-red-50 rounded-xl border-2 border-red-500 text-red-700 font-bold flex items-center gap-2">
                        <AlertTriangle size={20} />
                        {state.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Email Input */}
                    <div className="space-y-1">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-300 z-10">
                                <Mail size={24} strokeWidth={2.5} />
                            </div>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="EMAIL ADDRESS"
                                className={`w-full pl-12 pr-4 py-4 border-[3px] border-[#333] rounded-xl font-bold text-base bg-white focus:outline-none focus:ring-4 focus:ring-black/10 transition-all uppercase placeholder-gray-400 text-[#333] ${(state.errors as Record<string, string>).email ? 'border-red-500' : ''}`}
                            />
                        </div>
                        {(state.errors as Record<string, string>).email && (
                            <div className="flex items-center gap-2 pl-2 mt-1">
                                <AlertTriangle size={14} className="text-red-500" />
                                <p className="text-red-500 font-bold text-sm">{(state.errors as Record<string, string>).email}</p>
                            </div>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors duration-300 z-10">
                                <Lock size={24} strokeWidth={2.5} />
                            </div>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="PASSWORD"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-12 py-4 border-[3px] border-[#333] rounded-xl font-bold text-base bg-white focus:outline-none focus:ring-4 focus:ring-black/10 transition-all uppercase placeholder-gray-400 text-[#333] ${(state.errors as Record<string, string>).password ? 'border-red-500' : ''}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-black transition-colors z-10 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                            </button>
                        </div>
                        {(state.errors as Record<string, string>).password && (
                            <div className="flex items-center gap-2 pl-2 mt-1">
                                <AlertTriangle size={14} className="text-red-500" />
                                <p className="text-red-500 font-bold text-sm">{(state.errors as Record<string, string>).password}</p>
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={pending || state.success}
                        className="w-full bg-[#333] text-white text-xl font-serif italic py-4 rounded-xl hover:bg-black transition-colors shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {pending ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Logging in...</span>
                            </>
                        ) : state.success ? (
                            <>
                                <Loader2 size={24} className="animate-spin" />
                                <span>Redirecting...</span>
                            </>
                        ) : (
                            <>
                                <span>Enter</span>
                            </>
                        )}
                    </button>
                </form>

                {/* Forgot Password */}
                <div className="mt-4 text-center">
                    <button className="text-sm font-bold text-[#666] hover:text-black hover:underline transition-colors duration-200">
                        FORGOT PASSWORD?
                    </button>
                </div>

                {/* Register Link */}
                <div className="mt-8 pt-6 border-t-2 border-[#333]/10">
                    <p className="text-center text-sm font-bold text-[#666] mb-4 uppercase tracking-wider">
                        Don&apos;t have an account?
                    </p>
                    <Link
                        href="/auth/register"
                        className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl font-bold text-base border-[3px] border-[#333] text-[#333] hover:bg-[#333] hover:text-white transition-all duration-300 font-serif italic"
                    >
                        <UserPlus size={20} strokeWidth={2.5} />
                        Sign Up
                    </Link>
                </div>
            </div>

            {/* Bottom Footer Logos */}
            <div className="absolute bottom-6 right-6 flex items-center gap-6 opacity-80 pointer-events-none hidden md:flex">
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
                <div className="h-8 w-[1px] bg-[#333] dark:bg-[#FDFBF7]"></div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-serif italic font-bold text-[#333] dark:text-[#FDFBF7]">Cards of Crisis</span>
                    <div className="flex -space-x-1 mt-0.5 border-[2px] border-[#333] dark:border-[#FDFBF7] px-1.5 py-0.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-[#399B2C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#D9AD1F] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#4190A9] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CA840C] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#CD302F] rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-6 left-6 opacity-80 pointer-events-none hidden md:block">
                <div className="flex items-center gap-1">
                    {/* Left Triangle - Points Left */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                    <div className="font-black text-[#333] dark:text-[#FDFBF7] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                        <span className="self-start">Doing</span>
                        <span className="self-end">More With</span>
                        <span className="self-end">Less</span>
                    </div>
                    {/* Right Triangle - Points Right */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFBF7]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
