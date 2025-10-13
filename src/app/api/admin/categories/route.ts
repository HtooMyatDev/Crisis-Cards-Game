import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'; // Import the singleton Prisma client

export async function POST(request: NextRequest) {
    try {

        // 1. Parse the request body to get the category data.
        const body = await request.json();

        const { name, description, colorPresetId, status } = body;

        // 2. Validate the incoming data.
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 }
            );
        }

        // Validate colorPresetId if provided
        if (colorPresetId && colorPresetId !== '0') {
            const presetExists = await prisma.colorPreset.findUnique({
                where: { id: parseInt(colorPresetId) }
            });

            if (!presetExists) {
                return NextResponse.json(
                    { error: 'Invalid color preset selected' },
                    { status: 400 }
                );
            }

            if (!presetExists.isActive) {
                return NextResponse.json(
                    { error: 'Selected color preset is not active' },
                    { status: 400 }
                );
            }
        }

        // Map frontend status to database enum
        const dbStatus = status === 'Active' ? 'ACTIVE' : 'INACTIVE';

        const createdBy = 2; // Example user ID

        // 3. Create the category
        const newCategory = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                colorPresetId: (colorPresetId && colorPresetId !== '0') ? parseInt(colorPresetId) : null,
                createdBy,
                status: dbStatus // Use the mapped status
            },
            include: {
                colorPreset: {
                    select: {
                        id: true,
                        name: true,
                        backgroundColor: true,
                        textColor: true,
                        textBoxColor: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });

        // If a color preset was used, increment its usage count
        if (colorPresetId && colorPresetId !== '0') {
            await prisma.colorPreset.update({
                where: { id: parseInt(colorPresetId) },
                data: {
                    usageCount: {
                        increment: 1
                    }
                }
            });
        }

        // 4. Return success response
        return NextResponse.json({
            success: true,
            id: newCategory.id,
            category: newCategory
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating category:', error);

        if (error.code === 'P2002' && error.meta?.target.includes('name')) {
            return NextResponse.json(
                { error: 'A category with this name already exists.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get('archived') === 'true';
        const activeOnly = searchParams.get('active') === 'true';
        const withPresets = searchParams.get('presets') !== 'false'; // Default to true
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const categories = await prisma.category.findMany({
            where: {
                ...(includeArchived ? {} : { isArchived: { not: true } }),
                ...(activeOnly && { status: 'ACTIVE' })
            },
            include: {
                ...(withPresets && {
                    colorPreset: {
                        select: {
                            id: true,
                            name: true,
                            backgroundColor: true,
                            textColor: true,
                            textBoxColor: true
                        }
                    }
                }),
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        cards: true
                    }
                }
            },
            orderBy: [
                { createdAt: 'desc' }
            ],
            ...(limit && { take: limit }),
            ...(offset && { skip: offset })
        });

        // Get total count for pagination if needed
        const totalCount = (limit || offset) ? await prisma.category.count({
            where: {
                ...(includeArchived ? {} : { isArchived: { not: true } }),
                ...(activeOnly && { status: 'ACTIVE' })
            }
        }) : categories.length;

        return NextResponse.json({
            success: true,
            categories,
            totalCount,
            ...(limit && { limit }),
            ...(offset && { offset })
        });
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        const { id, name, description, colorPresetId, status, isArchived } = body;

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        // Check if category exists
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Validate colorPresetId if provided
        if (colorPresetId && colorPresetId !== '0') {
            const presetExists = await prisma.colorPreset.findUnique({
                where: { id: parseInt(colorPresetId) }
            });

            if (!presetExists) {
                return NextResponse.json(
                    { error: 'Invalid color preset selected' },
                    { status: 400 }
                );
            }

            if (!presetExists.isActive) {
                return NextResponse.json(
                    { error: 'Selected color preset is not active' },
                    { status: 400 }
                );
            }
        }

        const updates: any = {};
        if (name !== undefined) updates.name = name.trim();
        if (description !== undefined) updates.description = description?.trim() || null;
        if (colorPresetId !== undefined) {
            updates.colorPresetId = (colorPresetId && colorPresetId !== '0') ? parseInt(colorPresetId) : null;
        }
        if (status !== undefined) updates.status = status;
        if (isArchived !== undefined) updates.isArchived = isArchived;

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updates,
            include: {
                colorPreset: {
                    select: {
                        id: true,
                        name: true,
                        backgroundColor: true,
                        textColor: true,
                        textBoxColor: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                },
                _count: {
                    select: {
                        cards: true
                    }
                }
            }
        });

        return NextResponse.json({
            success: true,
            category: updatedCategory
        });

    } catch (error: any) {
        console.error('Error updating category:', error);

        if (error.code === 'P2002' && error.meta?.target.includes('name')) {
            return NextResponse.json(
                { error: 'A category with this name already exists.' },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const forceDelete = searchParams.get('force') === 'true';

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        // Check if category exists and get card count
        const existingCategory = await prisma.category.findUnique({
            where: { id: parseInt(id) },
            include: {
                _count: {
                    select: {
                        cards: true
                    }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // If category has cards and force delete is not enabled, prevent deletion
        if (existingCategory._count.cards > 0 && !forceDelete) {
            return NextResponse.json(
                {
                    error: `Cannot delete category. It contains ${existingCategory._count.cards} cards. Use force=true to delete anyway.`,
                    cardCount: existingCategory._count.cards
                },
                { status: 409 }
            );
        }

        // If force delete, first remove category from all cards
        if (existingCategory._count.cards > 0 && forceDelete) {
            await prisma.card.updateMany({
                where: { categoryId: parseInt(id) },
                data: { categoryId: null }
            });
        }

        await prisma.category.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully',
            cardsAffected: forceDelete ? existingCategory._count.cards : 0
        });

    } catch (error) {
        console.error('Error deleting category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}
