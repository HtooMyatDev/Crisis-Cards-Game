"use client"
import React, { useState, useActionState, useEffect, startTransition } from 'react'
import { Mail, Lock, LogIn, Loader2, UserPlus, Shield, Eye, EyeOff, AlertTriangle } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
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
                    backgroundImage: `linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }}
            />

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-block p-6 bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] mb-6 relative">
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 transform rotate-45"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-yellow-400 rounded-full"></div>
                        <Shield size={48} className="mx-auto text-red-500" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-800 mb-2 transform -rotate-1 relative">
                        <span className="absolute -inset-1 bg-white transform -skew-x-12 -z-10 border-4 border-black"></span>
                        <span className="relative text-black px-4">Crisis Command</span>
                    </h1>
                    <p className="text-xl font-bold text-gray-600">
                        Ready to respond?
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] p-8 relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 transform rotate-45"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-500 transform rotate-45"></div>
                    {/* Success Message */}
                    {state.success && (
                        <div className="mb-6 p-4 bg-green-100 border-4 border-green-500 rounded-lg relative">
                            <div className="flex items-center gap-3">
                                <Shield size={20} className="text-green-500 flex-shrink-0" />
                                <p className="text-green-800 font-bold">{state.message}</p>
                            </div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 transform rotate-45"></div>
                        </div>
                    )}

                    {/* General Error Message */}
                    {!state.success && state.message && Object.keys(state.errors).length === 0 && (
                        <div className="mb-6 p-4 bg-red-100 border-4 border-red-500 rounded-lg relative">
                            <div className="flex items-center gap-3">
                                <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                                <p className="text-red-800 font-bold">{state.message}</p>
                            </div>
                            <div className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 transform rotate-45"></div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {/* Email Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <Mail size={20} />
                            </div>
                            <input
                                required
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email Address"
                                className={`w-full pl-12 pr-4 py-4 border-4 rounded-lg font-semibold text-lg
                            bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                            transition-all duration-200 focus:outline-none placeholder-gray-500
                            ${(state.errors as Record<string, string>).email ? 'border-red-500' : 'border-black'}`}
                            />
                            {(state.errors as Record<string, string>).email && (
                                <div className="mt-2 flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-500" />
                                    <p className="text-red-600 font-bold text-sm">{state.errors.email}</p>
                                </div>
                            )}
                        </div>

                        {/* Password Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <Lock size={20} />
                            </div>
                            <input
                                required
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full pl-12 pr-12 py-4 border-4 rounded-lg font-semibold text-lg
                                    bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500
                                    ${state.errors.password ? 'border-red-500' : 'border-black'}`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors z-10"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>

                        </div>
                        {state.errors.password && (
                            <div className="mt-2 flex items-center gap-2">
                                <AlertTriangle size={16} className="text-red-500" />
                                <p className="text-red-600 font-bold text-sm">{state.errors.password}</p>
                            </div>
                        )}
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={pending}
                            className="w-full px-6 py-4 border-4 border-black rounded-lg font-bold text-lg
                            bg-red-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600
                            hover:translate-x-[2px] hover:translate-y-[2px]
                            active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                            flex items-center justify-center gap-2 relative overflow-hidden group
                            disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            {pending ? (
                                <>
                                    <Loader2 size={20} className="relative z-10 animate-spin" />
                                    <span className="relative z-10">Accessing Crisis Command...</span>
                                </>
                            ) : (
                                <>
                                    <LogIn size={20} className="relative z-10" />
                                    <span className="relative z-10">Enter Crisis Command</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Forgot Password */}
                    <div className="mt-6">
                        <button className="w-full text-center text-black font-semibold hover:underline hover:bg-gray-100 py-2 px-4 rounded transition-colors duration-200">
                            Emergency access recovery?
                        </button>
                    </div>

                    {/* Register Link */}
                    <div className="mt-8 pt-6 border-t-4 border-black">
                        <p className="text-center text-gray-700 font-semibold mb-4">
                            New to Crisis Management?
                        </p>
                        <Link
                            href="/auth/register"
                            className="w-full px-6 py-4 border-4 border-black rounded-lg font-bold text-lg
                                bg-green-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            <UserPlus size={20} className="relative z-10" />
                            <span className="relative z-10">Join Crisis Response Team</span>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <div className="inline-block bg-white px-6 py-2 border-4 border-black transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <p className="text-black font-bold transform skew-x-12">
                            Ready to manage the crisis? 🚨
                        </p>
                    </div>
                </div>

                {/* Crisis Status Indicators */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-yellow-400 border-4 border-black rounded-lg p-3 text-center">
                        <div className="text-black font-bold text-sm">System Status</div>
                        <div className="text-black font-black text-lg">ACTIVE</div>
                    </div>
                    <div className="bg-green-500 border-4 border-black rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-sm">Response Level</div>
                        <div className="text-white font-black text-lg">READY</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage
