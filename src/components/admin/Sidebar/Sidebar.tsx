"use client"
import React, { useState } from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import AdminSidebarContent from './SidebarContent';
import AdminSidebarFooter from './SidebarFooter';

interface AdminSidebarProps {
    isCollapsed?: boolean;
    toggleCollapse?: () => void;
    user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ isCollapsed = false, toggleCollapse, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [isCardsOpen, setIsCardsOpen] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [isGamesOpen, setIsGamesOpen] = useState(false);

    const pathname = usePathname();

    const toggleSidebar = () => setIsOpen(!isOpen);

    const toggleCards = () => {
        if (isCollapsed && toggleCollapse) toggleCollapse();
        setIsCardsOpen(!isCardsOpen);
        if (!isCardsOpen) {
            setIsCategoriesOpen(false);
            setIsProfileOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleProfile = () => {
        if (isCollapsed && toggleCollapse) toggleCollapse();
        setIsProfileOpen(!isProfileOpen);
        if (!isProfileOpen) {
            setIsCardsOpen(false);
            setIsCategoriesOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleCategories = () => {
        if (isCollapsed && toggleCollapse) toggleCollapse();
        setIsCategoriesOpen(!isCategoriesOpen);
        if (!isCategoriesOpen) {
            setIsCardsOpen(false);
            setIsProfileOpen(false);
            setIsGamesOpen(false);
        }
    };

    const toggleGames = () => {
        if (isCollapsed && toggleCollapse) toggleCollapse();
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
        name: user?.name || 'Administrator',
        role: user?.role || 'Admin',
        initials: user?.name ? user.name.charAt(0).toUpperCase() : 'A'
    };

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-700 rounded-lg
                         shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                         hover:translate-x-[1px] hover:translate-y-[1px] transition-all duration-150 text-black dark:text-white"
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
                fixed left-0 top-0 h-full bg-gradient-to-b from-white to-gray-50 dark:from-gray-800 dark:to-gray-900
                border-r-4 border-black dark:border-gray-700 z-50 transform transition-all duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full'}
                md:translate-x-0 shadow-[8px_0px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[8px_0px_0px_0px_rgba(255,255,255,0.05)]
                w-64 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
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
                    isCollapsed={isCollapsed}
                />

                <AdminSidebarFooter
                    pathname={pathname}
                    isProfileOpen={isProfileOpen}
                    onToggleProfile={toggleProfile}
                    onNavigation={handleNavigation}
                    onLogout={handleLogout}
                    userInfo={userInfo}
                    isCollapsed={isCollapsed}
                />

                {/* Desktop Collapse Toggle */}
                <button
                    onClick={toggleCollapse}
                    className="hidden md:flex absolute bottom-20 -right-3 w-6 h-6 bg-white dark:bg-gray-800 border-2 border-black dark:border-gray-600 rounded-full items-center justify-center
                        shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[1px] hover:translate-y-[1px] transition-all z-50"
                    aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </div>
        </>
    );
};

export default AdminSidebar;
