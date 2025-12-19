
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixTimeLimits() {
  try {
    const updateResult = await prisma.card.updateMany({
      where: {
        timeLimit: null
      },
      data: {
        timeLimit: 5 // Default to 5 minutes
      }
    });

    console.log(`Updated ${updateResult.count} cards with default time limit.`);

  } catch (error) {
    console.error("Error updating time limits:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixTimeLimits();
