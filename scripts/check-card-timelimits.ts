
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkTimeLimits() {
  try {
    const cards = await prisma.card.findMany({
      select: {
        id: true,
        title: true,
        timeLimit: true,
        status: true
      },
      take: 20
    });

    console.table(cards);

    const cardsWithTimeLimit = cards.filter(c => c.timeLimit !== null && c.timeLimit !== undefined);
    console.log(`Total checked: ${cards.length}`);
    console.log(`With timeLimit: ${cardsWithTimeLimit.length}`);

  } catch (error) {
    console.error("Error checking time limits:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTimeLimits();
