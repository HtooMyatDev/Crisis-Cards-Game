import React from 'react';
import UserSidebar from '@/components/user/Sidebar/UserSidebar';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export default async function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/api/auth/logout');
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <UserSidebar />
            <main className="md:ml-56 min-h-screen">
                {children}
            </main>
        </div>
    );
}
