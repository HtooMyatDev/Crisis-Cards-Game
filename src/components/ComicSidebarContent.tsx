// ComicSidebarContent.tsx
"use client"
import React from 'react';
import {
    CreditCard,
    ChevronRight,
    BarChart3,
    Plus,
    LayoutDashboard,
    List,
    Users,
    Gamepad2,
    Archive,
    Tag
} from 'lucide-react';
import Link from "next/link"

interface ComicSidebarContentProps {
    pathname: string;
    isCardsOpen: boolean;
    onToggleCards: () => void;
    onNavigation: () => void;
    isCategoriesOpen: boolean;
    onToggleCategories: () => void;
    isGamesOpen: boolean;
    onToggleGames: () => void;
}

const ComicSidebarContent: React.FC<ComicSidebarContentProps> = ({
    pathname = '',
    isCardsOpen,
    onToggleCards,
    onNavigation,
    isCategoriesOpen,
    onToggleCategories,
    isGamesOpen,
    onToggleGames
}) => {

    const gameOptions = [
        {
            href: "/admin/games/manage",
            label: "All Sessions",
            icon: List
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
            href: "/admin/cards/dashboard",
            label: "Cards Overview",
            icon: BarChart3
        },
        {
            href: "/admin/cards/list",
            label: "All Cards",
            icon: List
        },
        {
            href: "/admin/cards/archive",
            label: "Archived Cards",
            icon: Archive
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
            href: "/admin/categories/dashboard",
            label: "Categories Overview",
            icon: BarChart3
        },
    ];


    return (
        <nav className="p-3 pt-14 md:pt-4 h-full overflow-y-auto scrollbar-thin">
            <div className="flex flex-col gap-y-2 pb-40">
                {/* Dashboard */}
                <a
                    href="/admin/dashboard"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/dashboard'
                            ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-800'
                            : 'bg-gradient-to-r from-white to-gray-50 hover:from-blue-50 hover:to-blue-100'
                        }`}
                    onClick={onNavigation}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
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
                                : 'bg-gradient-to-r from-white to-gray-50 hover:from-green-50 hover:to-green-100'
                            }`}
                        aria-expanded={isGamesOpen}
                    >
                        <div className="flex items-center gap-2.5">
                            <Gamepad2 size={18} />
                            Game Sessions
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
                                            : 'bg-white hover:bg-green-50'
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

                {/* User Management */}
                <a
                    href="/admin/users"
                    className={`flex items-center gap-2.5 px-3 py-2 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                        ${pathname === '/admin/users'
                            ? 'bg-gradient-to-r from-purple-600 to-purple-700 text-white border-purple-800'
                            : 'bg-gradient-to-r from-white to-gray-50 hover:from-purple-50 hover:to-purple-100'
                        }`}
                    onClick={onNavigation}
                >
                    <Users size={18} />
                    User Management
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
                                : 'bg-gradient-to-r from-white to-gray-50 hover:from-red-50 hover:to-red-100'
                            }`}
                        aria-expanded={isCardsOpen}
                    >
                        <div className="flex items-center gap-2.5">
                            <CreditCard size={18} />
                            Crisis Cards
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
                                            : 'bg-white hover:bg-red-50'
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
                                : 'bg-gradient-to-r from-white to-gray-50 hover:from-orange-50 hover:to-orange-100'
                            }`}
                        aria-expanded={isCategoriesOpen}
                    >
                        <div className="flex items-center gap-2.5">
                            <Tag size={18} />
                            Categories
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
                                            : 'bg-white hover:bg-orange-50'
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
            </div>
        </nav>
    );
};

export default ComicSidebarContent;
