import * as z from "zod";

export const loginFormSchema = z.object({
    email: z.email({ message: "Invalid email address" })
        .trim()
        .toLowerCase(),
    password: z.string()
        .min(5, { message: "Password must be at least 5 characters" })
        .max(100, { message: "Password is too long" })
});

export const registerFormSchema = z.object({
    name: z.string().min(5, { message: "Username must be at least 5 characters" }).max(20, { message: "Username is  too long" }),
    email: z.email({ message: "Invalid email address" }).trim().toLowerCase(),
    password: z.string().min(5, { message: "Password must be at least 5 characters" }).max(100, { message: "Password is too long" }),
    confirmPassword: z.string()
}).superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
        ctx.addIssue({
            code: "custom",
            message: "The passwords did not match",
            path: ['confirmPassword']
        });
    }
});

export const gameCreateSchema = z.object({
    gameCode: z.string().min(6, { message: "Game Code must be at least 6 characters" }),
})

// Comprehensive game session creation schema
export const gameSessionSchema = z.object({
    name: z.string()
        .min(3, { message: "Session name must be at least 3 characters" })
        .max(100, { message: "Session name is too long" })
        .trim(),
    gameCode: z.string()
        .length(6, { message: "Game code must be exactly 6 characters" })
        .regex(/^[A-Z0-9]+$/, { message: "Game code must contain only uppercase letters and numbers" })
        .trim(),
    gameMode: z.enum(['Standard', 'Quick Play', 'Advanced', 'Custom'], {
        message: "Invalid game mode"
    }),
    categoryIds: z.array(z.number().positive())
        .min(1, { message: "At least one category is required" })
        .max(10, { message: "Too many categories selected" }),
    shuffledCardIds: z.array(z.number()).optional(),
    initialBudget: z.number().min(0, { message: "Budget cannot be negative" }).default(5000),
    initialBaseValue: z.number().min(0, { message: "Base value cannot be negative" }).default(5)
});
