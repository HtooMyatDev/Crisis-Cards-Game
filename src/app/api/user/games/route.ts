
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/app/actions/auth";

export async function GET() {
    try {
        const user = await getCurrentUser();

        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const games = await prisma.gameSession.findMany({
            where: { hostId: user.id },
            orderBy: { createdAt: 'desc' },
            take: 5
        });

        return NextResponse.json(games);

    } catch (error) {
        console.error('Error fetching user games:', error);
        return NextResponse.json(
            { error: 'Failed to fetch games' },
            { status: 500 }
        );
    }
}
