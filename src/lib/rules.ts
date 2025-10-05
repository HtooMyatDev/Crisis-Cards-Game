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
    username: z.string().min(5, { message: "Username must be at least 5 characters" }).max(20, { message: "Username is  too long" }),
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
