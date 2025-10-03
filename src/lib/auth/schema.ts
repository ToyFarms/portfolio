import { z } from "zod";

export const credentialsSchema = z.object({
  email: z
    .string()
    .email({ message: "Please enter a valid email address." })
    .min(1, { message: "Email is required." }),
  password: z
    .string()
    .min(1, { message: "Password is required." })
    .min(3, { message: "Password must be at least 3 characters." }),
  remember: z.boolean().optional(),
});

export type LoginCredentials = z.infer<typeof credentialsSchema>;

export const signupSchema = credentialsSchema.extend({
  name: z.string().min(1, { message: "Name is required." }).max(100),
});
export type SignupCredentials = z.infer<typeof signupSchema>;
