"use client"
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import ComicSidebarContent from './ComicSidebarContent';
import ComicSidebarFooter from './ComicSidebarFooter';

const ComicSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCardsOpen, setIsCardsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);

    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleCards = () => {
        setIsCardsOpen(true);
        setIsCategoriesOpen(false);
        setIsProfileOpen(false);
        setIsGamesOpen(false);
    };

    const toggleProfile = () => {
        setIsProfileOpen(true);
        setIsCardsOpen(false);
        setIsCategoriesOpen(false);
        setIsGamesOpen(false);
    };

    const toggleCategories = () => {
        setIsCategoriesOpen(true);
        setIsCardsOpen(false);
        setIsProfileOpen(false);
        setIsGamesOpen(false);
    };

    const toggleGames = () => {
        setIsGamesOpen(true);
        setIsCardsOpen(false);
        setIsProfileOpen(false);
        setIsCategoriesOpen(false);
    };

    const handleNavigation = () => {
        // Only close mobile sidebar, keep desktop navigation sections open
        setIsOpen(false);
    };

    const handleLogout = () => {
        console.log('Logout clicked');
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const userInfo = {
        name: 'John Doe',
        role: 'Administrator',
        initials: 'JD'
    };

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border-2 border-black rounded-lg
                         shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
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
                border-r-4 border-black z-50 w-56 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden
            `}>
                {/* Header Accent */}
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>

                <ComicSidebarContent
                    pathname={pathname}
                    isCardsOpen={isCardsOpen}
                    isCategoriesOpen={isCategoriesOpen}
                    isGamesOpen={isGamesOpen}
                    onToggleCards={toggleCards}
                    onToggleCategories={toggleCategories}
                    onToggleGames={toggleGames}
                    onNavigation={handleNavigation}
                />

                <ComicSidebarFooter
                    pathname={pathname}
                    isProfileOpen={isProfileOpen}
                    onToggleProfile={toggleProfile}
                    onNavigation={handleNavigation}
                    onLogout={handleLogout}
                    userInfo={userInfo}
                />
            </div>
        </>
    );
};

export default ComicSidebar;
