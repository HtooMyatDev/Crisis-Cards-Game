import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ gameCode: string }> }
) {
    try {
        await params; // consume params to satisfy lint if needed, or just remove destructuring
        const { searchParams } = new URL(request.url);
        const playerId = searchParams.get('playerId');
        const cardId = searchParams.get('cardId');

        if (!playerId || !cardId) {
            return NextResponse.json(
                { error: 'Missing playerId or cardId' },
                { status: 400 }
            );
        }

        // Check if response exists
        const existingResponse = await prisma.playerResponse.findUnique({
            where: {
                playerId_cardId: {
                    playerId: parseInt(playerId),
                    cardId: parseInt(cardId)
                }
            }
        });

        if (existingResponse) {
            return NextResponse.json({
                hasResponded: true,
                responseId: existingResponse.responseId
            });
        }

        return NextResponse.json({
            hasResponded: false
        });

    } catch (error) {
        console.error('Error checking response:', error);
        return NextResponse.json(
            { error: 'Failed to check response' },
            { status: 500 }
        );
    }
}
