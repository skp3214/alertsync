import * as z from "zod";

export const hrSchemaValidation = z.object({
    username: z.string()
        .trim()
        .min(3, "username must be atleast 3 characters")
        .max(20, "username must not be more than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "username must not contain special character"),
    email: z.email({ message: "invalid email" }),
    password: z.string()
        .min(6, { message: "password must be 6 characters" }),
    name: z.string()
        .regex(/^[a-zA-Z0-9_ ]+$/, "name must not contain special character"),
    org: z.string()
        .regex(/^[a-zA-Z0-9_ ]+$/, "org must not contain special character"),
})

export const hrEmailValidation = z.object({
    email: z.email({ message: "invalid email" })
});

export const hrUsernameValidation = z.object({
    username: z.string()
        .trim()
        .min(3, "username must be atleast 3 characters")
        .max(20, "username must not be more than 20 characters")
        .regex(/^[a-zA-Z0-9_]+$/, "username must not contain special character"),
});