import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('🧹 Starting Color Preset cleanup...');

    try {
        // 1. Get all presets
        const allPresets = await prisma.colorPreset.findMany({
            include: {
                categories: true
            }
        });

        console.log(`📊 Found ${allPresets.length} total presets.`);

        // 2. Identify the "core" names we want to keep
        const coreNames = [
            'Political Red',
            'Economic Blue',
            'Social Yellow',
            'Environmental Green',
            'Infrastructure Orange'
        ];

        let deletedCount = 0;

        for (const name of coreNames) {
            // Find all presets with this name
            const matches = allPresets.filter((p: any) => p.name === name);

            if (matches.length > 1) {
                console.log(`🔍 Found ${matches.length} duplicates for "${name}"`);

                // Sort by ID descending (keep the newest one potentially)
                matches.sort((a: any, b: any) => b.id - a.id);

                const toDelete = matches.slice(1);

                for (const p of toDelete) {
                    // Only delete if it has no categories attached
                    if (p.categories.length === 0) {
                        await prisma.colorPreset.delete({ where: { id: p.id } });
                        deletedCount++;
                    } else {
                        console.log(`⚠️  Skipping deletion of preset ID ${p.id} ("${name}") because it is still linked to categories.`);
                    }
                }
            }
        }

        // 3. Delete any other presets that are not in coreNames AND have no categories
        const nonCorePresets = allPresets.filter((p: any) => !coreNames.includes(p.name));
        for (const p of nonCorePresets) {
            if (p.categories.length === 0) {
                await prisma.colorPreset.delete({ where: { id: p.id } });
                deletedCount++;
            }
        }

        console.log(`✅ Cleanup complete. Deleted ${deletedCount} orphaned/duplicate presets.`);
    } catch (error) {
        console.error('❌ Error during cleanup:', error);
    } finally {
        await prisma.$disconnect();
    }
}

cleanup();
