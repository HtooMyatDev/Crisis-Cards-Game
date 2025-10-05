import { loginFormSchema } from "@/lib/rules";
import { NextResponse, NextRequest } from "next/server";
// import { prisma } from "@/lib/prisma";
import { z } from "zod";

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json()
        const validatedFields = loginFormSchema.safeParse({
            email,
            password
        })

        if (!validatedFields.success) {
            return NextResponse.json({
                errors: z.treeifyError(validatedFields.error)
            }, { status: 400 })
        }
        return NextResponse.json({
            message: 'success'
        })

    }
    catch (error: unknown) {
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 })
    }
}
