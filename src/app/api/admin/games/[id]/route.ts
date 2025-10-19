import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const game = await prisma.gameSession.findUnique({
            where: {
                id: params.id
            },
            include: {
                host: true,
                categories: {
                    include: {
                        category: true
                    }
                },
                players: true
            }
        });

        if (!game) {
            return NextResponse.json(
                { error: 'Game not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, game });
    } catch (error) {
        console.error('Error fetching game:', error);
        return NextResponse.json(
            { error: 'Failed to fetch game details' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();
        const { id } = body;
        const updatedCard = await prisma.card.update({
            where: { id },
            data: { status: "Completed" }
        })
        
    }
    catch (error) {
        console.log('Error updating the game status', error);
    }
    return NextResponse.json({ message: 'success' })
}

export async function DELETE(request: NextRequest) {
    console.log(request);
}
