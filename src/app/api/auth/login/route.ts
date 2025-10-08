import { loginFormSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        const validatedFields = loginFormSchema.safeParse({
            email,
            password
        })


        if (!validatedFields.success) {
            return NextResponse.json({
                message: 'Validation failed',
                errors: z.treeifyError(validatedFields.error)
            }, { status: 400 })
        }

        // Find user by email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        // User doesn't exist
        if (!existingUser) {
            return NextResponse.json({
                message: "Invalid email or password"
            }, { status: 401 });
        }

        // Check if user is active (optional, if you have this field)
        if (existingUser.isActive === false) {
            return NextResponse.json({
                message: "Account is inactive. Please contact administrator."
            }, { status: 403 });
        }

        // Verify password exists
        if (!password || !existingUser.password) {
            return NextResponse.json({
                message: 'Invalid email or password'
            }, { status: 401 });
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, existingUser.password);

        if (!isPasswordValid) {
            return NextResponse.json({
                message: "Invalid email or password"
            }, { status: 401 });
        }

        // Determine route based on role
        const route = existingUser.role === "ADMIN"
            ? "/admin/dashboard"
            : "/user/home";


        // Create response with token in cookie
        const response = NextResponse.json({
            message: "Login successful",
            route,
            user: {
                id: existingUser.id,
                email: existingUser.email,
                name: existingUser.name,
                role: existingUser.role
            }
        }, { status: 200 });
        return response;

    }
    catch {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 })
    }
}
