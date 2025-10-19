import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
export async function GET(request: NextRequest) {
    console.log(request)
}

export async function HEAD(request: NextRequest) {
    console.log(request)
}

export async function POST(request: NextRequest) {
    const res = await request.json()
    return Response.json({ res })
}

export async function PUT(request: NextRequest) {
    console.log(request)
}

export async function DELETE(request: NextRequest) {
    console.log(request)
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const id = parseInt(params.id, 10)
        const category = await prisma.category.update({
            where: { id },
            data: body
        })

        return NextResponse.json(category);
    }
    catch (error) {
        console.log('Failed to update the category', error)
        return NextResponse.json(
            { error: 'Failed to update category' },
            { status: 500 })
    }
}

// If `OPTIONS` is not defined, Next.js will automatically implement `OPTIONS` and set the appropriate Response `Allow` header depending on the other methods defined in the Route Handler.
export async function OPTIONS(request: NextRequest) {
    console.log(request)
}
