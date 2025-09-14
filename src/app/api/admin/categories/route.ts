import { NextRequest, NextResponse } from "next/server";
import { prisma } from '@/lib/prisma'; // Import the singleton Prisma client

export async function POST(request: NextRequest) {
    try {

        // 1. Parse the request body to get the category data.
        const body = await request.json();
        const { name, description, color } = body;
        // 2. Validate the incoming data.
        if (!name) {
            return NextResponse.json(
                { error: 'Category name is required' },
                { status: 400 } // Bad Request
            );
        }

        // NOTE: The `createdBy` field is required by your Prisma schema.
        // In a real-world application, you would get the user ID from the
        // authentication session (e.g., using a library like NextAuth.js).
        // For this example, we'll use a placeholder.
        const createdBy = 1; // Example user ID

        // 3. Use Prisma's `create` method to save the new category.
        const newCategory = await prisma.category.create({
            data: {
                name,
                description,
                color: color || "#3B82F6", // Use provided color or the default
                createdBy,
                // The `status`, `createdAt`, and `updatedAt` fields are handled by defaults
            },
        });

        // 4. Return a successful response with the new category's data.
        return NextResponse.json({
            success: true,
            id: newCategory.id,
            category: newCategory
        }, { status: 201 }); // 201 Created status code

    } catch (error: any) {
        console.error('Error creating category:', error);

        // Handle specific Prisma errors for better user feedback.
        // P2002 is the code for a unique constraint violation.
        if (error.code === 'P2002' && error.meta?.target.includes('name')) {
            return NextResponse.json(
                { error: 'A category with this name already exists.' },
                { status: 409 } // Conflict
            );
        }

        // Generic error for all other cases.
        return NextResponse.json(
            { error: 'Failed to create category' },
            { status: 500 }
        );
    }
}
export async function GET(request: NextRequest) {
    try {
        const categories = await prisma.category.findMany();

        return NextResponse.json({
            success: true,
            categories
        })
    }
    catch (error) {
        console.error('Error fetching categories:', error);
        return NextResponse.json(
            { error: 'Failed to fetch categories' },
            { status: 500 }
        )
    }
}
