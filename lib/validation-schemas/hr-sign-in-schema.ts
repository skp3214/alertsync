import {z} from "zod";

export const hrSignInSchema = z.object({
    identifier: z.string(),
    password: z.string(),
})