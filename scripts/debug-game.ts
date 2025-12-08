import { prisma } from '../src/lib/prisma';

async function debugGame() {
  const gameId = 'cmir0etcn0001fl40c2v8txf7';

  const game = await prisma.gameSession.findUnique({
    where: { id: gameId },
    include: {
      categories: {
        include: {
          category: {
            include: {
              cards: {
                where: {
                  status: 'OPEN',
                  isArchived: false
                }
              }
            }
          }
        }
      }
    }
  });

  if (!game) {
    console.log('Game not found');
    return;
  }

  console.log('Game Info:');
  console.log(`- ID: ${game.id}`);
  console.log(`- Name: ${game.name}`);
  console.log(`- Status: ${game.status}`);
  console.log(`- Current Card Index: ${game.currentCardIndex}`);
  console.log(`- Shuffled Card IDs: ${game.shuffledCardIds.length} cards`);
  console.log(`- Shuffled IDs: [${game.shuffledCardIds.join(', ')}]`);

  console.log('\nCategories:');
  game.categories.forEach((gc, i) => {
    console.log(`\n${i + 1}. ${gc.category.name} (ID: ${gc.category.id})`);
    console.log(`   Cards: ${gc.category.cards.length}`);
    gc.category.cards.forEach((card, j) => {
      console.log(`   - Card ${j + 1}: ID=${card.id}, Title="${card.title}"`);
    });
  });

  const allCards = game.categories.flatMap(gc => gc.category.cards);
  console.log(`\nTotal cards across all categories: ${allCards.length}`);
  console.log(`Current card index: ${game.currentCardIndex}`);

  if (game.currentCardIndex < allCards.length) {
    const currentCard = allCards[game.currentCardIndex];
    console.log(`\nCurrent card should be: ID=${currentCard.id}, Title="${currentCard.title}"`);
  } else {
    console.log(`\n❌ ERROR: Current card index (${game.currentCardIndex}) is out of bounds! (max: ${allCards.length - 1})`);
  }

  await prisma.$disconnect();
}

debugGame().catch(console.error);
