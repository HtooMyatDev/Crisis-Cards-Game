// src/app/api/admin/dashboard/route.ts
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET() {
  try {
    // Check authentication
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    // Basic counts
    const [totalUsers, totalCards, totalCategories, totalGames] = await Promise.all([
      prisma.user.count(),
      prisma.card.count({ where: { status: 'OPEN', isArchived: false } }),
      prisma.category.count(),
      prisma.gameSession.count(),
    ]);

    // Category Distribution - Count cards per category
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        color: true,
        _count: {
          select: {
            cards: {
              where: {
                status: 'OPEN',
                isArchived: false
              }
            }
          }
        }
      }
    });

    // Sort by card count descending and filter out categories with no cards
    const categoryDistribution = categories
      .filter(cat => cat._count.cards > 0)
      .sort((a, b) => b._count.cards - a._count.cards)
      .map(cat => ({
        name: cat.name,
        value: cat._count.cards,
        color: cat.color || '#3B82F6'
      }));

    // Weekly Activity - Last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    // Fetch all data for the last 7 days in parallel
    const [weeklyUsers, weeklyCards, weeklyGames] = await Promise.all([
      prisma.user.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.card.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      }),
      prisma.gameSession.findMany({
        where: { createdAt: { gte: sevenDaysAgo } },
        select: { createdAt: true }
      })
    ]);

    const weeklyData = [];
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    for (let i = 0; i < 7; i++) {
      const dayStart = new Date(sevenDaysAgo);
      dayStart.setDate(dayStart.getDate() + i);
      const dayEnd = new Date(dayStart);
      dayEnd.setHours(23, 59, 59, 999);

      weeklyData.push({
        day: dayNames[dayStart.getDay()],
        users: weeklyUsers.filter(u => u.createdAt >= dayStart && u.createdAt <= dayEnd).length,
        cards: weeklyCards.filter(c => c.createdAt >= dayStart && c.createdAt <= dayEnd).length,
        games: weeklyGames.filter(g => g.createdAt >= dayStart && g.createdAt <= dayEnd).length
      });
    }

    // Monthly Growth - Last 6 months
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Get base count before the 6 month window
    const baseUserCount = await prisma.user.count({
      where: { createdAt: { lt: sixMonthsAgo } }
    });

    // Get all users created in the last 6 months
    const recentUsersForGrowth = await prisma.user.findMany({
      where: { createdAt: { gte: sixMonthsAgo } },
      select: { createdAt: true }
    });

    const monthlyGrowth = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    let runningTotal = baseUserCount;

    for (let i = 0; i < 6; i++) {
      const monthDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i, 1);
      const nextMonthDate = new Date(sixMonthsAgo.getFullYear(), sixMonthsAgo.getMonth() + i + 1, 1);

      const newUsersInMonth = recentUsersForGrowth.filter(u =>
        u.createdAt >= monthDate && u.createdAt < nextMonthDate
      ).length;

      runningTotal += newUsersInMonth;

      monthlyGrowth.push({
        month: monthNames[monthDate.getMonth()],
        value: runningTotal
      });
    }

    // Recent activity: fetch latest 5 entries from players, cards, and game sessions
    const recentPlayers = await prisma.player.findMany({
      orderBy: { joinedAt: 'desc' },
      take: 5,
      select: { id: true, nickname: true, joinedAt: true },
    });
    const recentCards = await prisma.card.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, title: true, createdAt: true },
    });
    const recentGames = await prisma.gameSession.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: { id: true, name: true, gameCode: true, createdAt: true },
    });

    const recentActivity: Array<{ type: string; action: string; user: string; time: Date }> = [];
    recentPlayers.forEach(p => {
      recentActivity.push({ type: 'player', action: 'Joined', user: p.nickname, time: p.joinedAt });
    });
    recentCards.forEach(c => {
      recentActivity.push({ type: 'card', action: 'Created', user: 'System', time: c.createdAt });
    });
    recentGames.forEach(g => {
      recentActivity.push({ type: 'game', action: 'Started', user: 'System', time: g.createdAt });
    });
    // Sort by time descending and limit to 5
    recentActivity.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
    const recent = recentActivity.slice(0, 5);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCards,
        totalCategories,
        totalGames,
      },
      categoryDistribution,
      weeklyActivity: weeklyData,
      monthlyGrowth,
      recentActivity: recent,
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch dashboard data',
        details: process.env.NODE_ENV === 'development' && error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}
