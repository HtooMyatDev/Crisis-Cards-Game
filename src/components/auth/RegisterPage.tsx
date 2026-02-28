"use client"
import React, { useActionState, useState, useEffect, startTransition } from 'react'
import { Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react'
import Link from "next/link"
import { registerAction } from "@/app/actions/auth"
import { useRouter } from 'next/navigation'

const RegisterPage: React.FC = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const router = useRouter()

    // Form data state to persist values
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })

    const [state, formAction, pending] = useActionState(registerAction, {
        success: false,
        message: '',
        errors: {},
        redirectTo: null
    })

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }))
    }

    // Clear password fields on error for security
    useEffect(() => {
        if (!state.success && state.message && Object.keys(state.errors).length > 0) {
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: ''
            }))
        }
    }, [state.success, state.message, state.errors])

    // Handle successful registration
    useEffect(() => {
        if (state.success && state.redirectTo) {
            router.push(state.redirectTo)
        }
    }, [state.success, state.redirectTo, router])

    // Handle form submission
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const form = e.currentTarget
        const formDataObj = new FormData(form)
        startTransition(() => {
            formAction(formDataObj)
        })
    }

    // Helper to access errors safely
    const getError = (field: string) => {
        const errors = state.errors as Record<string, string>;
        return errors?.[field];
    }

    return (
        <div className="min-h-screen bg-[#FDFAE5] dark:bg-stone-900 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans transition-colors duration-300">
            {/* Background - Light Mode */}
            <img
                src="/svg/light/background.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none dark:hidden z-0"
                aria-hidden="true"
            />
            {/* Background - Dark Mode */}
            <img
                src="/svg/dark/background.svg"
                alt=""
                className="absolute inset-0 w-full h-full object-cover pointer-events-none hidden dark:block z-0"
                aria-hidden="true"
            />

            {/* Top Navigation / Color Bar (Optional for consistency) */}
            <div className="absolute top-10 flex flex-col items-center gap-2 z-10">
                <Link href="/" className="text-3xl font-serif italic text-stone-700 dark:text-yellow-50 hover:opacity-80 transition-opacity">Cards of Crisis</Link>
                <div className="flex -space-x-0.5 border-2 border-stone-700 dark:border-yellow-50 px-2 py-1 rounded-full bg-transparent items-center">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-600 z-0 text-stone-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 z-10 text-stone-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-sky-600 z-20 text-stone-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500 z-30 text-stone-700"></div>
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 z-40 text-stone-700"></div>
                </div>
            </div>


            <div className="w-full max-w-md mt-24 animate-in fade-in zoom-in duration-500 slides-in-from-bottom-5">
                {/* Card Container */}
                <div className="w-full bg-yellow-50 dark:bg-stone-800 rounded-[10px] outline outline-[5px] outline-stone-700 dark:outline-yellow-50 p-8 flex flex-col relative transition-colors duration-300">
                    {/* Decorative Top Tabs */}
                    <div className="absolute -top-6 left-4 w-24 h-6 bg-stone-700 dark:bg-yellow-50 rounded-t-[5px] transition-colors duration-300" />
                    <div className="absolute -top-6 right-4 w-8 h-6 bg-red-600 rounded-t-[5px]" />


                    <h1 className="text-5xl font-black font-[family-name:var(--font-perfectly-nostalgic)] text-stone-700 dark:text-yellow-50 mb-2 text-center leading-none mt-2 transition-colors duration-300">
                        Sign Up
                    </h1>
                    <p className="text-stone-500 dark:text-yellow-100/70 font-[family-name:var(--font-nohemi)] text-center mb-8 transition-colors duration-300">
                        Create an account to join the crisis
                    </p>

                    {/* Error Messages */}
                    {!state.success && state.message && (
                        <div className="mb-6 p-3 bg-red-100 border-2 border-red-500 rounded text-red-700 font-medium text-sm flex items-center gap-2">
                            <AlertTriangle size={16} />
                            {state.message}
                        </div>
                    )}


                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        {/* Honeypot field for bot protection */}
                        <div className="hidden" aria-hidden="true">
                            <input
                                type="text"
                                name="username_full"
                                tabIndex={-1}
                                autoComplete="off"
                            />
                        </div>

                        {/* Name */}
                        <div className="flex flex-col gap-1">
                            <label className="text-stone-700 dark:text-yellow-50 font-bold font-[family-name:var(--font-nohemi)] text-sm uppercase tracking-wide transition-colors duration-300">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className={`w-full h-12 bg-[#FDFBF7] dark:bg-stone-700 border-[3px] rounded-[5px] px-4 font-medium text-stone-700 dark:text-yellow-50 outline-none focus:ring-4 focus:ring-stone-700/20 dark:focus:ring-yellow-50/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-500
                                ${getError('name') ? 'border-red-500' : 'border-stone-700 dark:border-yellow-50'}`}
                                placeholder="Enter your full name"
                            />
                            {getError('name') && <p className="text-red-500 text-xs font-bold mt-1">{getError('name')}</p>}
                        </div>

                        {/* Email */}
                        <div className="flex flex-col gap-1">
                            <label className="text-stone-700 dark:text-yellow-50 font-bold font-[family-name:var(--font-nohemi)] text-sm uppercase tracking-wide transition-colors duration-300">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className={`w-full h-12 bg-[#FDFBF7] dark:bg-stone-700 border-[3px] rounded-[5px] px-4 font-medium text-stone-700 dark:text-yellow-50 outline-none focus:ring-4 focus:ring-stone-700/20 dark:focus:ring-yellow-50/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-500
                                ${getError('email') ? 'border-red-500' : 'border-stone-700 dark:border-yellow-50'}`}
                                placeholder="name@example.com"
                            />
                            {getError('email') && <p className="text-red-500 text-xs font-bold mt-1">{getError('email')}</p>}
                        </div>

                        {/* Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-stone-700 dark:text-yellow-50 font-bold font-[family-name:var(--font-nohemi)] text-sm uppercase tracking-wide transition-colors duration-300">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className={`w-full h-12 bg-[#FDFBF7] dark:bg-stone-700 border-[3px] rounded-[5px] px-4 font-medium text-stone-700 dark:text-yellow-50 outline-none focus:ring-4 focus:ring-stone-700/20 dark:focus:ring-yellow-50/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-500 pr-10
                                    ${getError('password') ? 'border-red-500' : 'border-stone-700 dark:border-yellow-50'}`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-yellow-50">
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {getError('password') && <p className="text-red-500 text-xs font-bold mt-1">{getError('password')}</p>}
                        </div>

                        {/* Confirm Password */}
                        <div className="flex flex-col gap-1">
                            <label className="text-stone-700 dark:text-yellow-50 font-bold font-[family-name:var(--font-nohemi)] text-sm uppercase tracking-wide transition-colors duration-300">
                                Confirm Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className={`w-full h-12 bg-[#FDFBF7] dark:bg-stone-700 border-[3px] rounded-[5px] px-4 font-medium text-stone-700 dark:text-yellow-50 outline-none focus:ring-4 focus:ring-stone-700/20 dark:focus:ring-yellow-50/20 transition-all placeholder:text-stone-300 dark:placeholder:text-stone-500 pr-10
                                    ${getError('confirmPassword') ? 'border-red-500' : 'border-stone-700 dark:border-yellow-50'}`}
                                    placeholder="••••••••"
                                />
                                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 dark:text-stone-400 dark:hover:text-yellow-50">
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {getError('confirmPassword') && <p className="text-red-500 text-xs font-bold mt-1">{getError('confirmPassword')}</p>}
                        </div>


                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pending}
                            className="mt-4 w-full h-14 bg-stone-700 dark:bg-yellow-50 text-[#FDFAE5] dark:text-stone-800 text-2xl font-black font-serif italic rounded-[5px] hover:bg-black dark:hover:bg-white transition-all shadow-[0px_4px_0px_0px_rgba(0,0,0,0.15)] hover:shadow-[0px_6px_0px_0px_rgba(0,0,0,0.15)] active:shadow-none translate-y-0 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {pending ? <Loader2 className="animate-spin w-6 h-6" /> : 'Create Account'}
                        </button>

                    </form>

                    <div className="mt-8 text-center border-t-2 border-stone-200 dark:border-stone-700 pt-6 transition-colors duration-300">
                        <p className="text-stone-600 dark:text-yellow-100/70 font-medium font-[family-name:var(--font-nohemi)]">
                            Already have an account?{' '}
                            <Link href="/auth/login" className="text-stone-800 dark:text-yellow-50 font-bold underline decoration-2 hover:text-black dark:hover:text-white transition-colors">
                                Login Here
                            </Link>
                        </p>
                    </div>

                </div>
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

export default RegisterPage
