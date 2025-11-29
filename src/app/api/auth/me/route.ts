import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/utils/auth';

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ user: null });
        }

        return NextResponse.json({
            user: {
                id: user.userId,
                name: user.name || user.email.split('@')[0], // Fallback to email prefix if name is missing
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error fetching current user:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
