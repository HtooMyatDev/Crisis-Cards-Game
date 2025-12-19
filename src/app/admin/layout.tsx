import React from 'react';
import AdminLayoutShell from '@/components/admin/AdminLayoutShell';
import { getCurrentUser } from '@/app/actions/auth';
import { redirect } from 'next/navigation';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const user = await getCurrentUser();

    // Optional: Redirect if not logged in (though middleware usually handles this)
    if (!user) {
        redirect('/auth/login');
    }

    return (
        <AdminLayoutShell user={user}>
            {children}
        </AdminLayoutShell>
    );
}
