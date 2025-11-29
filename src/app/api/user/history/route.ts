
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from '@/app/actions/auth';

export async function GET(req: NextRequest) {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get all game sessions where the user was a player
        const gameSessions = await prisma.gameSession.findMany({
            where: {
                players: {
                    some: {
                        userId: user.id
                    }
                }
            },
            include: {
                players: {
                    where: {
                        userId: user.id
                    }
                },
                categories: {
                    include: {
                        category: true
                    }
                },
                _count: {
                    select: {
                        players: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Transform the data to match the frontend interface
        const gameHistory = gameSessions.map(session => {
            const player = session.players[0];
            const duration = session.startedAt && session.endedAt
                ? Math.round((new Date(session.endedAt).getTime() - new Date(session.startedAt).getTime()) / 60000)
                : 0;

            // Determine result based on score or game status
            let result: 'won' | 'lost' | 'completed' = 'completed';
            if (session.status === 'COMPLETED' && player) {
                // You can implement more sophisticated logic here
                // For now, we'll consider high scores as wins
                if (player.score > 800) {
                    result = 'won';
                } else if (player.score < 500) {
                    result = 'lost';
                }
            }

            return {
                id: session.id,
                gameCode: session.gameCode,
                date: session.createdAt.toISOString().split('T')[0],
                duration: duration > 0 ? `${duration} min` : 'N/A',
                players: session._count.players,
                score: player?.score || 0,
                result,
                categories: session.categories.map(gc => gc.category.name),
                cardsPlayed: session.currentCardIndex
            };
        });

        return NextResponse.json(gameHistory);
    } catch (error) {
        console.error('Error fetching game history:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game history' },
            { status: 500 }
        );
    }
}
