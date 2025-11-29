"use client"
import React, { useEffect, useState } from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from 'next-themes';

export default function AppSettings() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="p-6">
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    <p className="font-bold text-black dark:text-white">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="mb-2">
                    <h1 className="text-3xl font-black text-black dark:text-white mb-2">App Settings</h1>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Manage application-wide settings</p>
                </div>

                {/* Theme Toggle */}
                <div className="bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)]">
                    <h2 className="text-xl font-bold text-black dark:text-white mb-4">Theme</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                        Choose your preferred color scheme. &quot;Auto&quot; will match your system preference.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { key: 'system', label: 'Auto', icon: Monitor },
                            { key: 'light', label: 'Light', icon: Sun },
                            { key: 'dark', label: 'Dark', icon: Moon },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setTheme(opt.key)}
                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-black dark:border-gray-600 rounded-lg font-bold
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] dark:shadow-[3px_3px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                  hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                  ${theme === opt.key
                                        ? 'bg-blue-600 dark:bg-blue-700 text-white border-blue-800 dark:border-blue-900'
                                        : 'bg-white dark:bg-gray-700 text-black dark:text-white hover:bg-blue-50 dark:hover:bg-blue-900/30'
                                    }`}
                            >
                                <opt.icon size={18} />
                                <span>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
