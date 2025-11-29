import { prisma } from "@/lib/prisma";

export const ACHIEVEMENTS = [
    {
        name: 'First Steps',
        description: 'Play your first game',
        icon: 'Gamepad2',
        condition: 'gamesPlayed >= 1',
        points: 10
    },
    {
        name: 'Crisis Manager',
        description: 'Win 5 games',
        icon: 'Trophy',
        condition: 'gamesWon >= 5',
        points: 50
    },
    {
        name: 'Veteran',
        description: 'Play 50 games',
        icon: 'Award',
        condition: 'gamesPlayed >= 50',
        points: 100
    },
    {
        name: 'High Scorer',
        description: 'Score over 1000 points in a single game',
        icon: 'Target',
        condition: 'maxScore >= 1000',
        points: 30
    },
    {
        name: 'Unstoppable',
        description: 'Achieve a win streak of 3',
        icon: 'Zap',
        condition: 'streak >= 3',
        points: 40
    }
];

export async function seedAchievements() {
    console.log('Seeding achievements...');
    for (const achievement of ACHIEVEMENTS) {
        await prisma.achievement.upsert({
            where: { name: achievement.name },
            update: achievement,
            create: achievement
        });
    }
    console.log('Achievements seeded successfully.');
}

// Function to check and unlock achievements for a user
export async function checkAchievements(userId: number, stats: Record<string, number>) {
    const userAchievements = await prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true }
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievementId));
    const allAchievements = await prisma.achievement.findMany();

    for (const achievement of allAchievements) {
        if (unlockedIds.has(achievement.id)) continue;

        // Simple condition evaluation (safe for this context)
        // In a real app, use a safer evaluation engine or specific logic handlers
        let conditionMet = false;
        try {
            // Create a function with stats keys as variables
            const keys = Object.keys(stats);
            const values = Object.values(stats);
            const check = new Function(...keys, `return ${achievement.condition};`);
            conditionMet = check(...values);
        } catch (e) {
            console.error(`Error evaluating condition for ${achievement.name}:`, e);
        }

        if (conditionMet) {
            await prisma.userAchievement.create({
                data: {
                    userId,
                    achievementId: achievement.id
                }
            });
            console.log(`User ${userId} unlocked achievement: ${achievement.name}`);
        }
    }
}
