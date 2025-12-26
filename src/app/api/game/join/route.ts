import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { GameStatus } from "@prisma/client";

import { getCurrentUser } from "@/app/actions/auth";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { gameCode, nickname } = body; // Removed team parameter

        // Get current user if logged in
        const user = await getCurrentUser();
        const userId = user?.id;

        if (!gameCode || !nickname) {
            return NextResponse.json(
                { error: 'Game code and nickname are required' },
                { status: 400 }
            );
        }

        // Find the game session
        const gameSession = await prisma.gameSession.findUnique({
            where: {
                gameCode: gameCode.toUpperCase()
            }
        });

        if (!gameSession) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        if (gameSession.status === GameStatus.COMPLETED || gameSession.status === GameStatus.PAUSED) {
            return NextResponse.json(
                { error: 'Game is not active' },
                { status: 400 }
            );
        }

        // Check if nickname is already taken in this session (case-insensitive)
        const existingPlayer = await prisma.player.findFirst({
            where: {
                gameSessionId: gameSession.id,
                nickname: {
                    equals: nickname,
                    mode: 'insensitive'
                }
            }
        });

        if (existingPlayer) {
            // If player exists and is disconnected, allow reconnect (optional logic)
            // For now, we'll just return an error
            return NextResponse.json(
                { error: 'Nickname already taken in this game' },
                { status: 409 }
            );
        }

        // Create new player (team will be assigned later by admin)
        const player = await prisma.player.create({
            data: {
                gameSessionId: gameSession.id,
                nickname: nickname,
                teamId: null, // Teams are assigned by admin via /assign-teams endpoint
                isConnected: true,
                userId: userId || null // Link to user if logged in
            }
        });

        // Trigger real-time update
        try {
            const { pusherServer } = await import('@/lib/pusher');
            if (gameSession.gameCode) {
                await pusherServer.trigger(`game-${gameSession.gameCode}`, 'game-update', {
                    type: 'PLAYER_JOINED',
                    data: {
                        playerId: player.id,
                        nickname: player.nickname,
                        timestamp: Date.now()
                    }
                });
            }
        } catch (pusherError) {
            console.error('Failed to trigger Pusher event:', pusherError);
        }

        // Return success with game details
        return NextResponse.json({
            success: true,
            gameCode: gameSession.gameCode,
            playerId: player.id,
            nickname: player.nickname
        });

    } catch (error) {
        console.error('Error joining game:', error);
        return NextResponse.json(
            { error: 'Failed to join game' },
            { status: 500 }
        );
    }
}
