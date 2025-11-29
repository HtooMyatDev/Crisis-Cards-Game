// File: /api/admin/color-presets/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch single color preset
export async function GET(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = parseInt(params.id);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
        }

        const preset = await prisma.colorPreset.findUnique({
            where: { id }
        });

        if (!preset) {
            return NextResponse.json({ error: 'Color preset not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            preset
        });
    } catch (error) {
        console.error('Error fetching color preset:', error);
        return NextResponse.json(
            { error: 'Failed to fetch color preset' },
            { status: 500 }
        );
    }
}

// PUT - Update color preset
export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = parseInt(params.id);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
        }

        const body = await request.json();
        const { name, description, backgroundColor, textColor, textBoxColor, isDefault, isActive } = body;

        // Check if preset exists
        const existingPreset = await prisma.colorPreset.findUnique({
            where: { id }
        });

        if (!existingPreset) {
            return NextResponse.json({ error: 'Color preset not found' }, { status: 404 });
        }

        // Validation
        if (!name || !backgroundColor || !textColor || !textBoxColor) {
            return NextResponse.json(
                { error: 'Name and all colors are required' },
                { status: 400 }
            );
        }

        // Validate hex color format
        const hexPattern = /^#[0-9A-Fa-f]{6}$/;
        if (!hexPattern.test(backgroundColor) || !hexPattern.test(textColor) || !hexPattern.test(textBoxColor)) {
            return NextResponse.json(
                { error: 'All colors must be valid hex format (#RRGGBB)' },
                { status: 400 }
            );
        }

        // Check if name already exists (excluding current preset)
        const nameConflict = await prisma.colorPreset.findFirst({
            where: {
                name: name.trim(),
                id: { not: id }
            }
        });

        if (nameConflict) {
            return NextResponse.json(
                { error: 'A preset with this name already exists' },
                { status: 409 }
            );
        }

        // If setting as default, unset other defaults first
        if (isDefault) {
            await prisma.colorPreset.updateMany({
                where: {
                    isDefault: true,
                    id: { not: id }
                },
                data: { isDefault: false }
            });
        }

        const updatedPreset = await prisma.colorPreset.update({
            where: { id },
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                backgroundColor,
                textColor,
                textBoxColor,
                isDefault: isDefault || false,
                isActive: isActive !== undefined ? isActive : true,
                updatedAt: new Date()
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Color preset updated successfully',
            preset: updatedPreset
        });
    } catch (error) {
        console.error('Error updating color preset:', error);
        return NextResponse.json(
            { error: 'Failed to update color preset' },
            { status: 500 }
        );
    }
}

// DELETE - Delete color preset
export async function DELETE(_request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = parseInt(params.id);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
        }

        // Check if preset exists
        const existingPreset = await prisma.colorPreset.findUnique({
            where: { id }
        });

        if (!existingPreset) {
            return NextResponse.json({ error: 'Color preset not found' }, { status: 404 });
        }

        // Check if preset is being used by any categories
        const categoriesUsingPreset = await prisma.category.findMany({
            where: {
                OR: [
                    { colorPresetId: id }
                ]
            }
        });

        if (categoriesUsingPreset.length > 0) {
            return NextResponse.json({
                error: `Cannot delete preset. It's currently being used by ${categoriesUsingPreset.length} categor${categoriesUsingPreset.length === 1 ? 'y' : 'ies'}.`,
                categoriesCount: categoriesUsingPreset.length
            }, { status: 409 });
        }

        await prisma.colorPreset.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Color preset deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting color preset:', error);

        // Handle Prisma specific errors
        if (error && typeof error === 'object' && 'code' in error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((error as any).code === 'P2025') {
                return NextResponse.json({ error: 'Color preset not found' }, { status: 404 });
            }
        }

        return NextResponse.json(
            { error: 'Failed to delete color preset' },
            { status: 500 }
        );
    }
}

// PATCH - Increment usage count
export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        const id = parseInt(params.id);
        if (!Number.isInteger(id)) {
            return NextResponse.json({ error: 'Invalid preset ID' }, { status: 400 });
        }

        const body = await request.json();
        const { action } = body;

        if (action === 'increment_usage') {
            const updatedPreset = await prisma.colorPreset.update({
                where: { id },
                data: {
                    usageCount: {
                        increment: 1
                    },
                    updatedAt: new Date()
                }
            });

            return NextResponse.json({
                success: true,
                message: 'Usage count updated',
                preset: updatedPreset
            });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating preset:', error);

        if (error && typeof error === 'object' && 'code' in error) {
            if (error.code === 'P2025') {
                return NextResponse.json({ error: 'Color preset not found' }, { status: 404 });
            }
        }

        return NextResponse.json(
            { error: 'Failed to update preset' },
            { status: 500 }
        );
    }
}
