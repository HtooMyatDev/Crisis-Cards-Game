import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from "@/app/actions/auth";
import { Prisma } from "@prisma/client";

/**
 * POST /api/admin/categories
 * Creates a new crisis category
 *
 * @requires Authentication - Admin only
 * @body {string} name - Category name
 * @body {string} description - Category description
 * @body {string} colorPresetId - ID of color preset (optional)
 * @body {string} status - 'Active' or 'Inactive'
 *
 * @returns {201} Created category
 * @returns {400} Validation error
 * @returns {401} Unauthorized
 * @returns {409} Conflict (duplicate name)
 * @returns {500} Server error
 */
export async function POST(request: NextRequest) {
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
        const { name, description, colorPresetId, status } = body;

        // Validate required fields
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

        // Create the category
        const newCategory = await prisma.category.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                ...((colorPresetId && colorPresetId !== '0') ? { colorPreset: { connect: { id: parseInt(colorPresetId) } } } : {}),
                creator: { connect: { id: user.id } },
                status: status === 'Active' ? 'ACTIVE' : 'INACTIVE'
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

        return NextResponse.json({
            success: true,
            id: newCategory.id,
            category: newCategory
        }, { status: 201 });

    } catch (error: unknown) {
        console.error('Error creating category:', error);

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; meta?: { target?: string[] } };
            if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
                return NextResponse.json(
                    { error: 'A category with this name already exists.' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}

/**
 * GET /api/admin/categories
 * Retrieves categories with filtering and pagination
 *
 * @requires Authentication - User must be logged in
 * @query {boolean} archived - Include archived categories
 * @query {boolean} active - Filter by active status
 * @query {boolean} presets - Include color presets
 * @query {number} limit - Items per page
 * @query {number} offset - Skip items
 *
 * @returns {200} List of categories
 * @returns {401} Unauthorized
 * @returns {500} Server error
 */
export async function GET(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please log in.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const includeArchived = searchParams.get('archived') === 'true';
        const activeOnly = searchParams.get('active') === 'true';
        const withPresets = searchParams.get('presets') !== 'false';
        const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;
        const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined;

        const whereClause: Prisma.CategoryWhereInput = {
            ...(includeArchived ? {} : { isArchived: { not: true } }),
            ...(activeOnly && { status: 'ACTIVE' })
        };

        const [categories, totalCount] = await Promise.all([
            prisma.category.findMany({
                where: whereClause,
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
                    },
                    ...(searchParams.get('includeCards') === 'true' && {
                        cards: {
                            where: { isArchived: false },
                            select: { id: true, title: true }
                        }
                    })
                },
                orderBy: [{ createdAt: 'desc' }],
                ...(limit && { take: limit }),
                ...(offset && { skip: offset })
            }),
            prisma.category.count({ where: whereClause })
        ]);

        return NextResponse.json({
            success: true,
            categories,
            totalCount,
            ...(limit && { limit }),
            ...(offset && { offset })
        });

    } catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/admin/categories
 * Updates an existing category
 *
 * @requires Authentication - Admin only
 * @body {number} id - Category ID
 * @body {string} name - New name
 * @body {string} description - New description
 * @body {string} status - New status
 *
 * @returns {200} Updated category
 * @returns {400} Validation error
 * @returns {401} Unauthorized
 * @returns {404} Category not found
 * @returns {500} Server error
 */
export async function PUT(request: NextRequest) {
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

        // Prepare updates
        const updates: Prisma.CategoryUpdateInput = {};
        if (name !== undefined) updates.name = name.trim();
        if (description !== undefined) updates.description = description?.trim() || null;
        if (colorPresetId !== undefined) {
            if (colorPresetId && colorPresetId !== '0') {
                updates.colorPreset = { connect: { id: parseInt(colorPresetId) } };
            } else {
                updates.colorPreset = { disconnect: true };
            }
        }
        if (status !== undefined) updates.status = status;
        if (isArchived !== undefined) updates.isArchived = isArchived;

        const updatedCategory = await prisma.category.update({
            where: { id: parseInt(id) },
            data: updates,
            include: {
                colorPreset: true,
                creator: {
                    select: { id: true, name: true, email: true }
                },
                _count: {
                    select: { cards: true }
                }
            }
        });

        return NextResponse.json({
            success: true,
            category: updatedCategory
        });

    } catch (error: unknown) {
        console.error('Error updating category:', error);

        if (error && typeof error === 'object' && 'code' in error) {
            const prismaError = error as { code: string; meta?: { target?: string[] } };
            if (prismaError.code === 'P2002' && prismaError.meta?.target?.includes('name')) {
                return NextResponse.json(
                    { error: 'A category with this name already exists.' },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/admin/categories
 * Deletes a category
 *
 * @requires Authentication - Admin only
 * @query {number} id - Category ID
 * @query {boolean} force - Force delete even if it has cards
 *
 * @returns {200} Success message
 * @returns {401} Unauthorized
 * @returns {404} Category not found
 * @returns {409} Conflict (has cards)
 * @returns {500} Server error
 */
export async function DELETE(request: NextRequest) {
    try {
        // Authentication check
        const user = await getCurrentUser();
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json(
                { error: 'Unauthorized. Admin access required.' },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        const forceDelete = searchParams.get('force') === 'true';

        if (!id) {
            return NextResponse.json(
                { error: 'Category ID is required' },
                { status: 400 }
            );
        }

        const categoryId = parseInt(id);

        // Check if category exists and get card count
        const existingCategory = await prisma.category.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { cards: true }
                }
            }
        });

        if (!existingCategory) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        // Prevent deletion if it has cards, unless forced
        if (existingCategory._count.cards > 0 && !forceDelete) {
            return NextResponse.json(
                {
                    error: `Cannot delete category. It contains ${existingCategory._count.cards} cards. Use force=true to delete anyway.`,
                    cardCount: existingCategory._count.cards
                },
                { status: 409 }
            );
        }

        // Use transaction for deletion
        await prisma.$transaction(async (tx) => {
            if (existingCategory._count.cards > 0 && forceDelete) {
                await tx.card.deleteMany({
                    where: { categoryId }
                });
            }

            await tx.category.delete({
                where: { id: categoryId }
            });
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
