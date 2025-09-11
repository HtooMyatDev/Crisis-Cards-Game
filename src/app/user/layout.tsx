"use client"
import React from 'react';
import UserSidebar from '@/components/UserSidebar';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-200">
            <UserSidebar />
            <main className="md:ml-56 min-h-screen">
                {children}
            </main>
        </div>
    );
}
