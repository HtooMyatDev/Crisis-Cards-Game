"use client"
import React, { useState } from 'react';
import {
    CreditCard,
    ChevronRight,
    Plus,
    LayoutDashboard,
    List,
    Users,
    Gamepad2,
    Archive,
    Tag,
    Palette,
    Settings,
    BarChart3,
    Search,
    FileText,
    HelpCircle
} from 'lucide-react';
import Link from "next/link"

interface AdminSidebarContentProps {
    pathname: string;
    isCardsOpen: boolean;
    onToggleCards: () => void;
    onNavigation: () => void;
    isCategoriesOpen: boolean;
    onToggleCategories: () => void;
    isGamesOpen: boolean;
    onToggleGames: () => void;
    // Optional badge counts
    activeSessionsCount?: number;
    pendingUsersCount?: number;
    archivedCardsCount?: number;
}

const AdminSidebarContent: React.FC<AdminSidebarContentProps> = ({
    pathname = '',
    isCardsOpen,
    onToggleCards,
    onNavigation,
    isCategoriesOpen,
    onToggleCategories,
    isGamesOpen,
    onToggleGames,
    activeSessionsCount,
    pendingUsersCount,
    archivedCardsCount
}) => {
    const [searchQuery, setSearchQuery] = useState('');

    const gameOptions = [
        {
            href: "/admin/games/manage",
            label: "All Sessions",
            icon: List,
            badge: activeSessionsCount
        },
        {
            href: "/admin/games/create",
            label: "Create Session",
            icon: Plus
        }
    ];

    const cardOptions = [
        {
            href: "/admin/cards/create",
            label: "Create New Card",
            icon: Plus
        },
        {
            href: "/admin/cards/list",
            label: "All Cards",
            icon: List
        },
        {
            href: "/admin/cards/archive",
            label: "Archived Cards",
            icon: Archive,
            badge: archivedCardsCount
        }
    ];

    const categoryOptions = [
        {
            href: "/admin/categories/create",
            label: "Create Category",
            icon: Plus
        },
        {
            href: "/admin/categories/list",
            label: "All Categories",
            icon: List
        },
        {
            href: "/admin/categories/presets",
            label: "Color Presets",
            icon: Palette
        }
    ];

    // Filter function for search
    const allMenuItems = [
        { href: '/admin/dashboard', label: 'Dashboard' },
        ...gameOptions.map(g => ({ href: g.href, label: g.label })),
        { href: '/admin/users', label: 'User Management' },
        ...cardOptions.map(c => ({ href: c.href, label: c.label })),
        ...categoryOptions.map(c => ({ href: c.href, label: c.label })),
        { href: '/admin/analytics', label: 'Analytics & Reports' },
        { href: '/admin/audit-logs', label: 'Audit Logs' },
        { href: '/admin/settings', label: 'Settings' },
        { href: '/admin/help', label: 'Help & Documentation' }
    ];

    const filteredItems = searchQuery
        ? allMenuItems.filter(item =>
            item.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : [];

    const Badge = ({ count }: { count?: number }) => {
        if (!count) return null;
        return (
            <span className="ml-auto bg-black dark:bg-gray-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                {count}
            </span>
        );
    };

    return (
        <nav className="p-3 pt-14 md:pt-4 h-full overflow-y-auto scrollbar-thin">
            <div className="flex flex-col gap-y-2 pb-40">
                {/* Search Bar */}
                <div className="mb-2 relative">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={16} />
                        <input
                            type="text"
                            placeholder="Search menu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border-2 border-black dark:border-gray-700 rounded-lg text-sm
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]
                            focus:outline-none focus:ring-2 focus:ring-blue-500
                            bg-white dark:bg-gray-700 text-black dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Search Results Dropdown */}
                    {searchQuery && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg
                        shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] dark:shadow-[4px_4px_0px_0px_rgba(255,255,255,0.1)] z-50 max-h-64 overflow-y-auto">
                            {filteredItems.length > 0 ? (
                                <div className="p-2">
                                    {filteredItems.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="block px-3 py-2 hover:bg-blue-50 dark:hover:bg-gray-700 rounded text-sm font-medium text-black dark:text-white"
                                            onClick={() => {
                                                setSearchQuery('');
                                                onNavigation();
                                            }}
                                        >
                                            {item.label}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No results found
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Dashboard */}
                <a
                    href="/admin/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/dashboard'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-blue-50 hover:to-blue-100 dark:hover:from-blue-900/30 dark:hover:to-blue-900/20 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <LayoutDashboard size={18} />
                    <span>Dashboard</span>
                </a>

                {/* Game Sessions Dropdown */}
                <div>
                    <button
                        onClick={onToggleGames}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                            ${pathname.includes('/admin/games')
                                ? 'bg-gradient-to-r from-green-600 to-green-700 text-white border-green-800'
                                : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-green-50 hover:to-green-100 dark:hover:from-green-900/30 dark:hover:to-green-900/20 text-black dark:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Gamepad2 size={18} />
                            <span>Game Sessions</span>
                        </div>
                        <div className={`transition-transform duration-200 ${isGamesOpen ? 'rotate-90' : 'rotate-0'}`}>
                            <ChevronRight size={16} />
                        </div>
                    </button>

                    <div className={`ml-3 overflow-hidden transition-all duration-300 ease-out pe-0.5 pb-0.5 ${isGamesOpen
                        ? 'mt-2 max-h-96 opacity-100 translate-y-0'
                        : 'mt-0 max-h-0 opacity-0 -translate-y-2'
                        }`}>
                        <div className="space-y-1.5">
                            {gameOptions.map((option) => (
                                <Link
                                    key={option.href}
                                    href={option.href}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black rounded-md font-semibold text-xs
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                        ${pathname === option.href
                                            ? 'bg-green-700 text-white'
                                            : 'bg-white dark:bg-gray-700 hover:bg-green-50 dark:hover:bg-green-900/30 text-black dark:text-white'
                                        }`}
                                    onClick={onNavigation}
                                >
                                    <option.icon size={16} />
                                    {option.label}
                                    <Badge count={option.badge} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* User Management */}
                <a
                    href="/admin/users"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/users'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-purple-50 hover:to-purple-100 dark:hover:from-purple-900/30 dark:hover:to-purple-900/20 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <Users size={18} />
                    <span>User Management</span>
                    <Badge count={pendingUsersCount} />
                </a>

                {/* Crisis Cards Dropdown */}
                <div>
                    <button
                        onClick={onToggleCards}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                            ${pathname.includes('/admin/cards')
                                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-800'
                                : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-red-50 hover:to-red-100 dark:hover:from-red-900/30 dark:hover:to-red-900/20 text-black dark:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <CreditCard size={18} />
                            <span>Crisis Cards</span>
                        </div>
                        <div className={`transition-transform duration-200 ${isCardsOpen ? 'rotate-90' : 'rotate-0'}`}>
                            <ChevronRight size={16} />
                        </div>
                    </button>

                    <div className={`ml-3 overflow-hidden transition-all duration-300 ease-out pe-0.5 pb-0.5 ${isCardsOpen
                        ? 'mt-2 max-h-96 opacity-100 translate-y-0'
                        : 'mt-0 max-h-0 opacity-0 -translate-y-2'
                        }`}>
                        <div className="space-y-1.5">
                            {cardOptions.map((option) => (
                                <Link
                                    key={option.href}
                                    href={option.href}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black rounded-md font-semibold text-xs
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                        ${pathname === option.href
                                            ? 'bg-red-700 text-white'
                                            : 'bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 text-black dark:text-white'
                                        }`}
                                    onClick={onNavigation}
                                >
                                    <option.icon size={16} />
                                    {option.label}
                                    <Badge count={option.badge} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Categories Dropdown */}
                <div>
                    <button
                        onClick={onToggleCategories}
                        className={`w-full flex items-center justify-between gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                            shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                            ${pathname.includes('/admin/categories')
                                ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white border-orange-800'
                                : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-orange-900/20 text-black dark:text-white'
                            }`}
                    >
                        <div className="flex items-center gap-2.5">
                            <Tag size={18} />
                            <span>Categories</span>
                        </div>
                        <div className={`transition-transform duration-200 ${isCategoriesOpen ? 'rotate-90' : 'rotate-0'}`}>
                            <ChevronRight size={16} />
                        </div>
                    </button>

                    <div className={`ml-3 overflow-hidden transition-all duration-300 ease-out pe-0.5 pb-0.5 ${isCategoriesOpen
                        ? 'mt-2 max-h-96 opacity-100 translate-y-0'
                        : 'mt-0 max-h-0 opacity-0 -translate-y-2'
                        }`}>
                        <div className="space-y-1.5">
                            {categoryOptions.map((option) => (
                                <Link
                                    key={option.href}
                                    href={option.href}
                                    className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black rounded-md font-semibold text-xs
                                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                        ${pathname === option.href
                                            ? 'bg-orange-700 text-white'
                                            : 'bg-white dark:bg-gray-700 hover:bg-orange-50 dark:hover:bg-orange-900/30 text-black dark:text-white'
                                        }`}
                                    onClick={onNavigation}
                                >
                                    <option.icon size={16} />
                                    {option.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Divider */}
                <div className="border-t-2 border-gray-300 dark:border-gray-700 my-2"></div>

                {/* Analytics & Reports */}
                <a
                    href="/admin/analytics"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/analytics'
                            ? 'bg-gradient-to-r from-cyan-600 to-cyan-700 text-white border-cyan-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-cyan-50 hover:to-cyan-100 dark:hover:from-cyan-900/30 dark:hover:to-cyan-900/20 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <BarChart3 size={18} />
                    <span>Analytics & Reports</span>
                </a>

                {/* Audit Logs */}
                <a
                    href="/admin/audit-logs"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/audit-logs'
                            ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white border-slate-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-slate-50 hover:to-slate-100 dark:hover:from-slate-900/30 dark:hover:to-slate-900/20 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <FileText size={18} />
                    <span>Audit Logs</span>
                </a>

                {/* Settings */}
                <a
                    href="/admin/settings"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/settings'
                            ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white border-gray-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <Settings size={18} />
                    <span>Settings</span>
                </a>

                {/* Help & Documentation */}
                <a
                    href="/admin/help"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/help'
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/30 dark:hover:to-indigo-900/20 text-black dark:text-white'
                        }`}
                    onClick={onNavigation}
                >
                    <HelpCircle size={18} />
                    <span>Help & Documentation</span>
                </a>
            </div>
        </nav>
    );
};

export default AdminSidebarContent;
