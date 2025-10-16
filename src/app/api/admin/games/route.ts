import { prisma } from "@/lib/prisma";
import { gameCreateSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
import { z } from "zod";
export async function GET() {
    try {
        const games = await prisma.gameSession.findMany({
            select: {
                id: true,
                gameCode: true,
                hostId: true,
                categoryId: true,
                status: true,
                currentCardIndex: true,
                startedAt: true,
                endedAt: true,
                createdAt: true,
                updatedAt: true
            }
        });

        return NextResponse.json({ success: true, games })
    }
    catch (error) {
        console.error("Failed to fetch games", error)
        return NextResponse.json({ error: 'Failed to fetch games' }, { status: 500 })
    }
}
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const {
            gameCode,
            hostId,
            categoryId,
        } = body;

        console.log(body);

        const validatedFields = gameCreateSchema.safeParse({
            gameCode
        })
        if (!validatedFields.success) {
            return NextResponse.json({
                message: 'Validation failed',
                errors: z.treeifyError(validatedFields.error)
            }, { status: 400 })
        }

        const newGame = await prisma.gameSession.create({
            data: {
                gameCode,
                hostId,
                categoryId,
            }
        })
        return NextResponse.json({
            success: true,
            message: 'Game Session created',
            data: newGame
        })


    }
    catch (error) {
        console.error("Failed to create game", error)
        return NextResponse.json({ error: 'Failed to create games' }, { status: 500 })
    }
}
