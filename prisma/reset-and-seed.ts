import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

const prisma = new PrismaClient();

config({ path: resolve(__dirname, '../.env') });

const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const SALT_ROUNDS = 10;

async function clearDatabase() {
    console.log('🗑️  Clearing database...');

    try {
        // Delete in correct order to respect foreign key constraints
        await prisma.playerResponse.deleteMany();
        await prisma.player.deleteMany();
        await prisma.gameSessionCategory.deleteMany();
        await prisma.gameSession.deleteMany();
        await prisma.cardResponse.deleteMany();
        await prisma.activity.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.attachment.deleteMany();
        await prisma.card.deleteMany();
        await prisma.template.deleteMany();
        await prisma.category.deleteMany();
        await prisma.colorPreset.deleteMany();
        await prisma.notification.deleteMany();
        await prisma.user.deleteMany();

        console.log('   ✅ Database cleared');
    } catch (error) {
        console.error('   ❌ Error clearing database:', error);
        throw error;
    }
}

async function seedDatabase() {
    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment variables.');
    }

    try {
        // 1. Admin User
        console.log('👤 Seeding Admin User...');
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const adminUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: 'Super Admin',
                role: 'ADMIN',
                isActive: true,
            }
        });
        console.log(`   ✅ Admin user created: ${adminUser.email}`);

        // 2. Color Presets
        console.log('🎨 Seeding Color Presets...');
        const presets = [
            {
                name: 'Political Red',
                description: 'For political and diplomatic crises',
                backgroundColor: '#FEE2E2',
                textColor: '#991B1B',
                textBoxColor: '#FCA5A5',
                isDefault: true
            },
            {
                name: 'Economic Blue',
                description: 'For financial and market crises',
                backgroundColor: '#DBEAFE',
                textColor: '#1E40AF',
                textBoxColor: '#93C5FD',
                isDefault: true
            },
            {
                name: 'Social Yellow',
                description: 'For social unrest and public welfare',
                backgroundColor: '#FEF3C7',
                textColor: '#92400E',
                textBoxColor: '#FCD34D',
                isDefault: true
            },
            {
                name: 'Environmental Green',
                description: 'For natural disasters and environmental issues',
                backgroundColor: '#D1FAE5',
                textColor: '#065F46',
                textBoxColor: '#6EE7B7',
                isDefault: true
            },
            {
                name: 'Infrastructure Gray',
                description: 'For technical and infrastructure failures',
                backgroundColor: '#F3F4F6',
                textColor: '#1F2937',
                textBoxColor: '#D1D5DB',
                isDefault: true
            }
        ];

        const createdPresets = [];
        for (const preset of presets) {
            const p = await prisma.colorPreset.create({
                data: { ...preset, createdById: adminUser.id }
            });
            createdPresets.push(p);
        }
        console.log(`   ✅ Created ${createdPresets.length} color presets`);

        // 3. Categories
        console.log('📂 Seeding Categories...');
        const categoriesData = [
            { name: 'Political Instability', presetName: 'Political Red', color: '#EF4444' },
            { name: 'Economic Crisis', presetName: 'Economic Blue', color: '#3B82F6' },
            { name: 'Social Unrest', presetName: 'Social Yellow', color: '#F59E0B' },
            { name: 'Environmental Disaster', presetName: 'Environmental Green', color: '#10B981' },
            { name: 'Infrastructure Failure', presetName: 'Infrastructure Gray', color: '#6B7280' }
        ];

        const createdCategories = [];
        for (const cat of categoriesData) {
            const preset = createdPresets.find(p => p.name === cat.presetName);
            const category = await prisma.category.create({
                data: {
                    name: cat.name,
                    description: `Category for ${cat.name.toLowerCase()}`,
                    color: cat.color,
                    colorPresetId: preset?.id,
                    createdBy: adminUser.id,
                    status: 'ACTIVE'
                }
            });
            createdCategories.push(category);
        }
        console.log(`   ✅ Created ${createdCategories.length} categories`);

        // 4. Cards
        console.log('🃏 Seeding Cards...');
        const cardsData = [
            {
                title: 'Diplomatic Scandal',
                categoryName: 'Political Instability',
                description: 'A high-ranking official has been caught in a compromising situation.',
                political: -10, society: -5,
                responses: [
                    { text: 'Deny everything', politicalEffect: -5, societyEffect: -10, score: 10 },
                    { text: 'Public apology', politicalEffect: 5, societyEffect: 5, score: 20 },
                    { text: 'Resign immediately', politicalEffect: 10, societyEffect: 0, score: 15 }
                ]
            },
            {
                title: 'Market Crash',
                categoryName: 'Economic Crisis',
                description: 'Stock markets are plummeting due to global uncertainty.',
                economic: -20, society: -10,
                responses: [
                    { text: 'Bailout banks', economicEffect: 10, societyEffect: -5, score: 15 },
                    { text: 'Austerity measures', economicEffect: 5, societyEffect: -15, score: 10 },
                    { text: 'Do nothing', economicEffect: -10, societyEffect: -5, score: 5 }
                ]
            },
            {
                title: 'Protests Erupt',
                categoryName: 'Social Unrest',
                description: 'Citizens are protesting against rising living costs.',
                society: -15, political: -5,
                responses: [
                    { text: 'Police crackdown', societyEffect: -20, politicalEffect: -10, score: 5 },
                    { text: 'Negotiate with leaders', societyEffect: 10, politicalEffect: 5, score: 20 },
                    { text: 'Promise reforms', societyEffect: 5, politicalEffect: 0, score: 15 }
                ]
            },
            {
                title: 'Oil Spill',
                categoryName: 'Environmental Disaster',
                description: 'A tanker has capsized, leaking oil into the ocean.',
                environment: -20, economic: -5,
                responses: [
                    { text: 'Chemical dispersants', environmentEffect: -5, economicEffect: -5, score: 10 },
                    { text: 'Manual cleanup', environmentEffect: 10, economicEffect: -10, score: 20 },
                    { text: 'Ignore it', environmentEffect: -20, economicEffect: 0, score: 0 }
                ]
            },
            {
                title: 'Power Grid Failure',
                categoryName: 'Infrastructure Failure',
                description: 'Major blackout affecting half the country.',
                infrastructure: -20, economic: -10,
                responses: [
                    { text: 'Rolling blackouts', infrastructureEffect: 5, economicEffect: -5, score: 15 },
                    { text: 'Emergency repairs', infrastructureEffect: 15, economicEffect: -15, score: 20 },
                    { text: 'Blame hackers', infrastructureEffect: 0, politicalEffect: -5, score: 5 }
                ]
            }
        ];

        for (const cardData of cardsData) {
            const category = createdCategories.find(c => c.name === cardData.categoryName);
            if (!category) continue;

            await prisma.card.create({
                data: {
                    title: cardData.title,
                    description: cardData.description,
                    categoryId: category.id,
                    createdBy: adminUser.id,
                    status: 'OPEN',
                    political: cardData.political || 0,
                    economic: cardData.economic || 0,
                    infrastructure: cardData.infrastructure || 0,
                    society: cardData.society || 0,
                    environment: cardData.environment || 0,
                    cardResponses: {
                        create: cardData.responses.map((r: any) => ({
                            text: r.text,
                            politicalEffect: r.politicalEffect || 0,
                            economicEffect: r.economicEffect || 0,
                            infrastructureEffect: r.infrastructureEffect || 0,
                            societyEffect: r.societyEffect || 0,
                            environmentEffect: r.environmentEffect || 0,
                            score: r.score || 0
                        }))
                    }
                }
            });
        }
        console.log(`   ✅ Created ${cardsData.length} cards`);

    } catch (error) {
        console.error("❌ Error during seeding", error);
        throw error;
    }
}

async function main() {
    console.log('🚀 Starting database reset and seed...\n');

    await clearDatabase();
    console.log('');
    await seedDatabase();

    console.log('\n✨ Database reset and seeding completed successfully!');
}

main()
    .then(async () => {
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error(e);
        await prisma.$disconnect();
        process.exit(1);
    });
