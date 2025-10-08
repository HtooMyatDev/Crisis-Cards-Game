"use client"
import React, { useActionState, useEffect, useState } from 'react';
import { Menu, X, Home, Gamepad2, Trophy, User, LogOut, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import ThemeToggle from '@/components/common/ui/ThemeToggle';
import { logoutAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation'
const UserSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const [isProfileOpen, setIsProfileOpen] = useState(false);

    const pathname = usePathname();

    const router = useRouter()

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

    const handleNavigation = () => {
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const handleLogout = () => {
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const [state, formAction, isPending] = useActionState(logoutAction, null)

    useEffect(() => {
        if (state?.success) {
            router.push('/auth/login')
        }
    }, [state, router])
    const userInfo = {
        name: 'Htoo Myat Aung',
        level: 'Level 5',
        initials: 'P1'
    };

    const isProfileSectionActive = pathname.includes('/user/profile') || pathname.includes('/user/settings');

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-lg
                         shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] dark:hover:shadow-[1px_1px_0px_0px_rgba(255,255,255,0.1)]
                         hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-black dark:text-white"
                aria-label="Toggle sidebar menu"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 dark:bg-black/40 z-40"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Main Sidebar Container */}
            <div className={`
                fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
                border-r-4 border-black dark:border-gray-600 z-50 w-56 transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_0px_0px_0px_rgba(255,255,255,0.05)] overflow-hidden
            `}>
                {/* Header Accent */}
                <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

                {/* Navigation Content */}
                <nav className="p-3 pt-4 h-full overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col gap-y-2 pb-40 mt-8">
                        {/* Home */}
                        <Link
                            href="/user/home"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/home'
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800 dark:border-green-600'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900 dark:hover:to-green-800 text-black dark:text-white'
                                }`}
                            onClick={handleNavigation}
                        >
                            <Home size={18} />
                            Dashboard
                        </Link>

                        {/* Game Sessions */}
                        <Link
                            href="/user/game"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/game'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800 dark:border-blue-600'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900 dark:hover:to-blue-800 text-black dark:text-white'
                                }`}
                            onClick={handleNavigation}
                        >
                            <Gamepad2 size={18} />
                            Play Game
                        </Link>

                        {/* Leaderboard */}
                        <Link
                            href="/user/leaderboard"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/leaderboard'
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-800 dark:border-yellow-600'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-yellow-50 hover:to-yellow-100 dark:hover:from-yellow-900 dark:hover:to-yellow-800 text-black dark:text-white'
                                }`}
                            onClick={handleNavigation}
                        >
                            <Trophy size={18} />
                            Leaderboard
                        </Link>
                    </div>
                </nav>

                {/* Footer with Profile and Theme Toggle */}
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="space-y-2">
                        {/* Theme Toggle - Now positioned above profile options */}
                        <div className="flex justify-center pb-2">
                            <ThemeToggle variant="user" />
                        </div>

                        {/* Profile Options Dropdown */}
                        <div className={`ml-4 space-y-2 overflow-hidden transition-all duration-300 ease-out pe-1 pb-1 ${isProfileOpen
                            ? 'max-h-[200px] opacity-100 translate-y-0 mb-2'
                            : 'max-h-0 opacity-0 translate-y-2 mb-0'
                            }`}>
                            <Link
                                href="/user/profile"
                                className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black dark:border-gray-600 rounded-md font-semibold text-xs
                                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                    hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 w-full
                                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                    ${pathname === '/user/profile'
                                        ? 'bg-purple-700 dark:bg-purple-600 text-white'
                                        : 'bg-white dark:bg-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900 text-black dark:text-white'
                                    }`}
                                onClick={handleNavigation}
                            >
                                <User size={16} />
                                Profile
                            </Link>

                            <form action={formAction}>
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-1.5 border-2 border-red-600 dark:border-red-500 rounded-md font-semibold text-xs text-red-600 dark:text-red-400
            shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] dark:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-none
            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
            bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={16} />
                                    Logout
                                </button>
                            </form>
                        </div>

                        {/* Main Profile Button */}
                        <button
                            type="button"
                            onClick={toggleProfile}
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 border-2 border-black dark:border-gray-600 rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer
                                ${isProfileSectionActive
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 dark:from-purple-500 dark:to-purple-600 text-white border-purple-800 dark:border-purple-500'
                                    : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900 dark:hover:to-purple-800 text-black dark:text-white'
                                }`}

                        >
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold">{userInfo.name}</span>
                                <span className={`text-xs ${isProfileSectionActive ? 'text-purple-200 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {userInfo.level}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center font-bold text-xs
                                    ${isProfileSectionActive ? 'bg-white text-black' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}
                                `}>
                                    {userInfo.initials}
                                </div>
                                <div className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : 'rotate-0'}`}>
                                    <ChevronRight size={14} />
                                </div>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default UserSidebar;
