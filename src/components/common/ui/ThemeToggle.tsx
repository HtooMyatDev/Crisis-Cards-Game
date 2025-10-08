"use client";
import React from 'react';
import { useTheme } from '@/contexts/ThemeContext';

interface ThemeToggleProps {
    variant?: 'user' | 'admin';
    className?: string;
}

export default function ThemeToggle({ variant = 'user', className = '' }: ThemeToggleProps) {
    const { theme, toggleTheme } = useTheme();

    const baseClasses = "p-2 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95";

    const variantClasses = {
        user: theme === 'dark'
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400 border border-gray-600"
            : "bg-white hover:bg-gray-50 text-gray-600 border border-gray-200 shadow-sm",
        admin: theme === 'dark'
            ? "bg-gray-800 hover:bg-gray-700 text-yellow-400 border-2 border-gray-600 shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]"
            : "bg-white hover:bg-gray-50 text-gray-800 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
    } as const;

    return (
        <button
            onClick={toggleTheme}
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
            {theme === 'light' ? (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-moon"
                >
                    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
            ) : (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-sun"
                >
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2" />
                    <path d="M12 20v2" />
                    <path d="M4.93 4.93l1.41 1.41" />
                    <path d="M17.66 17.66l1.41 1.41" />
                    <path d="M2 12h2" />
                    <path d="M20 12h2" />
                    <path d="M6.34 17.66l-1.41 1.41" />
                    <path d="M19.07 4.93l-1.41 1.41" />
                </svg>
            )}
        </button>
    );
}
