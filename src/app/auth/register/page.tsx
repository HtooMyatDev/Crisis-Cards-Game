import React from 'react';
import Link from 'next/link';

export default function RegisterDisabled() {
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-background">
            {/* Background Grain */}
            <div className="absolute inset-0 bg-grain pointer-events-none opacity-40 mix-blend-overlay"></div>

            {/* Gradient Blobs */}
            <div className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-20 blur-[100px]">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-red-500 rounded-full mix-blend-screen dark:mix-blend-color-dodge animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-500 rounded-full mix-blend-screen dark:mix-blend-color-dodge animate-pulse animation-delay-2000"></div>
            </div>

            <div className="max-w-md w-full relative z-10 animate-in fade-in zoom-in duration-500">
                <div className="bg-white/80 dark:bg-black/60 backdrop-blur-3xl border border-white/20 dark:border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] p-8 text-center relative overflow-hidden">
                    {/* Glass Reflection */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>

                    <h2 className="text-3xl font-serif text-gray-900 dark:text-white mb-4 drop-shadow-sm">
                        Registration Disabled
                    </h2>
                    <p className="mt-2 text-base text-gray-600 dark:text-gray-300 font-sans leading-relaxed">
                        New account registration is currently turned off. Please contact the administrator if you believe this is an error.
                    </p>
                    <div className="mt-8">
                        <Link
                            href="/auth/login"
                            className="inline-flex items-center justify-center px-6 py-3 w-full rounded-xl font-bold text-base
                            bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10
                            text-gray-900 dark:text-white
                            hover:bg-gray-50 dark:hover:bg-white/20 hover:scale-[1.02]
                            transition-all duration-300 shadow-sm font-serif"
                        >
                            Go to Login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
