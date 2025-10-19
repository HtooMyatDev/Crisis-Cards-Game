"use client"
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AdminSidebarContent from './SidebarContent';
import AdminSidebarFooter from './SidebarFooter';

const AdminSidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCardsOpen, setIsCardsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);

    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleCards = () => {
        setIsCardsOpen(!isCardsOpen);
        if (!isCardsOpen) {
            setIsCategoriesOpen(false);
            setIsProfileOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleProfile = () => {
        setIsProfileOpen(!isProfileOpen);
        if (!isProfileOpen) {
            setIsCardsOpen(false);
            setIsCategoriesOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleCategories = () => {
        setIsCategoriesOpen(!isCategoriesOpen);
        if (!isCategoriesOpen) {
            setIsCardsOpen(false);
            setIsProfileOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleGames = () => {
        setIsGamesOpen(!isGamesOpen);
        if (!isGamesOpen) {
            setIsCardsOpen(false);
            setIsProfileOpen(false);
            setIsCategoriesOpen(false);
        }
    };

    const handleNavigation = () => {
        setIsOpen(false);
    };

    const handleLogout = () => {
        setIsOpen(false);
        setIsProfileOpen(false);
    };

    const userInfo = {
        name: 'Htoo Myat Aung',
        role: 'Administrator',
        initials: 'JD'
    };

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white border-2 border-black rounded-lg
                         shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150"
                aria-label="Toggle sidebar menu"
            >
                {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-black/20 z-40"
                    onClick={toggleSidebar}
                    aria-hidden="true"
                />
            )}

            <div className={`
                fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50
                border-r-4 border-black z-50 w-56 transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden
            `}>
                <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>

                <AdminSidebarContent
                    pathname={pathname}
                    isCardsOpen={isCardsOpen}
                    isCategoriesOpen={isCategoriesOpen}
                    isGamesOpen={isGamesOpen}
                    onToggleCards={toggleCards}
                    onToggleCategories={toggleCategories}
                    onToggleGames={toggleGames}
                    onNavigation={handleNavigation}
                />

                <AdminSidebarFooter
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

export default AdminSidebar;
