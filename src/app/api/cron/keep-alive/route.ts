import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { redis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
    try {
        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
            return new NextResponse('Unauthorized', { status: 401 });
        }

        // 1. Ping Database (Prisma)
        const dbStart = Date.now();
        // Simple query to keep connection alive/wake up
        await prisma.$queryRaw`SELECT 1`;
        const dbDuration = Date.now() - dbStart;

        // 2. Ping Redis (Upstash)
        let redisDuration = -1;
        let redisStatus = 'skipped';

        if (redis) {
            const redisStart = Date.now();
            await redis.ping();
            redisDuration = Date.now() - redisStart;
            redisStatus = 'connected';
        } else {
             redisStatus = 'not configured';
        }

        console.log(`[Keep-Alive] DB: ${dbDuration}ms, Redis: ${redisStatus} (${redisDuration}ms)`);

        return NextResponse.json({
            success: true,
            timestamp: new Date().toISOString(),
            metrics: {
                dbLatency: dbDuration,
                redisLatency: redisDuration,
                redisStatus
            }
        });
    } catch (error) {
        console.error('[Keep-Alive] Error:', error);
        return NextResponse.json(
            { success: false, error: (error as Error).message },
            { status: 500 }
        );
    }
}
