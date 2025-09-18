import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(_request: NextRequest, context: { params: { id: string } }) {
    try {
        const idNum = Number(context.params.id);
        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
        }

        const card = await prisma.card.findUnique({
            where: { id: idNum },
            include: {
                category: true,
                cardResponses: true,
            },
        });

        if (!card) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, card });
    } catch (error: unknown) {
        console.error('Error fetching card:', error);
        return NextResponse.json(
            { error: 'Failed to fetch card' },
            { status: 500 }
        );
    }
}
