import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const idNum = Number(params.id);

        if (!Number.isFinite(idNum)) {
            return NextResponse.json(
                { error: 'Invalid id parameter' },
                { status: 400 }
            );
        }

        const category = await prisma.category.findUnique({
            where: { id: idNum },
            include: {
                colorPreset: true
            },
        });

        if (!category) {
            return NextResponse.json(
                { error: 'Category not found' },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Error fetching category:', error);
        return NextResponse.json(
            { error: 'Failed to fetch category' },
            { status: 500 }
        );
    }
}

export async function HEAD(_request: NextRequest) {
    return new NextResponse(null, { status: 200 });
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        // Add your POST logic here
        return NextResponse.json({ success: true, data: body });
    } catch (error) {
        console.error('Error in POST:', error);
        return NextResponse.json(
            { error: 'Failed to process request' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const body = await request.json();
        const id = parseInt(params.id, 10);

        if (!Number.isFinite(id)) {
            return NextResponse.json(
                { error: 'Invalid id parameter' },
                { status: 400 }
            );
        }

        const category = await prisma.category.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Failed to update category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    _request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const id = parseInt(params.id, 10);

        if (!Number.isFinite(id)) {
            return NextResponse.json(
                { error: 'Invalid id parameter' },
                { status: 400 }
            );
        }

        await prisma.category.delete({
            where: { id }
        });

        return NextResponse.json({
            success: true,
            message: 'Category deleted successfully'
        });
    } catch (error) {
        console.error('Failed to delete category:', error);
        return NextResponse.json(
            { error: 'Failed to delete category' },
            { status: 500 }
        );
    }
}

export async function PATCH(
    request: NextRequest,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const body = await request.json();
        const id = parseInt(params.id, 10);

        if (!Number.isFinite(id)) {
            return NextResponse.json(
                { error: 'Invalid id parameter' },
                { status: 400 }
            );
        }

        const category = await prisma.category.update({
            where: { id },
            data: body
        });

        return NextResponse.json({ success: true, category });
    } catch (error) {
        console.error('Failed to update category:', error);
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 }
        );
    }
}

export async function OPTIONS(_request: NextRequest) {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Allow': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        }
    });
}
