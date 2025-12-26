import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/app/actions/auth';

export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params
        const idNum = Number(params.id);
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

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const body = await request.json();
        const params = await context.params;
        const idNum = Number(params.id);

        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
        }

        const {
            title,
            description,
            categoryId,
            timeLimit,
            status,
            political,
            economic,
            infrastructure,
            society,
            environment,
            responseOptions
        } = body;

        // Transaction to handle card update and response options replacement
        const updatedCard = await prisma.$transaction(async (tx) => {
            // 1. Update basic card details
            const card = await tx.card.update({
                where: { id: idNum },
                data: {
                    title,
                    description,
                    categoryId: Number(categoryId),
                    timeLimit: Number(timeLimit),
                    status,
                }
            });

            // 2. Delete existing response options
            await tx.cardResponse.deleteMany({
                where: { cardId: idNum }
            });

            // 3. Create new response options
            if (responseOptions && Array.isArray(responseOptions)) {
                await tx.cardResponse.createMany({
                    data: responseOptions.map((opt: { text: string; politicalEffect: number; economicEffect: number; infrastructureEffect: number; societyEffect: number; environmentEffect: number; score: number; impactDescription?: string }, index: number) => ({
                        cardId: idNum,
                        text: opt.text,
                        politicalEffect: Number(opt.politicalEffect),
                        economicEffect: Number(opt.economicEffect),
                        infrastructureEffect: Number(opt.infrastructureEffect),
                        societyEffect: Number(opt.societyEffect),
                        environmentEffect: Number(opt.environmentEffect),
                        score: Number(opt.score),
                        order: index,
                        impactDescription: opt.impactDescription || null
                    }))
                });
            }

            // Return updated card with relations
            return tx.card.findUnique({
                where: { id: idNum },
                include: {
                    category: true,
                    cardResponses: {
                        orderBy: { order: 'asc' }
                    }
                }
            });
        });

        return NextResponse.json({
            success: true,
            message: 'Card updated successfully',
            card: updatedCard
        });

    } catch (error: unknown) {
        console.error('Error updating card:', error);
        return NextResponse.json(
            { error: 'Failed to update card' },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const params = await context.params;
        const idNum = Number(params.id);

        if (!Number.isFinite(idNum)) {
            return NextResponse.json({ error: 'Invalid id parameter' }, { status: 400 });
        }

        const { isArchived } = body;

        if (typeof isArchived !== 'boolean') {
            return NextResponse.json({ error: 'isArchived must be a boolean value' }, { status: 400 });
        }

        // Update the card's archive status (will throw if not found)
        const updatedCard = await prisma.card.update({
            where: { id: idNum },
            data: {
                isArchived,
                archivedAt: isArchived ? new Date() : null,
                archivedById: isArchived ? user.id : null
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
        console.error('Error archiving card:', error);

        if (error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2025') {
            return NextResponse.json({ error: 'Card not found' }, { status: 404 });
        }

        return NextResponse.json({ error: 'Failed to update card status' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const idNum = Number(params.id);
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
            if ((error as { code: string }).code === 'P2025') {
                return NextResponse.json({ error: 'Card not found' }, { status: 404 });
            }
            if ((error as { code: string }).code === 'P2003') {
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
