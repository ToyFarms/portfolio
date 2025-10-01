import { z } from "zod";

export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export type LoginCredentials = z.infer<typeof credentialsSchema>;
