import { z } from "zod";

export const userUpdateSchema = z
  .object({
    name: z.string().optional(),
    newPassword: z.string().min(1).optional(),
    currentPassword: z.string().min(1).optional(),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) {
        return false;
      }
      return true;
    },
    {
      message: "Current password is required when updating to a new password",
      path: ["currentPassword"],
    },
  );

export type UserUpdate = z.infer<typeof userUpdateSchema>;
