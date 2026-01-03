"use client"
import React, { useState, useActionState, useEffect, startTransition } from 'react'
import { Mail, Lock, LogIn, Loader2, UserPlus, Eye, EyeOff, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { loginAction } from '@/app/actions/auth'
import { useRouter } from 'next/navigation'

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

            {/* Decorative Elements - Floating Cards matching /play */}
            <div className="absolute top-[10%] left-[10%] transform -rotate-12 opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-500">
                {/* Green Card - Toxic Waste */}
                <div className="w-56 h-80 bg-[#4ea342] rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5">
                    {/* Top Pill */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-4 py-2 rounded-b-[1.2rem] shadow-sm flex gap-1.5 z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F44336]" />
                    </div>
                    <div className="mt-12 text-center px-4 w-full">
                        <h3 className="font-serif italic text-3xl text-[#1a1a1a]/90 leading-[1.1] drop-shadow-sm">Toxic Waste</h3>
                        <div className="mt-4 space-y-2 opacity-50">
                            <div className="h-2 w-3/4 mx-auto bg-black/10 rounded-full"></div>
                            <div className="h-2 w-1/2 mx-auto bg-black/10 rounded-full"></div>
                        </div>
                        {/* Mock Options */}
                        <div className="mt-8 space-y-2 px-2 opacity-60">
                            <div className="flex items-center gap-2 bg-[#FDFBF7]/90 p-1.5 rounded-lg">
                                <div className="w-6 h-6 bg-[#4ea342] rounded flex items-center justify-center text-white font-serif font-bold text-xs">A</div>
                                <div className="h-1.5 w-16 bg-black/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-[10%] left-[5%] transform rotate-6 opacity-60 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-500">
                {/* Blue Card - Urban Decay */}
                <div className="w-48 h-72 bg-[#4A7C8C] rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5">
                    {/* Top Pill */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-1.5 rounded-b-[1rem] shadow-sm flex gap-1 z-20">
                        <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                        <div className="w-2 h-2 rounded-full bg-[#EBA937]" />
                        <div className="w-2 h-2 rounded-full bg-[#2196F3]" />
                        <div className="w-2 h-2 rounded-full bg-[#ED8936]" />
                        <div className="w-2 h-2 rounded-full bg-[#F44336]" />
                    </div>
                    <div className="mt-10 text-center px-4 w-full">
                        <h3 className="font-serif italic text-2xl text-[#1a1a1a]/90 leading-[1.1]">Urban Decay</h3>
                        <div className="mt-3 space-y-1.5 opacity-40">
                            <div className="h-1.5 w-2/3 mx-auto bg-black/10 rounded-full"></div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute top-[15%] right-[8%] transform rotate-[15deg] opacity-80 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-500">
                {/* Yellow Card - Housing Crisis */}
                <div className="w-52 h-72 bg-[#D69E2E] rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5">
                    {/* Top Pill */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-4 py-2 rounded-b-[1.2rem] shadow-sm flex gap-1.5 z-20">
                        <div className="w-2.5 h-2.5 rounded-full bg-[#4CAF50]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#EBA937]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#2196F3]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#ED8936]" />
                        <div className="w-2.5 h-2.5 rounded-full bg-[#F44336]" />
                    </div>
                    <div className="mt-10 text-center px-4 w-full">
                        <h3 className="font-serif italic text-2xl text-[#1a1a1a]/90 leading-[1.1]">Housing Crisis</h3>
                        <div className="mt-3 space-y-1.5 opacity-40">
                            <div className="h-1.5 w-3/4 mx-auto bg-black/10 rounded-full"></div>
                        </div>
                        {/* Mock Options */}
                        <div className="mt-6 space-y-1.5 px-3 opacity-50">
                            <div className="flex items-center gap-2 bg-[#FDFBF7]/90 p-1 rounded">
                                <div className="w-4 h-4 bg-[#D69E2E] rounded text-[8px] flex items-center justify-center text-white font-serif font-bold">A</div>
                                <div className="h-1 w-12 bg-black/20 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-[18%] right-[5%] transform -rotate-12 opacity-70 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-500">
                {/* Red Card - Climate Summit */}
                <div className="w-48 h-64 bg-[#E53E3E] rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5">
                    {/* Top Pill */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-1.5 rounded-b-[1rem] shadow-sm flex gap-1 z-20">
                        <div className="w-2 h-2 rounded-full bg-[#4CAF50]" />
                        <div className="w-2 h-2 rounded-full bg-[#EBA937]" />
                        <div className="w-2 h-2 rounded-full bg-[#2196F3]" />
                        <div className="w-2 h-2 rounded-full bg-[#ED8936]" />
                        <div className="w-2 h-2 rounded-full bg-[#F44336]" />
                    </div>
                    <div className="mt-8 text-center px-4 w-full">
                        <h3 className="font-serif italic text-xl text-[#1a1a1a]/90 leading-[1.1]">Climate Summit</h3>
                    </div>
                </div>
            </div>

            <div className="absolute bottom-[5%] right-[25%] transform -rotate-6 opacity-60 pointer-events-none hidden md:block transition-transform hover:scale-105 duration-500">
                {/* Orange Card - Water Pipes */}
                <div className="w-44 h-60 bg-[#ED8936] rounded-[2rem] shadow-2xl flex flex-col items-center relative overflow-hidden ring-4 ring-black/5">
                    {/* Top Pill */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-[#FDFBF7] px-3 py-1.5 rounded-b-[1rem] shadow-sm flex gap-1 z-20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#4CAF50]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#EBA937]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#2196F3]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#ED8936]" />
                        <div className="w-1.5 h-1.5 rounded-full bg-[#F44336]" />
                    </div>
                    <div className="mt-8 text-center px-3 w-full">
                        <h3 className="font-serif italic text-lg text-[#1a1a1a]/90 leading-[1.1]">Water Pipes</h3>
                    </div>
                </div>
            </div>

            {/* Top Logo */}
            <div className="absolute top-10 flex flex-col items-center gap-1">
                <h2 className="text-4xl font-serif italic text-black/80 dark:text-[#FDFAE5]">Cards of Crisis</h2>
                <div className="flex -space-x-1 border-[3px] border-[#333] dark:border-[#FDFAE5] px-3 py-1.5 rounded-full bg-transparent items-center">
                    <div className="w-4 h-4 rounded-full bg-[#4CAF50] z-0"></div>
                    <div className="w-4 h-4 rounded-full bg-[#EBA937] z-10"></div>
                    <div className="w-4 h-4 rounded-full bg-[#2196F3] z-20"></div>
                    <div className="w-4 h-4 rounded-full bg-[#ED8936] z-30"></div>
                    <div className="w-4 h-4 rounded-full bg-[#F44336] z-40"></div>
                </div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in duration-500 mt-12 bg-white/80 dark:bg-[#FDFAE5] backdrop-blur-sm p-8 rounded-2xl border-[3px] border-[#333] shadow-xl transition-colors duration-300">
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
                    <div className="w-8 h-8 rotate-45 bg-[#EBA937] overflow-hidden grid grid-cols-2">
                        <div className="bg-[#EBA937]"></div>
                        <div className="bg-white/30 rounded-full scale-150 transform -translate-x-1 translate-y-1"></div>
                    </div>
                    <span className="text-[10px] font-bold text-[#333] dark:text-[#FDFAE5] mt-1 leading-tight text-center">the<br />change<br />lab</span>
                </div>
                <div className="h-8 w-[1px] bg-[#333] dark:bg-[#FDFAE5]"></div>
                <div className="flex flex-col items-center">
                    <span className="text-lg font-serif italic font-bold text-[#333] dark:text-[#FDFAE5]">Cards of Crisis</span>
                    <div className="flex gap-1 mt-0.5 border-[2px] border-[#333] dark:border-[#FDFAE5] px-1.5 py-0.5 rounded-full">
                        <div className="w-2.5 h-2.5 bg-[#4CAF50] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#EBA937] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#2196F3] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#ED8936] rounded-full"></div>
                        <div className="w-2.5 h-2.5 bg-[#F44336] rounded-full"></div>
                    </div>
                </div>
            </div>
            <div className="absolute bottom-6 left-6 opacity-80 pointer-events-none hidden md:block">
                <div className="flex items-center gap-1">
                    {/* Left Triangle - Points Left */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform rotate-90 text-[#333] dark:text-[#FDFAE5]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                    <div className="font-black text-[#333] dark:text-[#FDFAE5] text-[0.65rem] leading-[0.85] flex flex-col tracking-tighter uppercase font-sans">
                        <span className="self-start">Doing</span>
                        <span className="self-end">More With</span>
                        <span className="self-end">Less</span>
                    </div>
                    {/* Right Triangle - Points Right */}
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="transform -rotate-90 text-[#333] dark:text-[#FDFAE5]">
                        <path d="M20.5 14.5L13.5 21.5C12.7 22.3 11.3 22.3 10.5 21.5L3.5 14.5C2 13 3 10.5 5 10.5H19C21 10.5 22 13 20.5 14.5Z" />
                    </svg>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
