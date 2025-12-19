import { getCurrentUser } from '@/app/actions/auth';
import ProfileForm from '@/components/admin/ProfileForm';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-black dark:text-white">Profile Settings</h1>
            {/*
                ProfileForm is a Client Component that handles the UI.
                We pass the server-fetched user data to it.
                We cast user to any to avoid strict type issues with the added fields vs existing type usage elsewhere,
                or we can update the type definition later.
            */}
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <ProfileForm user={user as any} />
        </div>
    );
}
