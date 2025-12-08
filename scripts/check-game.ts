import { prisma } from '../src/lib/prisma';

async function checkGame() {
  const gameId = 'cmir0etcn0001fl40c2v8txf7';

  console.log(`Checking for game with ID: ${gameId}`);

  const game = await prisma.gameSession.findUnique({
    where: { id: gameId },
    select: {
      id: true,
      name: true,
      gameCode: true,
      status: true,
      hostId: true,
    }
  });

  if (game) {
    console.log('Game found:', game);
  } else {
    console.log('Game NOT found');

    // Let's check all games
    const allGames = await prisma.gameSession.findMany({
      select: {
        id: true,
        name: true,
        gameCode: true,
        status: true,
      },
      take: 10,
      orderBy: { createdAt: 'desc' }
    });

    console.log('\nRecent games:');
    allGames.forEach(g => {
      console.log(`- ID: ${g.id}, Code: ${g.gameCode}, Name: ${g.name}, Status: ${g.status}`);
    });
  }

  await prisma.$disconnect();
}

checkGame().catch(console.error);
