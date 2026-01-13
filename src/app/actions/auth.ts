"use server";

import { generateJWTToken, verifyJWT } from "@/utils/auth";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma"
import { loginFormSchema, registerFormSchema } from "@/lib/rules";
import bcrypt from "bcrypt";
import { z } from "zod"

export async function registerAction(
    prevState: Record<string, unknown>,
    formData: FormData
) {
    const name = formData.get("name") as string
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    try {
        const validatedFields = registerFormSchema.safeParse({
            name,
            email,
            password,
            confirmPassword
        })

        if (!validatedFields.success) {

            const errors = z.treeifyError(validatedFields.error);
            const fieldErrors: Record<string, string> = {}

            if (errors?.properties?.name?.errors?.[0]) {
                fieldErrors.name = errors.properties.name.errors[0];
            }

            if (errors?.properties?.email?.errors?.[0]) {
                fieldErrors.email = errors.properties.email.errors[0];
            }

            if (errors?.properties?.password?.errors?.[0]) {
                fieldErrors.password = errors.properties.password.errors[0];
            }

            if (errors?.properties?.confirmPassword?.errors?.[0]) {
                fieldErrors.confirmPassword = errors.properties.confirmPassword.errors[0];
            }

            return {
                success: false,
                message: 'Please check your input',
                errors: fieldErrors,
                redirectTo: null
            }
        }

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return {
                success: false,
                message: "An account with this email already exists",
                errors: {},
                redirectTo: null
            }
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10)

        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                role: "USER",
                isActive: true
            }
        })
        const token = generateJWTToken({
            userId: newUser.id,
            email: newUser.email,
            role: newUser.role,
            name: newUser.name
        });

        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });

        cookieStore.set('role', newUser.role, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        });

        return {
            success: true,
            message: 'Registration successful!',
            errors: {},
            redirectTo: '/user/home'
        };
    }
    catch (error) {
        console.error('Registration error:', error);

        // Detect database connection errors
        const isDbError = error instanceof Error &&
            (error.message.includes('Prisma') || error.message.includes('database') || error.message.includes('connection'));

        return {
            success: false,
            message: isDbError
                ? "Database connection error. Please try again later."
                : "An error occurred during registration. Please try again.",
            errors: {},
            redirectTo: null
        };
    }
}
export async function loginAction(
    prevState: Record<string, unknown>,
    formData: FormData
) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    try {
        const validatedFields = loginFormSchema.safeParse({
            email,
            password
        })

        if (!validatedFields.success) {
            const errors = z.treeifyError(validatedFields.error)
            const fieldErrors: Record<string, string> = {}

            if (errors?.properties?.email?.errors?.[0]) {
                fieldErrors.email = errors.properties.email.errors[0]
            }

            if (errors?.properties?.password?.errors?.[0]) {
                fieldErrors.password = errors.properties.password.errors[0]
            }
            return {
                success: false,
                message: 'Please check your input',
                errors: fieldErrors,
                redirectTo: null
            }
        }

        // Find user by email
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        // User doesn't exist
        if (!existingUser || !existingUser.password) {
            return {
                success: false,
                message: "Invalid email or password",
                errors: {},
                redirectTo: null
            }
        }

        // Compare passwords
        const isPasswordValid = await bcrypt.compare(password, existingUser.password)

        if (!isPasswordValid) {
            return {
                success: false,
                message: "Invalid email or password",
                errors: {},
                redirectTo: null
            }
        }

        // generate JWT Token
        const token = generateJWTToken({
            userId: existingUser.id,
            email: existingUser.email,
            role: existingUser.role,
            name: existingUser.name
        })

        const cookieStore = await cookies();

        cookieStore.set('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        })

        cookieStore.set('role', existingUser.role, {
            httpOnly: false,
            secure: process.env.NODE_ENV === "production",
            sameSite: 'lax',
            maxAge: 60 * 60 * 24,
            path: '/'
        })

        const route = existingUser.role === "ADMIN" ? "/admin/dashboard" : "/user/home";

        return {
            success: true,
            message: "Login successful!",
            errors: {},
            redirectTo: route
        }
    }
    catch (error) {
        console.error('Login error', error)

        // Detect database connection errors
        const isDbError = error instanceof Error &&
            (error.message.includes('Prisma') || error.message.includes('database') || error.message.includes('connection'));

        return {
            success: false,
            message: isDbError
                ? "Database connection error. Please try again later."
                : 'An error occurred during login. Please try again.',
            errors: {},
            redirectTo: null
        }
    }
}

export async function logoutAction(prevState: unknown, _formData: FormData) {
    try {
        void prevState;
        void _formData;
        const cookieStore = await cookies();
        cookieStore.delete('token');
        cookieStore.delete('role');
        return { success: true, message: 'Logged out successfully' }
    }
    catch {
        return { success: false, message: 'Failed to logout' }
    }
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return null;
        }

        const decoded = verifyJWT(token);
        if (!decoded) {
            return null;
        }

        // Fetch user from database to get latest info
        // ensure userId is handled correctly whether string or number
        const userIdInt = typeof decoded.userId === 'string' ? parseInt(decoded.userId) : decoded.userId;

        const user = await prisma.user.findUnique({
            where: { id: userIdInt },

            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                bio: true,
                location: true
            }
        });

    return user;
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
}
