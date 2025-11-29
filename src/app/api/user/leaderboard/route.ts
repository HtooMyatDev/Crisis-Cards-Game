
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from '@/app/actions/auth';

export async function GET(req: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        const searchParams = req.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '100');
        const skip = (page - 1) * limit;

        // Get total unique players count
        const totalPlayersCount = await prisma.player.groupBy({
            by: ['nickname'],
            _count: {
                nickname: true
            }
        });
        const totalPlayers = totalPlayersCount.length;

        // Get paginated players
        const players = await prisma.player.groupBy({
            by: ['nickname'],
            _sum: {
                score: true
            },
            _count: {
                id: true
            },
            orderBy: {
                _sum: {
                    score: 'desc'
                }
            },
            skip,
            take: limit
        });

        // Process leaderboard data for the current page
        const leaderboardPage = await Promise.all(
            players.map(async (player, index) => {
                // Get games won (completed games with high scores)
                const gamesWon = await prisma.player.count({
                    where: {
                        nickname: player.nickname,
                        score: {
                            gte: 800 // Consider 800+ as a win
                        },
                        gameSession: {
                            status: 'COMPLETED'
                        }
                    }
                });

                // Get total completed games
                const completedGames = await prisma.player.count({
                    where: {
                        nickname: player.nickname,
                        gameSession: {
                            status: 'COMPLETED'
                        }
                    }
                });

                // Calculate win rate
                const winRate = completedGames > 0
                    ? Math.round((gamesWon / completedGames) * 100)
                    : 0;

                // Get recent games to calculate streak
                const recentGames = await prisma.player.findMany({
                    where: {
                        nickname: player.nickname,
                        gameSession: {
                            status: 'COMPLETED'
                        }
                    },
                    orderBy: {
                        joinedAt: 'desc'
                    },
                    take: 10,
                    select: {
                        score: true
                    }
                });

                // Calculate current streak
                let streak = 0;
                for (const game of recentGames) {
                    if (game.score >= 800) {
                        streak++;
                    } else {
                        break;
                    }
                }

                return {
                    rank: skip + index + 1,
                    nickname: player.nickname,
                    totalScore: player._sum.score || 0,
                    gamesPlayed: player._count.id,
                    gamesWon,
                    winRate,
                    streak,
                    avgScore: completedGames > 0
                        ? Math.round((player._sum.score || 0) / completedGames)
                        : 0,
                    isCurrentUser: currentUser?.name === player.nickname
                };
            })
        );

        // Get current user stats separately if they exist
        let userStats = {
            totalPlayers,
            rank: 0,
            winRate: 0,
            rankChange: 0
        };

        if (currentUser?.name) {
            // Check if user is in current page
            const userInPage = leaderboardPage.find(p => p.isCurrentUser);

            if (userInPage) {
                userStats = {
                    totalPlayers,
                    rank: userInPage.rank,
                    winRate: userInPage.winRate,
                    rankChange: 0
                };
            } else {
                // Calculate user stats if not in current page
                const userTotalScore = await prisma.player.aggregate({
                    where: { nickname: currentUser.name },
                    _sum: { score: true }
                });

                if (userTotalScore._sum.score) {
                    // Calculate rank: count players with higher score
                    // Note: This is an approximation as we can't easily group by and count in one go for rank
                    // A more accurate way would be to fetch all grouped scores, but that's heavy.
                    // For now, we'll fetch all grouped scores only if needed, or stick to a simpler approximation?
                    // Let's stick to the previous method of fetching all for rank calculation if we want accuracy,
                    // OR since we are paginating, maybe we accept that getting your exact rank is expensive.
                    // Let's try to get the rank by counting groups with higher sums.

                    // Since we can't do "count groups having sum > X" easily in Prisma without raw SQL,
                    // we will use a raw query for the user's rank to be efficient.

                    const userScore = userTotalScore._sum.score;

                    // Raw query to count players with higher total score
                    const rankResult = await prisma.$queryRaw`
                        SELECT COUNT(*) as rank
                        FROM (
                            SELECT SUM(score) as total_score
                            FROM players
                            GROUP BY nickname
                            HAVING SUM(score) > ${userScore}
                        ) as better_players
                    `;

                    // @ts-expect-error - rank is returned as BigInt from raw query
                    const rank = Number(rankResult[0].rank) + 1;

                    // Get user win rate
                    const gamesWon = await prisma.player.count({
                        where: {
                            nickname: currentUser.name,
                            score: { gte: 800 },
                            gameSession: { status: 'COMPLETED' }
                        }
                    });
                    const completedGames = await prisma.player.count({
                        where: {
                            nickname: currentUser.name,
                            gameSession: { status: 'COMPLETED' }
                        }
                    });
                    const winRate = completedGames > 0 ? Math.round((gamesWon / completedGames) * 100) : 0;

                    userStats = {
                        totalPlayers,
                        rank,
                        winRate,
                        rankChange: 0
                    };
                }
            }
        }

        return NextResponse.json({
            leaderboard: leaderboardPage,
            userStats,
            pagination: {
                page,
                limit,
                totalPages: Math.ceil(totalPlayers / limit),
                totalItems: totalPlayers
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        return NextResponse.json(
            { error: 'Failed to fetch leaderboard' },
            { status: 500 }
        );
    }
}
