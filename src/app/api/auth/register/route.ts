import { NextRequest, NextResponse } from 'next/server';
import { registerFormSchema } from "@/lib/rules"
import { z } from "zod"

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
                errors: z.treeifyError(validatedFields.error)
            })
        }

        return NextResponse.json({
            message: 'success'
        })
    }
    catch (error: unknown) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        )
    }
}
