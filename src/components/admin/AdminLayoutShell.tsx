"use client"

import React, { useState } from 'react';
import AdminSidebar from '@/components/admin/Sidebar/Sidebar';

interface AdminLayoutShellProps {
    children: React.ReactNode;
    user?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

const AdminLayoutShell: React.FC<AdminLayoutShellProps> = ({ children, user }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Fixed Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}>
                <AdminSidebar
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                    user={user}
                />
            </div>

            {/* Main Content Area with dynamic margin */}
            <div className={`flex-1 transition-all duration-300 ease-in-out p-8 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
                {children}
            </div>
        </div>
    );
};

export default AdminLayoutShell;
