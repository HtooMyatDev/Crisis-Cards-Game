import { prisma } from '../src/lib/prisma';

async function checkCards() {
  const shuffledCardIds = [10, 15, 11, 6, 13, 14, 7, 8, 12, 9];

  console.log('Checking cards from shuffledCardIds...\n');

  for (const cardId of shuffledCardIds) {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      select: {
        id: true,
        title: true,
        status: true,
        isArchived: true,
        categoryId: true,
        category: {
          select: {
            name: true
          }
        }
      }
    });

    if (card) {
      const statusIcon = card.status === 'OPEN' && !card.isArchived ? '✅' : '❌';
      console.log(`${statusIcon} Card ${cardId}: "${card.title}"`);
      console.log(`   Category: ${card.category.name}`);
      console.log(`   Status: ${card.status}, Archived: ${card.isArchived}`);
    } else {
      console.log(`❌ Card ${cardId}: NOT FOUND IN DATABASE`);
    }
    console.log('');
  }

  // Check how many OPEN cards exist
  const openCards = await prisma.card.count({
    where: {
      status: 'OPEN',
      isArchived: false
    }
  });

  console.log(`\nTotal OPEN and non-archived cards in database: ${openCards}`);

  await prisma.$disconnect();
}

checkCards().catch(console.error);
