"use client"
import React, { useActionState, useEffect, useState } from 'react';
import { Menu, X, Home, User, LogOut, ChevronRight, History, Trophy, HelpCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
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

    const [state, formAction] = useActionState(logoutAction, null)

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
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border-2 border-black rounded-lg
                         shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-black"
                aria-label="Toggle sidebar menu"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile Overlay */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-40"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Main Sidebar Container */}
            <div className={`
                fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50
                border-r-4 border-black z-50 w-56 transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden
            `}>
                {/* Header Accent */}
                <div className="h-1 bg-gradient-to-r from-green-500 via-blue-500 to-purple-500"></div>

                {/* Navigation Content */}
                <nav className="p-3 pt-4 h-full overflow-y-auto scrollbar-thin">
                    <div className="flex flex-col gap-y-2 pb-40 mt-8">
                        {/* Home */}
                        <Link
                            href="/user/home"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/home'
                                    ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800'
                                    : 'bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-green-100 text-black'
                                }`}
                            onClick={handleNavigation}
                        >
                            <Home size={18} />
                            Dashboard
                        </Link>

                        {/* Game History */}
                        <Link
                            href="/user/history"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/history'
                                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800'
                                    : 'bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100 text-black'
                                }`}
                            onClick={handleNavigation}
                        >
                            <History size={18} />
                            Game History
                        </Link>

                        {/* Leaderboard */}
                        <Link
                            href="/user/leaderboard"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/leaderboard'
                                    ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white border-yellow-800'
                                    : 'bg-gradient-to-r from-white to-gray-50 hover:from-yellow-50 hover:to-yellow-100 text-black'
                                }`}
                            onClick={handleNavigation}
                        >
                            <Trophy size={18} />
                            Leaderboard
                        </Link>

                        {/* Help */}
                        <Link
                            href="/user/help"
                            className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${pathname === '/user/help'
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800'
                                    : 'bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-purple-100 text-black'
                                }`}
                            onClick={handleNavigation}
                        >
                            <HelpCircle size={18} />
                            Help
                        </Link>
                    </div>
                </nav>

                {/* Footer with Profile */}
                <div className="absolute bottom-3 left-3 right-3">
                    <div className="space-y-2">
                        {/* Profile Options Dropdown */}
                        <div className={`ml-4 space-y-2 overflow-hidden transition-all duration-300 ease-out pe-1 pb-1 ${isProfileOpen
                            ? 'max-h-[200px] opacity-100 translate-y-0 mb-2'
                            : 'max-h-0 opacity-0 translate-y-2 mb-0'
                            }`}>
                            <Link
                                href="/user/profile"
                                className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black rounded-md font-semibold text-xs
                                    shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                    hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 w-full
                                    active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                    ${pathname === '/user/profile'
                                        ? 'bg-purple-700 text-white'
                                        : 'bg-white hover:bg-purple-50 text-black'
                                    }`}
                                onClick={handleNavigation}
                            >
                                <User size={16} />
                                Profile
                            </Link>



                            <form action={formAction}>
                                <button
                                    className="w-full flex items-center gap-2.5 px-3 py-1.5 border-2 border-red-600 rounded-md font-semibold text-xs text-red-600
            shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] hover:shadow-none
            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
            bg-white hover:bg-red-50"
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
                            className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 border-2 border-black rounded-lg font-bold text-sm
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer
                                ${isProfileSectionActive
                                    ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800'
                                    : 'bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-purple-100 text-black'
                                }`}

                        >
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-bold">{userInfo.name}</span>
                                <span className={`text-xs ${isProfileSectionActive ? 'text-purple-200' : 'text-gray-500'}`}>
                                    {userInfo.level}
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 border-2 border-black rounded-full flex items-center justify-center font-bold text-xs
                                    ${isProfileSectionActive ? 'bg-white text-black' : 'bg-gray-200 text-gray-700'}
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
