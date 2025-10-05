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

export async function PATCH(request: NextRequest, context: { params: { id: string } }) {
    try {
        const idNum = Number(context.params.id);
        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
        }

        const body = await request.json();
        const { isArchived } = body;

        // Validate that isArchived is provided and is a boolean
        if (typeof isArchived !== 'boolean') {
            return NextResponse.json({ error: 'isArchived must be a boolean value' }, { status: 400 });
        }

        // Check if card exists
        const existingCard = await prisma.card.findUnique({
            where: { id: idNum }
        });

        if (!existingCard) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        // Update the card's archive status
        const updatedCard = await prisma.card.update({
            where: { id: idNum },
            data: {
                isArchived: isArchived,
                archivedAt: isArchived ? new Date() : null,
                archivedById: isArchived ? 1 : null // You might want to get the actual user ID from auth
            },
            include: {
                category: true,
                cardResponses: true,
            }
        });

        return NextResponse.json({
            success: true,
            message: `Card ${isArchived ? 'archived' : 'restored'} successfully`,
            card: updatedCard
        });

    } catch (error: unknown) {
        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Card not found' }, { status: 404 });
            }
        }

        return NextResponse.json(
            { error: 'Failed to update card' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest, context: { params: { id: string } }) {
    try {
        const idNum = Number(context.params.id);
        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
        }

        // Check for permanent delete flag in query params
        const url = new URL(request.url);
        const permanent = url.searchParams.get('permanent') === 'true';

        const existingCard = await prisma.card.findUnique({
            where: { id: idNum },
            include: {
                cardResponses: true
            }
        });

        if (!existingCard) {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        if (permanent) {
            // PERMANENT DELETE - Actually remove from database

            // First delete related cardResponses (if not handled by cascade)
            await prisma.cardResponse.deleteMany({
                where: { cardId: idNum }
            });

            // Then delete the card
            const deletedCard = await prisma.card.delete({
                where: { id: idNum }
            });
            return NextResponse.json({
                success: true,
                message: 'Card permanently deleted',
                deletedCard
            });

        } else {
            // SOFT DELETE - Archive the card (existing behavior)
            const archivedCard = await prisma.card.update({
                where: { id: idNum },
                data: {
                    isArchived: true,
                    archivedAt: new Date(),
                    archivedById: 1 // You might want to get the actual user ID from auth
                }
            });
            return NextResponse.json({
                success: true,
                message: 'Card archived successfully',
                card: archivedCard
            });
        }

    } catch (error: unknown) {
        console.error('Error deleting card:', error);

        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Card not found' }, { status: 404 });
            }
            if (error.code === 'P2003') {
                return NextResponse.json({
                    error: 'Cannot delete card due to existing references'
                }, { status: 409 });
            }
        }

        return NextResponse.json(
            { error: 'Failed to delete card' },
            { status: 500 }
        );
    }
}
