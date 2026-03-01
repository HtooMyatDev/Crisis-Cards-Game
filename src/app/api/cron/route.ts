import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    if (request.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    try {
        const userCount = await prisma.user.count();

        console.log(`Supabase pinged. Current user count: ${userCount}`);

        return NextResponse.json({
            success: true,
            message: 'Database pinged successfully via Prisma'
        });
    } catch (error: any) {
        console.error('Database ping failed:', error);

        // Return a standard 500 error response instead of exiting the process
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
