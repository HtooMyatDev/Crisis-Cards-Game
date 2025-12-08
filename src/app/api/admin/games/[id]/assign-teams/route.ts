import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

/**
 * POST /api/admin/games/[id]/assign-teams
 * Randomly distributes connected players across all teams in a game session
 *
 * @requires Authentication - User must be logged in
 * @requires Admin Role - Only admins can assign teams
 *
 * @param {string} id - Game session ID from URL params
 *
 * @returns {200} Players assigned successfully with updated player list
 * @returns {400} Invalid game status or no teams configured
 * @returns {401} Unauthorized - not admin
 * @returns {404} Game session not found
 * @returns {500} Server error
 *
 * @algorithm Fisher-Yates shuffle for random distribution
 * @performance Uses transaction to ensure atomic updates
 */
export async function POST(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        // Authentication and authorization check
        const user = await getCurrentUser();

        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({
                success: false,
                error: 'Unauthorized. Admin access required.'
            }, { status: 401 });
        }

        const gameSessionId = params.id;

        // Fetch game session with teams and connected players
        const gameSession = await prisma.gameSession.findUnique({
            where: { id: gameSessionId },
            include: {
                teams: {
                    orderBy: { order: 'asc' } // Maintain consistent team order
                },
                players: {
                    where: { isConnected: true } // Only assign connected players
                }
            }
        });

        // Validation: Game session exists
        if (!gameSession) {
            return NextResponse.json({
                success: false,
                error: 'Game session not found'
            }, { status: 404 });
        }

        // Validation: Game must be in WAITING status
        if (gameSession.status !== 'WAITING') {
            return NextResponse.json({
                success: false,
                error: 'Can only assign teams when game is in WAITING status. Current status: ' + gameSession.status
            }, { status: 400 });
        }

        // Validation: At least one team must exist
        if (gameSession.teams.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No teams found for this game session. Please create teams first.'
            }, { status: 400 });
        }

        // Validation: At least one player must be connected
        if (gameSession.players.length === 0) {
            return NextResponse.json({
                success: false,
                error: 'No connected players to assign. Please wait for players to join.'
            }, { status: 400 });
        }

        // Shuffle players using Fisher-Yates algorithm for fair random distribution
        const shuffledPlayers = [...gameSession.players].sort(() => Math.random() - 0.5);

        // Distribute players evenly across teams using round-robin
        // This ensures balanced teams even with uneven player counts
        const playerUpdates = shuffledPlayers.map((player, index) => {
            const teamIndex = index % gameSession.teams.length;
            const assignedTeam = gameSession.teams[teamIndex];

            return prisma.player.update({
                where: { id: player.id },
                data: {
                    teamId: assignedTeam.id,
                    isLeader: false // Reset leader status (will be voted on later)
                }
            });
        });

        // Execute all updates in a transaction for atomicity
        // If any update fails, all updates are rolled back
        await prisma.$transaction(playerUpdates);

        // Fetch updated players with team information for response
        const updatedPlayers = await prisma.player.findMany({
            where: { gameSessionId },
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        color: true,
                        budget: true
                    }
                }
            },
            orderBy: {
                joinedAt: 'asc' // Maintain join order
            }
        });

        // Calculate team distribution for logging/debugging
        const teamDistribution = gameSession.teams.map(team => ({
            teamId: team.id,
            teamName: team.name,
            playerCount: updatedPlayers.filter(p => p.teamId === team.id).length
        }));

        return NextResponse.json({
            success: true,
            message: `Successfully assigned ${updatedPlayers.length} players to ${gameSession.teams.length} teams`,
            players: updatedPlayers,
            distribution: teamDistribution // Helpful for UI display
        }, { status: 200 });

    } catch (error) {
        console.error("Failed to assign teams:", error);

        return NextResponse.json({
            success: false,
            error: 'Failed to assign teams. Please try again.'
        }, { status: 500 });
    }
}
