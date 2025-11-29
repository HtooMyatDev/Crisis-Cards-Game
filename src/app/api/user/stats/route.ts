import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's game statistics
    const [totalGamesHosted, completedHostedGames, playedGamesStats] = await Promise.all([
      // Games where user is the host
      prisma.gameSession.count({
        where: {
          hostId: user.id
        }
      }),
      // Completed games hosted
      prisma.gameSession.count({
        where: {
          hostId: user.id,
          status: 'COMPLETED'
        }
      }),
      // Games played by user (as a player)
      prisma.player.aggregate({
        where: {
          userId: user.id
        },
        _count: {
          id: true
        },
        _sum: {
          score: true
        }
      })
    ]);

    const totalGamesPlayed = playedGamesStats._count?.id ?? 0;
    const totalScore = playedGamesStats._sum?.score ?? 0;

    return NextResponse.json({
      success: true,
      stats: {
        gamesHosted: totalGamesHosted,
        gamesPlayed: totalGamesPlayed,
        completedGames: completedHostedGames, // Keeping this as hosted completed for now, or could be sum
        totalScore,
        userName: user.name || 'Agent'
      }
    });
  } catch (error) {
    console.error('Failed to fetch user stats:', error);
    return NextResponse.json({ error: 'Failed to fetch user stats' }, { status: 500 });
  }
}
