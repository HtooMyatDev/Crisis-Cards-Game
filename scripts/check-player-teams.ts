import { prisma } from '../src/lib/prisma';

async function checkGamePlayers() {
  // Get all games with WAITING status
  const games = await prisma.gameSession.findMany({
    where: { status: 'WAITING' },
    include: {
      players: {
        select: {
          id: true,
          nickname: true,
          team: true,
        }
      }
    },
    take: 5,
    orderBy: { createdAt: 'desc' }
  });

  console.log('Games with WAITING status:\n');

  games.forEach(game => {
    console.log(`Game: ${game.name} (${game.gameCode})`);
    console.log(`  Players: ${game.players.length}`);

    const redTeam = game.players.filter(p => p.team?.name === 'The Red Team' || p.team?.name === 'RED');
    const blueTeam = game.players.filter(p => p.team?.name === 'The Blue Team' || p.team?.name === 'BLUE');
    const noTeam = game.players.filter(p => !p.team);

    console.log(`  RED team: ${redTeam.length} players`);
    redTeam.forEach(p => console.log(`    - ${p.nickname}`));

    console.log(`  BLUE team: ${blueTeam.length} players`);
    blueTeam.forEach(p => console.log(`    - ${p.nickname}`));

    if (noTeam.length > 0) {
      console.log(`  No team: ${noTeam.length} players`);
      noTeam.forEach(p => console.log(`    - ${p.nickname} (team: ${JSON.stringify(p.team)})`));
    }

    console.log('');
  });

  await prisma.$disconnect();
}

checkGamePlayers().catch(console.error);
