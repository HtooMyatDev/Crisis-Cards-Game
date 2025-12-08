import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';
import { Prisma, UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized. Admin access required.' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');
        const search = searchParams.get('search') || '';
        const role = searchParams.get('role');
        const status = searchParams.get('status');

        const skip = (page - 1) * limit;

        // Build where clause
        const whereClause: Prisma.UserWhereInput = {};

        if (search) {
            whereClause.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } }
            ];
        }

        if (role && role !== 'all') {
            // Map 'player' to 'USER' role as per schema
            const targetRole = role.toUpperCase() === 'PLAYER' ? 'USER' : role.toUpperCase();
            whereClause.role = targetRole as UserRole;
        }

        if (status && status !== 'all') {
            whereClause.isActive = status === 'active';
        }

        // Execute query and count in parallel
        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where: whereClause,
                select: {
                    id: true,
                    name: true,
                    email: true,
                    role: true,
                    isActive: true,
                    createdAt: true,
                    updatedAt: true,
                    _count: {
                        select: {
                            playedGames: true // Correct relation name from schema
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.user.count({ where: whereClause })
        ]);

        // Map response
        const formatted = users.map(u => ({
            id: u.id.toString(),
            name: u.name ?? '',
            email: u.email,
            role: u.role === 'ADMIN' ? 'admin' : 'player',
            status: u.isActive ? 'active' : 'inactive',
            joinDate: u.createdAt.toISOString().slice(0, 10),
            lastActivity: u.updatedAt.toISOString().slice(0, 10),
            gamesPlayed: u._count.playedGames
        }));

        return NextResponse.json({
            success: true,
            users: formatted,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Failed to fetch users', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
