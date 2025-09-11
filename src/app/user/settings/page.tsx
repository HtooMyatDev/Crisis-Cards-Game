"use client"
import React from 'react';
import { useUserPreferences } from '@/lib/useUserPreferences';
import { Moon, Sun, Monitor, Volume2, VolumeX, Zap } from 'lucide-react';

export default function UserSettingsPage() {
    const { preferences, setPreferences, loaded } = useUserPreferences();

    if (!loaded) {
        return (
            <div className="p-6">
                <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <p className="font-bold">Loading settings…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="mb-2">
                    <h1 className="text-3xl font-black text-black mb-2">Settings</h1>
                    <p className="text-gray-600 font-medium">Customize your experience</p>
                </div>

                {/* Theme */}
                <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-xl font-bold text-black mb-4">Theme</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {[
                            { key: 'system', label: 'System', icon: Monitor },
                            { key: 'light', label: 'Light', icon: Sun },
                            { key: 'dark', label: 'Dark', icon: Moon },
                        ].map((opt) => (
                            <button
                                key={opt.key}
                                onClick={() => setPreferences({ ...preferences, theme: opt.key as any })}
                                className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold
                  shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                  hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                  ${preferences.theme === opt.key ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800' : 'bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100'}`}
                            >
                                <opt.icon size={18} />
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sound */}
                <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-xl font-bold text-black mb-4">Sound</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPreferences({ ...preferences, sound: true })}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                ${preferences.sound ? 'bg-green-600 text-white border-green-800' : 'bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-green-100'}`}
                        >
                            <Volume2 size={18} />
                            On
                        </button>
                        <button
                            onClick={() => setPreferences({ ...preferences, sound: false })}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                ${!preferences.sound ? 'bg-red-600 text-white border-red-800' : 'bg-gradient-to-r from-white to-gray-50 hover:from-red-50 hover:to-red-100'}`}
                        >
                            <VolumeX size={18} />
                            Off
                        </button>
                    </div>
                </div>

                {/* Animations */}
                <div className="bg-white border-4 border-black rounded-lg p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <h2 className="text-xl font-bold text-black mb-4">Animations</h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setPreferences({ ...preferences, animations: true })}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                ${preferences.animations ? 'bg-purple-600 text-white border-purple-800' : 'bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-purple-100'}`}
                        >
                            <Zap size={18} />
                            On
                        </button>
                        <button
                            onClick={() => setPreferences({ ...preferences, animations: false })}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-black rounded-lg font-bold
                shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                hover:translate-x-[3px] hover:translate-y-[3px] transition-all duration-150
                ${!preferences.animations ? 'bg-gray-600 text-white border-gray-800' : 'bg-gradient-to-r from-white to-gray-50 hover:from-gray-50 hover:to-gray-100'}`}
                        >
                            Off
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
