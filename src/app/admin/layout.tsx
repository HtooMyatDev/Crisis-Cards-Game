import React from 'react';
import AdminSidebar from '@/components/admin/Sidebar/Sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
            {/* Fixed Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64 h-full">
                <AdminSidebar />
            </div>

            {/* Main Content Area with fixed margin */}
            <div className="flex-1 ml-64 transition-all duration-300 ease-in-out p-8">
                {children}
            </div>
        </div>
    );
}
