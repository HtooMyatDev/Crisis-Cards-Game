"use client"
import React from 'react';
import UserSidebar from '@/components/user/Sidebar/UserSidebar';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <UserSidebar />
            <main className="md:ml-56 min-h-screen">
                {children}
            </main>
        </div>
    );
}
