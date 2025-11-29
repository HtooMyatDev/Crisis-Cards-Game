import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get player records for this user
    const playerRecords = await prisma.player.findMany({
      where: {
        userId: user.id,
        gameSession: { status: 'COMPLETED' }
      },
      select: {
        score: true,
        joinedAt: true,
        gameSession: {
          select: {
            status: true,
            endedAt: true,
            startedAt: true
          }
        }
      },
      orderBy: { joinedAt: 'desc' }
    });

    // Calculate total score and games played
    const totalScore = playerRecords.reduce((sum, p) => sum + p.score, 0);
    const gamesPlayed = playerRecords.length;

    // Calculate win rate (score >= 800 is considered a win)
    const gamesWon = playerRecords.filter(p => p.score >= 800).length;
    const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

    // Calculate streak (consecutive wins from most recent games)
    let streak = 0;
    for (const record of playerRecords) {
      if (record.score >= 800) {
        streak++;
      } else {
        break;
      }
    }

    // Calculate level based on total score
    const level = Math.min(Math.floor(totalScore / 1000) + 1, 100);

    // Calculate rank (count players with higher total score)
    const rankResult = await prisma.$queryRaw<Array<{ rank: bigint }>>`
      SELECT COUNT(*) as rank
      FROM (
        SELECT SUM(score) as total_score
        FROM players
        WHERE "userId" IS NOT NULL
        GROUP BY "userId"
        HAVING SUM(score) > ${totalScore}
      ) as better_players
    `;
    const rank = Number(rankResult[0]?.rank || 0) + 1;

    // Get achievements count
    const achievementsCount = await prisma.userAchievement.count({
      where: { userId: user.id }
    });

    // Calculate hours played (estimate based on game duration)
    let hoursPlayed = 0;
    for (const record of playerRecords) {
      if (record.gameSession.startedAt && record.gameSession.endedAt) {
        const duration = record.gameSession.endedAt.getTime() - record.gameSession.startedAt.getTime();
        hoursPlayed += duration / (1000 * 60 * 60); // Convert ms to hours
      }
    }
    hoursPlayed = Math.round(hoursPlayed * 10) / 10; // Round to 1 decimal

    // Get games hosted
    const gamesHosted = await prisma.gameSession.count({
      where: { hostId: user.id }
    });

    const completedGames = await prisma.gameSession.count({
      where: {
        hostId: user.id,
        status: 'COMPLETED'
      }
    });

    const totalPlayers = await prisma.player.count({
      where: {
        gameSession: {
          hostId: user.id
        }
      }
    });


    const stats = {
      level: isNaN(level) ? 1 : level,
      totalScore: isNaN(totalScore) ? 0 : totalScore,
      gamesPlayed: isNaN(gamesPlayed) ? 0 : gamesPlayed,
      winRate: isNaN(winRate) ? 0 : winRate,
      streak: isNaN(streak) ? 0 : streak,
      rank: isNaN(rank) ? 0 : rank,
      achievements: isNaN(achievementsCount) ? 0 : achievementsCount,
      hoursPlayed: isNaN(hoursPlayed) ? 0 : hoursPlayed,
      gamesHosted: isNaN(gamesHosted) ? 0 : gamesHosted,
      completedGames: isNaN(completedGames) ? 0 : completedGames,
      totalPlayers: isNaN(totalPlayers) ? 0 : totalPlayers
    };

    return NextResponse.json({
      success: true,
      profile: {
        ...userProfile,
        stats
      }
    });
  } catch (error) {
    console.error('Failed to fetch user profile:', error);
    return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, username, bio, location } = body;

    // Validate input
    if (name !== undefined && typeof name !== 'string') {
      return NextResponse.json({ error: 'Invalid name' }, { status: 400 });
    }

    if (username !== undefined && typeof username !== 'string') {
      return NextResponse.json({ error: 'Invalid username' }, { status: 400 });
    }

    if (bio !== undefined && typeof bio !== 'string') {
      return NextResponse.json({ error: 'Invalid bio' }, { status: 400 });
    }

    if (location !== undefined && typeof location !== 'string') {
      return NextResponse.json({ error: 'Invalid location' }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(name !== undefined && { name }),
        ...(username !== undefined && { username }),
        ...(bio !== undefined && { bio }),
        ...(location !== undefined && { location }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        bio: true,
        location: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return NextResponse.json({
      success: true,
      profile: updatedUser
    });
  } catch (error) {
    console.error('Failed to update user profile:', error);
    return NextResponse.json({ error: 'Failed to update user profile' }, { status: 500 });
  }
}
