import { prisma } from './../../../../lib/prisma';
import { NextRequest, NextResponse } from "next/server";
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const newCard = await prisma.card.create({
            data: {
                // Add your card fields here based on your Prisma schema
                // title: body.title,
                // description: body.description,
                // etc.
            }
        })
        return NextResponse.json({
            success: true,
            id: newCard.id,
            card: newCard
        })
    } catch (error) {
        console.error('Error creating card:', error);
        return NextResponse.json(
            { error: 'Failed to create card' },
            { status: 500 }
        );
    }

}
export async function GET(request: NextRequest) {
    try {
        const cards = await prisma.card.findMany();

        return NextResponse.json({
            success: true,
            cards
        })
    }
    catch (error) {
        console.error('Error fetching cards:', error);
        return NextResponse.json(
            { error: 'Failed to fetch cards' },
            { status: 500 }
        )
    }

}
