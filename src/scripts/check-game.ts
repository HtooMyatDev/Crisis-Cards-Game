
import { prisma } from "@/lib/prisma";

async function main() {
  const games = await prisma.gameSession.findMany({
    include: {
        categories: {
            include: {
                category: {
                    include: {
                        cards: true
                    }
                }
            }
        }
    }
  })

  console.log('Found games:', games.length)
  for (const game of games) {
    console.log(`Game: ${game.gameCode}, Status: ${game.status}`)
    console.log(`Categories: ${game.categories.length}`)
    let cardCount = 0
    for (const gc of game.categories) {
        console.log(`  - Category: ${gc.category.name}, Cards: ${gc.category.cards.length}`)
        for (const card of gc.category.cards) {
            console.log(`    - Card: ${card.title}, Status: ${card.status}, Archived: ${card.isArchived}`)
        }
        cardCount += gc.category.cards.length
    }
    console.log(`Total Cards: ${cardCount}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
