import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifyData() {
    console.log('🔍 Verifying seeded data...\n');

    try {
        const userCount = await prisma.user.count();
        const presetCount = await prisma.colorPreset.count();
        const categoryCount = await prisma.category.count();
        const cardCount = await prisma.card.count();
        const responseCount = await prisma.cardResponse.count();

        console.log('📊 Database Contents:');
        console.log(`   👤 Users: ${userCount}`);
        console.log(`   🎨 Color Presets: ${presetCount}`);
        console.log(`   📂 Categories: ${categoryCount}`);
        console.log(`   🃏 Cards: ${cardCount}`);
        console.log(`   💬 Card Responses: ${responseCount}\n`);

        // Show categories with their color presets
        const categories = await prisma.category.findMany({
            include: { colorPreset: true }
        });

        console.log('📂 Categories:');
        categories.forEach(cat => {
            console.log(`   - ${cat.name} (${cat.colorPreset?.name || 'No preset'})`);
        });

        console.log('\n🃏 Cards:');
        const cards = await prisma.card.findMany({
            include: { category: true, cardResponses: true }
        });

        cards.forEach(card => {
            console.log(`   - ${card.title} (${card.category.name}) - ${card.cardResponses.length} responses`);
        });

        console.log('\n✅ Verification complete!');

        await prisma.$disconnect();
    } catch (error) {
        console.error('❌ Verification failed:', error);
        await prisma.$disconnect();
        process.exit(1);
    }
}

verifyData();
