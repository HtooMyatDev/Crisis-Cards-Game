"use client"
import React from 'react';
import { Home, ArrowLeft, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

const NotFoundPage = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Main 404 Card */}
                <div className="bg-white border-4 border-black rounded-lg p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    {/* Error Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-20 h-20 bg-red-500 border-4 border-black rounded-full flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                            <AlertTriangle size={40} className="text-white" />
                        </div>
                    </div>

                    {/* Error Text */}
                    <div className="text-center mb-8">
                        <h1 className="text-6xl font-black text-black mb-2">404</h1>
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Page Not Found</h2>
                        <p className="text-gray-600 font-medium">
                            The page you're looking for doesn't exist or has been moved.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-blue-600 border-2 border-black rounded-lg font-bold text-white
                                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            <Home size={20} />
                            Go Home
                        </Link>

                        <button
                            onClick={() => window.history.back()}
                            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-black rounded-lg font-bold text-black
                                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[4px] hover:translate-y-[4px] transition-all duration-150
                                active:translate-x-[4px] active:translate-y-[4px] active:shadow-none"
                        >
                            <ArrowLeft size={20} />
                            Go Back
                        </button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div className="flex justify-center mt-6 space-x-2">
                    <div className="w-3 h-3 bg-red-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                    <div className="w-3 h-3 bg-yellow-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                    <div className="w-3 h-3 bg-green-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"></div>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
