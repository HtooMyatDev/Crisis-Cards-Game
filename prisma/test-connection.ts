import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../.env') });

const prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
    console.log('🔌 Testing database connection...\n');

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
        console.error('❌ DATABASE_URL is not set in .env file');
        process.exit(1);
    }

    // Show sanitized connection info
    const urlParts = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^\/]+)\/(.*)/);
    if (urlParts) {
        console.log(`📍 Connecting to: ${urlParts[3]}`);
        console.log(`👤 User: ${urlParts[1]}`);
        console.log(`🗄️  Database: ${urlParts[4].split('?')[0]}\n`);
    }

    try {
        console.log('⏳ Attempting to connect...');
        await prisma.$connect();
        console.log('✅ Successfully connected to database!\n');

        // Try a simple query
        console.log('📊 Testing query...');
        const userCount = await prisma.user.count();
        console.log(`✅ Current user count: ${userCount}\n`);

        await prisma.$disconnect();
        console.log('✅ Connection test completed successfully');
        process.exit(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
        console.error('❌ Connection failed!');
        console.error('Error code:', error.errorCode || 'Unknown');
        console.error('Message:', error.message || error);

        if (error.errorCode === 'P1001') {
            console.log('\n💡 Troubleshooting tips:');
            console.log('   1. Check if your Supabase project is paused');
            console.log('   2. Verify the connection string is correct');
            console.log('   3. Ensure your IP is allowed (check Supabase network restrictions)');
            console.log('   4. Try adding ?sslmode=require to your DATABASE_URL if not present');
        }

        await prisma.$disconnect();
        process.exit(1);
    }
}

testConnection();
