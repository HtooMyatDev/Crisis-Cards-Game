import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from 'dotenv';
import { resolve } from 'path';

const prisma = new PrismaClient();

config({ path: resolve(__dirname, '../.env') });


const email = process.env.ADMIN_EMAIL;
const password = process.env.ADMIN_PASSWORD;

const SALT_ROUNDS = 10;

async function main() {
    if (!email || !password) {
        throw new Error('ADMIN_EMAIL and ADMIN_PASSWORD must be set in the environment variables.');
    }
    try {
        // 1. Admin User
        console.log('👤 Seeding Admin User...');
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS)

        const adminUser = await prisma.user.upsert({
            where: { email },
            update: { password: hashedPassword },
            create: {
                email,
                password: hashedPassword,
                name: 'Super Admin',
                username: 'admin',
                role: 'ADMIN',
                isActive: true,
            }
        });
        console.log(`   ✅ Admin user ready: ${adminUser.email}`);

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

        for (const preset of presets) {
            await prisma.colorPreset.upsert({
                where: { id: 0 }, // Hack to force create if not matching by unique constraint (which we don't have on name easily accessible here without query) - actually better to just createMany or upsert by name if unique.
                // Wait, name is not unique in schema? Let's check schema.
                // Schema: ColorPreset name is just String @db.VarChar(50), not unique.
                // Let's use findFirst to check existence to avoid duplicates on re-seed if we didn't wipe.
                // But we are wiping. So create is fine.
                update: {},
                create: {
                    ...preset,
                    createdById: adminUser.id
                }
            }).catch(async () => {
                 // Fallback if upsert fails or just use create
                 const existing = await prisma.colorPreset.findFirst({ where: { name: preset.name }});
                 if (!existing) {
                     await prisma.colorPreset.create({
                         data: { ...preset, createdById: adminUser.id }
                     });
                 }
            });
        }
        // Actually, let's just delete all presets and recreate to be clean since we are doing a reset?
        // The user said "drop the database and refresh", so we can assume empty state if we run db push --force-reset.
        // But to be safe in `seed.ts` which might be run standalone:
        // Let's just use `create` since we expect empty DB after reset.
        // However, to make it robust:

        // Let's clear existing data first if we want to be super sure, but `db push --force-reset` does that.
        // So I will just use create.

        // Re-implementing loop for clarity and robustness
        const createdPresets = [];
        for (const preset of presets) {
             const p = await prisma.colorPreset.create({
                 data: { ...preset, createdById: adminUser.id }
             });
             createdPresets.push(p);
        }
        console.log(`   ✅ Created ${createdPresets.length} color presets`);

        // 3. Categories
        console.log('j Seeding Categories...');
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
                    { text: 'Deny everything', impact: 'Public trust hits an all-time low as evidence surfaces, causing widespread cynicism.', politicalEffect: -5, societyEffect: -10, score: 10, cost: 50 },
                    { text: 'Public apology', impact: 'The apology is received with mixed feelings, but stabilize the immediate political fallout.', politicalEffect: 5, societyEffect: 5, score: 20, cost: 100 },
                    { text: 'Resign immediately', impact: 'The swift resignation restores some integrity to the office, though chaos ensues in the power vacuum.', politicalEffect: 10, societyEffect: 0, score: 15, cost: 0 }
                ]
            },
            {
                title: 'Election Fraud Allegations',
                categoryName: 'Political Instability',
                description: 'Opposition party claims voting irregularities in key districts.',
                political: -15, society: -10,
                responses: [
                    { text: 'Recount votes', impact: 'The recount confirms the results but delays governance for weeks, increasing anxiety.', politicalEffect: 5, societyEffect: 5, score: 15, cost: 500 },
                    { text: 'Dismiss claims', impact: 'Dismissal fuels violent protests and deepens the divide between political factions.', politicalEffect: -10, societyEffect: -15, score: 5, cost: 0 },
                    { text: 'Call new elections', impact: 'New elections calm the streets but drain the treasury and stall all legislation.', politicalEffect: 10, societyEffect: 10, score: 20, cost: 2000 }
                ]
            },
            {
                title: 'Market Crash',
                categoryName: 'Economic Crisis',
                description: 'Stock markets are plummeting due to global uncertainty.',
                economic: -20, society: -10,
                responses: [
                    { text: 'Bailout banks', impact: 'Banks are saved, preventing total collapse, but the public is furious at the use of tax funds.', economicEffect: 10, societyEffect: -5, score: 15, cost: 5000 },
                    { text: 'Austerity measures', impact: 'Spending cuts stabilize the budget but strangle growth and hurt the most vulnerable.', economicEffect: 5, societyEffect: -15, score: 10, cost: 0 },
                    { text: 'Do nothing', impact: 'The market freefall wipes out savings, leading to a long and painful recession.', economicEffect: -10, societyEffect: -5, score: 5, cost: 0 }
                ]
            },
            {
                title: 'Currency Devaluation',
                categoryName: 'Economic Crisis',
                description: 'National currency loses 20% value overnight due to speculation.',
                economic: -15, political: -5,
                responses: [
                    { text: 'Raise interest rates', impact: 'Higher rates stabilize the currency but crush small businesses and slow housing.', economicEffect: 10, societyEffect: -5, score: 15, cost: 0 },
                    { text: 'Peg currency', impact: 'Pegging the currency costs a fortune in reserves, offering only temporary relief.', economicEffect: 5, politicalEffect: 5, score: 10, cost: 3000 },
                    { text: 'Seek IMF loan', impact: 'The loan averts crisis but comes with strict conditions that limit national sovereignty.', economicEffect: 15, politicalEffect: -10, score: 20, cost: 500 }
                ]
            },
            {
                title: 'Protests Erupt',
                categoryName: 'Social Unrest',
                description: 'Citizens are protesting against rising living costs.',
                society: -15, political: -5,
                responses: [
                    { text: 'Police crackdown', impact: 'The crackdown restores order temporarily but radicalizes the movement against the state.', societyEffect: -20, politicalEffect: -10, score: 5, cost: 1000 },
                    { text: 'Negotiate with leaders', impact: 'Negotiations de-escalate tension, leading to a peaceful, albeit expensive, resolution.', societyEffect: 10, politicalEffect: 5, score: 20, cost: 100 },
                    { text: 'Promise reforms', impact: 'Promises calm the crowd for now, but failure to deliver will lead to worse riots later.', societyEffect: 5, politicalEffect: 0, score: 15, cost: 2000 }
                ]
            },
            {
                title: 'Pandemic Outbreak',
                categoryName: 'Social Unrest',
                description: 'A new contagious virus is spreading rapidly in urban areas.',
                society: -20, economic: -10,
                responses: [
                    { text: 'Strict lockdown', impact: 'The lockdown effectively curbs the spread but devastates the local economy and morale.', societyEffect: 10, economicEffect: -15, score: 15, cost: 5000 },
                    { text: 'Mask mandate only', impact: 'Masks slow the spread slightly without harming the economy, but cases still rise.', societyEffect: 5, economicEffect: -5, score: 10, cost: 500 },
                    { text: 'Vaccine mandate', impact: 'Mandates ensure long-term immunity but spark fierce resistance and protests.', societyEffect: 15, politicalEffect: -10, score: 20, cost: 2000 }
                ]
            },
            {
                title: 'Oil Spill',
                categoryName: 'Environmental Disaster',
                description: 'A tanker has capsized, leaking oil into the ocean.',
                environment: -20, economic: -5,
                responses: [
                    { text: 'Chemical dispersants', impact: 'Dispersants break up the oil visually but introduce new toxins into the ecosystem.', environmentEffect: -5, economicEffect: -5, score: 10, cost: 1000 },
                    { text: 'Manual cleanup', impact: 'Manual cleanup is slow and expensive, but the most environmentally responsible choice.', environmentEffect: 10, economicEffect: -10, score: 20, cost: 3000 },
                    { text: 'Ignore it', impact: 'Ignoring the spill saves money today but destroys the coastline and tourism for decades.', environmentEffect: -20, economicEffect: 0, score: 0, cost: 0 }
                ]
            },
            {
                title: 'Wildfire Spreading',
                categoryName: 'Environmental Disaster',
                description: 'Uncontrolled wildfires threaten national parks and nearby towns.',
                environment: -15, society: -10,
                responses: [
                    { text: 'Evacuate towns', impact: 'Evacuations save lives but leave homes and history to be consumed by the flames.', societyEffect: 10, economicEffect: -5, score: 20, cost: 2000 },
                    { text: 'Deploy military', impact: 'Military support helps contain the fire efficiently, boosting government approval.', environmentEffect: 5, politicalEffect: 5, score: 15, cost: 1500 },
                    { text: 'Let it burn out', impact: 'Letting it burn is natural but horrifying to watch, causing immense public outcry.', environmentEffect: -20, societyEffect: -10, score: 5, cost: 0 }
                ]
            },
            {
                title: 'Power Grid Failure',
                categoryName: 'Infrastructure Failure',
                description: 'Major blackout affecting half the country.',
                infrastructure: -20, economic: -10,
                responses: [
                    { text: 'Rolling blackouts', impact: 'Blackouts manage the load but disrupt life and business, angering the population.', infrastructureEffect: 5, economicEffect: -5, score: 15, cost: 0 },
                    { text: 'Emergency repairs', impact: 'Rapid, expensive repairs restore power quickly, averting a larger crisis.', infrastructureEffect: 15, economicEffect: -15, score: 20, cost: 4000 },
                    { text: 'Blame hackers', impact: 'Blaming hackers diverts attention but leaves the grid vulnerable to future failures.', infrastructureEffect: 0, politicalEffect: -5, score: 5, cost: 100 }
                ]
            },
            {
                title: 'Bridge Collapse',
                categoryName: 'Infrastructure Failure',
                description: 'A major bridge has collapsed during rush hour traffic.',
                infrastructure: -25, society: -10,
                responses: [
                    { text: 'Emergency rescue', impact: 'Rescue efforts are heroic and save lives, uniting the city in grief and hope.', societyEffect: 10, economicEffect: -5, score: 20, cost: 2000 },
                    { text: 'Investigate corruption', impact: 'The investigation reveals rot at the core, purging bad actors but delaying rebuilding.', politicalEffect: -5, infrastructureEffect: 5, score: 15, cost: 500 },
                    { text: 'Rebuild cheap', impact: 'A quick, cheap rebuild gets traffic moving but leaves lingering safety doubts.', infrastructureEffect: -5, economicEffect: 5, score: 5, cost: 1000 }
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
                    status: 'Active', // CORRECTED STATUS
                    // Card base values removed - now on Team model
                    cardResponses: {
                        create: cardData.responses.map((r: any) => ({
                            text: r.text,
                            politicalEffect: r.politicalEffect || 0,
                            economicEffect: r.economicEffect || 0,
                            infrastructureEffect: r.infrastructureEffect || 0,
                            societyEffect: r.societyEffect || 0,
                            environmentEffect: r.environmentEffect || 0,
                            score: r.score || 0,
                            impactDescription: r.impact, // Added impact textual description
                            cost: r.cost || 0 // Use provided cost or 0
                        }))
                    }
                }
            });
        }
        console.log(`   ✅ Created ${cardsData.length} cards`);

    }

    catch (error) {
        console.error("❌ Error during seeding", error)
        throw error;
    }
}

main().then(async () => {
    await prisma.$disconnect();
}).catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
})
