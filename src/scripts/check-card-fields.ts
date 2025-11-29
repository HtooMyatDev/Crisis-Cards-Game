import { prisma } from '../lib/prisma';

async function main() {
  console.log('Checking Card model fields...');
  try {
    // We can't check types at runtime easily, but we can try to create a dummy query
    // or check the dmmf if we had access.
    // Instead, let's just print the keys of a result if we can fetch one.
    const card = await prisma.card.findFirst();
    if (card) {
      console.log('Card keys:', Object.keys(card));
      if ('political' in card) {
        console.log('✅ Card has political field');
      } else {
        console.error('❌ Card MISSING political field');
      }
    } else {
      console.log('No cards found to check.');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
