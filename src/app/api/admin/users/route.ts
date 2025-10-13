import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                // You may have a field for gamesPlayed, but default to 0 for now if not
            }
        });

        // Map Prisma role and isActive to client format
        const formatted = users.map(u => ({
            id: u.id.toString(),
            name: u.name ?? '',
            email: u.email,
            role: u.role.toLowerCase() === 'admin' ? 'admin' : 'player',
            status: u.isActive ? 'active' : 'inactive',
            joinDate: u.createdAt.toISOString().slice(0, 10),
            lastActivity: u.updatedAt.toISOString().slice(0, 10),
            gamesPlayed: 0 // Replace with actual calculation if you store this elsewhere
        }));
        return NextResponse.json({ success: true, users: formatted });
    } catch (error) {
        console.error('Failed to fetch users', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
