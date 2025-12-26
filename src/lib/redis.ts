import Redis from 'ioredis';

const getRedisClient = () => {
    const redisUrl = process.env.REDIS_URL;

    // Determine if Redis should be enabled
    // If NO URL is provided, and we are in production, we might want to fail.
    // But for dev flexibility, if no URL, we return null to allow graceful fallback.
    if (!redisUrl) {
         // Check if we want to default to localhost in dev?
         if (process.env.NODE_ENV === 'development') {
             // Try default connection, but handle error if it fails?
             // Safest is to only connect if explicit URL or explicit Enable flag.
             // But user asked for it. Let's assume generic localhost if dev.
             // return new Redis(); // Default port 6379
             console.log('Redis URL not found, using default localhost:6379');
             return new Redis();
         }
         return null;
    }

    const client = new Redis(redisUrl, {
        maxRetriesPerRequest: 1, // Fail fast if Redis is down
        retryStrategy: (times) => {
            if (times > 3) {
                 console.warn('Redis: Failed to connect after 3 retries. Disabling Redis for this session.');
                 return null; // Stop retrying
            }
            return Math.min(times * 50, 2000);
        }
    });

    client.on('error', (err) => {
        // Prevent app crash on connection error
        console.warn('Redis Client Error (will fallback to DB):', err.message);
    });

    return client;
};

// Singleton instance
export const redis = getRedisClient();

// Helper to gracefully use cache or fetch from source
export async function getOrSetCache<T>(
    key: string,
    callback: () => Promise<T>,
    ttlSeconds: number = 60
): Promise<T> {
    if (!redis) return callback();

    try {
        const cached = await redis.get(key);
        if (cached) return JSON.parse(cached);

        const data = await callback();
        // Don't cache null/undefined
        if (data) {
            await redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
        }
        return data;
    } catch (error) {
        console.warn('Redis error, falling back to db:', error);
        return callback();
    }
}
