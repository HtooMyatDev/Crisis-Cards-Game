// File: /api/admin/color-presets/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch all color presets
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const activeOnly = searchParams.get('active') === 'true';
        const defaultsOnly = searchParams.get('defaults') === 'true';

        const presets = await prisma.colorPreset.findMany({
            where: {
                ...(activeOnly && { isActive: true }),
                ...(defaultsOnly && { isDefault: true })
            },
            orderBy: [
                { isDefault: 'desc' },
                { usageCount: 'desc' },
                { createdAt: 'desc' }
            ]
        });

        return NextResponse.json({
            success: true,
            presets
        });
    } catch (error) {
        console.error('Error fetching color presets:', error);
        return NextResponse.json(
            { error: 'Failed to fetch color presets' },
            { status: 500 }
        );
    }
}

// POST - Create new color preset
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, description, backgroundColor, textColor, textBoxColor, isDefault } = body;

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

        // Check if name already exists
        const existingPreset = await prisma.colorPreset.findFirst({
            where: { name: name.trim() }
        });

        if (existingPreset) {
            return NextResponse.json(
                { error: 'A preset with this name already exists' },
                { status: 409 }
            );
        }

        // If setting as default, unset other defaults first
        if (isDefault) {
            await prisma.colorPreset.updateMany({
                where: { isDefault: true },
                data: { isDefault: false }
            });
        }

        const preset = await prisma.colorPreset.create({
            data: {
                name: name.trim(),
                description: description?.trim() || null,
                backgroundColor,
                textColor,
                textBoxColor,
                isDefault: isDefault || false,
                isActive: true,
                usageCount: 0
            }
        });

        return NextResponse.json({
            success: true,
            message: 'Color preset created successfully',
            preset
        });
    } catch (error) {
        console.error('Error creating color preset:', error);
        return NextResponse.json(
            { error: 'Failed to create color preset' },
            { status: 500 }
        );
    }
}
