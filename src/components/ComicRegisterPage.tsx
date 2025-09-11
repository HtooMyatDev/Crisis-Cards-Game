"use client"
import React, { useState } from 'react'
import { Mail, Lock, User, UserPlus, LogIn, Eye, EyeOff, Loader2, Shield } from 'lucide-react'
import Link from "next/link"

const ComicRegisterPage: React.FC = () => {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Simulate API call - replace with your actual registration logic
            await new Promise(resolve => setTimeout(resolve, 2000))
            console.log({ name, email, password, confirmPassword })

            // Handle successful registration here
            // e.g., redirect to dashboard, show success message, etc.

        } catch (error) {
            console.error('Registration failed:', error)
            // Handle error here (show error message, etc.)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Crisis-themed Pattern Background */}
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
                        <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 transform rotate-45"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-blue-400 rounded-full"></div>
                        <UserPlus size={48} className="mx-auto text-green-500" />
                    </div>
                    <h1 className="text-4xl font-black text-gray-800 mb-2 transform -rotate-1 relative">
                        <span className="absolute -inset-1 bg-white transform -skew-x-12 -z-10 border-4 border-black"></span>
                        <span className="relative text-black px-4">Join Crisis Team</span>
                    </h1>
                    <p className="text-xl font-bold text-gray-600">
                        Ready to make a difference?
                    </p>
                </div>

                {/* Form Container */}
                <div className="bg-white border-4 border-black rounded-2xl shadow-[8px_8px_0px_0px_rgba(0,0,0,0.2)] p-8 relative">
                    {/* Decorative Elements */}
                    <div className="absolute -top-3 -left-3 w-6 h-6 bg-green-500 transform rotate-45"></div>
                    <div className="absolute -top-3 -right-3 w-6 h-6 bg-blue-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-yellow-400 rounded-full"></div>
                    <div className="absolute -bottom-3 -right-3 w-6 h-6 bg-purple-500 transform rotate-45"></div>

                    <div className="space-y-6 relative z-10">
                        {/* Name Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <User size={20} />
                            </div>
                            <input
                                type="text"
                                name="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Full Name"
                                className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-lg font-semibold text-lg
                                    bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500"
                            />
                        </div>

                        {/* Email Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <Mail size={20} />
                            </div>
                            <input
                                type="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Email Address"
                                className="w-full pl-12 pr-4 py-4 border-4 border-black rounded-lg font-semibold text-lg
                                    bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500"
                            />
                        </div>

                        {/* Password Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full pl-12 pr-12 py-4 border-4 border-black rounded-lg font-semibold text-lg
                                    bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors z-10"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative transition-all duration-200
                            focus-within:translate-x-[2px] focus-within:translate-y-[2px]">
                            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-600 z-10">
                                <Lock size={20} />
                            </div>
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full pl-12 pr-12 py-4 border-4 border-black rounded-lg font-semibold text-lg
                                    bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                    focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]
                                    transition-all duration-200 focus:outline-none placeholder-gray-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition-colors z-10"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            onClick={onSubmit}
                            disabled={loading}
                            className="w-full px-6 py-4 border-4 border-black rounded-lg font-bold text-lg
                                bg-green-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-green-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0
                                disabled:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:hover:bg-green-500
                                flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            {loading ? (
                                <>
                                    <Loader2 size={20} className="relative z-10 animate-spin" />
                                    <span className="relative z-10">Joining Crisis Team...</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus size={20} className="relative z-10" />
                                    <span className="relative z-10">Join Crisis Response</span>
                                </>
                            )}
                        </button>
                    </div>

                    {/* Terms */}
                    <div className="mt-6">
                        <p className="text-sm text-gray-600 text-center">
                            By joining the team, you agree to our{' '}
                            <span className="text-black font-semibold hover:underline cursor-pointer">Crisis Response Protocol</span>{' '}
                            and{' '}
                            <span className="text-black font-semibold hover:underline cursor-pointer">Emergency Privacy Policy</span>
                        </p>
                    </div>

                    {/* Login Link */}
                    <div className="mt-8 pt-6 border-t-4 border-black">
                        <p className="text-center text-gray-700 font-semibold mb-4">
                            Already part of Crisis Command?
                        </p>
                        <Link
                            href="/auth/login"
                            className="w-full px-6 py-4 border-4 border-black rounded-lg font-bold text-lg
                                bg-red-500 text-white transition-all duration-200 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-600
                                hover:translate-x-[2px] hover:translate-y-[2px]
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none
                                flex items-center justify-center gap-2 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-white transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-500 opacity-20"></div>
                            <LogIn size={20} className="relative z-10" />
                            <span className="relative z-10">Access Crisis Command</span>
                        </Link>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <div className="inline-block bg-white px-6 py-2 border-4 border-black transform -skew-x-12 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]">
                        <p className="text-black font-bold transform skew-x-12">
                            Ready to respond to the crisis? 🚨
                        </p>
                    </div>
                </div>

                {/* Crisis Status Indicators */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    <div className="bg-blue-400 border-4 border-black rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-sm">Team Status</div>
                        <div className="text-white font-black text-lg">RECRUITING</div>
                    </div>
                    <div className="bg-purple-500 border-4 border-black rounded-lg p-3 text-center">
                        <div className="text-white font-bold text-sm">Response Level</div>
                        <div className="text-white font-black text-lg">STANDBY</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ComicRegisterPage
