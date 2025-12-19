import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'ADMIN' && user.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '50');
        const page = parseInt(searchParams.get('page') || '1');
        const search = searchParams.get('search') || '';

        const skip = (page - 1) * limit;

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        if (search) {
            where.description = { contains: search, mode: 'insensitive' };
        }

        const [activities, total] = await Promise.all([
            prisma.activity.findMany({
                where,
                take: limit,
                skip,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: { id: true, name: true, email: true }
                    },
                    card: {
                        select: { id: true, title: true }
                    }
                }
            }),
            prisma.activity.count({ where })
        ]);

        return NextResponse.json({
            activities,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Error fetching audit logs:', error);
        return NextResponse.json({ error: 'Failed to fetch audit logs' }, { status: 500 });
    }
}
