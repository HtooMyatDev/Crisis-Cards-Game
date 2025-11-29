const { seedAchievements } = require('../src/lib/achievements');
const { PrismaClient } = require('@prisma/client');

async function main() {
    try {
        await seedAchievements();
    } catch (e) {
        console.error(e);
        process.exit(1);
    } finally {
        const prisma = new PrismaClient();
        await prisma.$disconnect();
    }
}

main();
