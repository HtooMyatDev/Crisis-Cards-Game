"use client"
import React, { useActionState, useEffect, useState } from 'react';
import { User, Settings, Bell, Shield, LogOut, ChevronRight } from 'lucide-react';
import Link from 'next/link'
import { logoutAction } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';


interface AdminSidebarFooterProps {
    isProfileOpen: boolean;
    onToggleProfile: () => void;
    onNavigation: () => void;
    onLogout: () => void;
    pathname: string;
    isCollapsed?: boolean; // New prop for collapsed state
    userInfo: {
        name: string;
        role: string;
        initials: string;
    };
}

const AdminSidebarFooter: React.FC<AdminSidebarFooterProps> = ({
    isProfileOpen,
    onToggleProfile,
    onNavigation,
    onLogout,
    pathname,
    userInfo,
    isCollapsed = false
}) => {
    const [mounted, setMounted] = useState(false);

    const [state, formAction] = useActionState(logoutAction, null);
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        if (state?.success) {
            router.push('/auth/login')
        }
    }, [state, router]);


    const isProfileSectionActive =
        pathname.includes('/admin/profile') ||
        pathname.includes('/admin/settings') ||
        pathname.includes('/admin/notifications') ||
        pathname.includes('/admin/security');

    const profileOptions = [
        { href: '/admin/profile', icon: User, label: 'Profile Settings' },
        { href: '/admin/settings', icon: Settings, label: 'App Settings' },
        { href: '/admin/notifications', icon: Bell, label: 'Notifications' },
        { href: '/admin/security', icon: Shield, label: 'Security' }
    ];

    return (
        <div className="absolute bottom-3 left-3 right-3">
            <div className="space-y-2">
                <div className={`ml-4 space-y-2 overflow-hidden transition-all duration-300 ease-out pe-1 pb-1 ${isProfileOpen && !isCollapsed
                    ? 'max-h-[280px] opacity-100 translate-y-0 mb-2'
                    : 'max-h-0 opacity-0 translate-y-2 mb-0'
                    }`}>
                    {profileOptions.map((option) => (
                        <Link
                            key={option.href}
                            href={option.href}
                            className={`flex items-center gap-2.5 px-3 py-1.5 border-2 border-black rounded-md font-semibold text-xs
                                shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                                hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150 w-full
                                active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                                ${mounted && pathname === option.href
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-black dark:text-white'
                                }`}
                            onClick={onNavigation}
                        >
                            <option.icon size={16} />
                            {option.label}
                        </Link>
                    ))}

                    <form action={formAction}>
                        <button
                            className="w-full flex items-center gap-2.5 px-3 py-1.5 border-2 border-red-600 dark:border-red-500 rounded-md font-semibold text-xs text-red-600 dark:text-red-400
                            shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] dark:shadow-[2px_2px_0px_0px_rgba(239,68,68,0.5)] hover:shadow-none
                            hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                            active:translate-x-[2px] active:translate-y-[2px] active:shadow-none
                            cursor-pointer
                            bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                            onClick={onLogout}
                        >
                            <LogOut size={16} />
                            Logout
                        </button>
                    </form>
                </div>

                <button
                    type="button"
                    onClick={onToggleProfile}
                    className={`w-full flex items-center justify-between gap-2.5 px-3 py-2.5 border-2 border-black rounded-lg font-bold text-sm
                        shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none
                        hover:translate-x-[2px] hover:translate-y-[2px] transition-all duration-150
                        active:translate-x-[2px] active:translate-y-[2px] active:shadow-none cursor-pointer
                        ${isProfileSectionActive
                            ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-800'
                            : 'bg-gradient-to-r from-white to-gray-50 dark:from-gray-700 dark:to-gray-800 hover:from-indigo-50 hover:to-indigo-100 dark:hover:from-indigo-900/30 dark:hover:to-indigo-900/20 text-black dark:text-white'
                        } ${isCollapsed ? 'justify-center' : ''}`}
                    title={userInfo.name}
                >
                    <div className="flex flex-col items-start">
                        {!isCollapsed && (
                            <>
                                <span className="text-xs font-bold">{userInfo.name}</span>
                                <span className={`text-xs ${isProfileSectionActive ? 'text-indigo-200' : 'text-gray-500 dark:text-gray-400'}`}>
                                    {userInfo.role}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 border-2 border-black dark:border-gray-600 rounded-full flex items-center justify-center font-bold text-xs
                            ${isProfileSectionActive ? 'bg-white text-black' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}
                        `}>
                            {userInfo.initials}
                        </div>
                        {!isCollapsed && (
                            <div className={`transition-transform duration-200 ${isProfileOpen ? 'rotate-90' : 'rotate-0'}`}>
                                <ChevronRight size={14} />
                            </div>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default AdminSidebarFooter;
