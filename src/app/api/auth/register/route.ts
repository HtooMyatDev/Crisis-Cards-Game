import { NextRequest, NextResponse } from 'next/server';
import { registerFormSchema } from "@/lib/rules"
import { z } from "zod"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
export async function POST(request: NextRequest) {
    try {
        const { username, email, password, confirmPassword } = await request.json();
        const validatedFields = registerFormSchema.safeParse({
            username,
            email,
            password,
            confirmPassword
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

        // User with the same email exists
        if (existingUser?.email) {
            return NextResponse.json({
                message: "Email already registered."
            }, { status: 409 });
            // status: 409 signifies that the request could not be completed due to a conflict with the current state of the target resource.
        }


        const route = existingUser?.role == "USER" ? "/user/home" : "/admin/dashboard"
        const response = NextResponse.json({
            message: "Register successful",
            route,
            user: {
                id: existingUser?.id,
                email: existingUser?.email,
                name: existingUser?.name,
                role: existingUser?.role
            }
        }, { status: 200 })
        return response
    }
    catch (error: unknown) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
