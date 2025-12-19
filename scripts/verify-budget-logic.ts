import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('🧪 Setting up Budget Logic Test...');

    const gameCode = 'BUDGET_TEST';

    // 1. Cleanup existing
    await prisma.gameSession.deleteMany({ where: { gameCode } });
    await prisma.user.upsert({
        where: { email: 'test@example.com' },
        update: {},
        create: {
            email: 'test@example.com',
            password: 'hash',
            name: 'Test Host'
        }
    });

    const host = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
    if (!host) throw new Error('Host not found');

    // 2. Create Game
    const game = await prisma.gameSession.create({
        data: {
            gameCode,
            name: 'Budget Logic Test',
            hostId: host.id,
            status: 'IN_PROGRESS',
            roundStatus: 'LEADER_ELECTION', // Will switch to LEADER_ELECTION after next, but let's emulate "Just finished decision"?
            // Actually next/route expects us to be IN_PROGRESS, finishing a card.
            currentCardIndex: 0,
            initialBudget: 5000
        }
    });

    // 3. Create Team
    const team = await prisma.team.create({
        data: {
            gameSessionId: game.id,
            name: 'Test Team',
            budget: 5000,
            baseValue: 0
        }
    });

    // 4. Create Player
    const player = await prisma.player.create({
        data: {
            gameSessionId: game.id,
            nickname: 'Leader',
            isLeader: true,
            teamId: team.id,
            userId: host.id
        }
    });

    // 5. Create Card & Response
    // We need a category first
    const category = await prisma.category.create({
        data: {
            name: 'Test Cat',
            createdBy: host.id,
            color: '#000000'
        }
    });

    // Link category to game
    await prisma.gameSessionCategory.create({
        data: {
            gameSessionId: game.id,
            categoryId: category.id
        }
    });

    const card = await prisma.card.create({
        data: {
            title: 'Budget Test Card',
            categoryId: category.id,
            createdBy: host.id,
            status: 'Active'
        }
    });

    // Update game to use this card (via shuffledIds usually, or category fallback)
    await prisma.gameSession.update({
        where: { id: game.id },
        data: { shuffledCardIds: [card.id, card.id] } // Need at least 2 to advance
    });

    const response = await prisma.cardResponse.create({
        data: {
            cardId: card.id,
            text: 'Costly Option',
            cost: 100,
            economicEffect: -50 // Should result in -150 total change (Budget - 100 + (-50))?
            // Wait, logic is: budget: { increment: budgetChange } where budgetChange = economicEffect - cost
            // So -50 - 100 = -150.
            // Expected Final Budget: 5000 - 150 = 4850.
        }
    });

    // 6. Player Response
    await prisma.playerResponse.create({
        data: {
            playerId: player.id,
            cardId: card.id,
            responseId: response.id
        }
    });

    console.log(`
✅ Setup Complete!

Game Code: ${gameCode}
Team ID: ${team.id}
Current Budget: ${team.budget}
Response Cost: ${response.cost}
Response Econ Effect: ${response.economicEffect}
Expected Change: ${response.economicEffect} - ${response.cost} = ${response.economicEffect - response.cost}
Expected Final Budget: ${team.budget + (response.economicEffect - response.cost)}

To Verify:
1. Ensure the app is running (npm run dev).
2. Run this curl command:
   curl -X POST http://localhost:3000/api/game/${gameCode}/next

3. Check the database or UI to see if Team Budget is 4850.
    `);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
