import { z } from "zod";

export const userUpdateSchema = z
  .object({
    name: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().min(2, "Name must be at least 2 characters").optional(),
    ),
    email: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().email("Invalid email address").optional(),
    ),
    image: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().url("Invalid image URL").optional(),
    ),
    newPassword: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().min(1, "New password must not be empty").optional(),
    ),
    currentPassword: z.preprocess(
      (v) => (v === "" ? undefined : v),
      z.string().min(1, "Current password must not be empty").optional(),
    ),
  })
  .refine(
    (data) => {
      if (data.newPassword && !data.currentPassword) return false;
      return true;
    },
    {
      message:
        "Current password is required when updating to a new password or changing email",
      path: ["currentPassword"],
    },
  );

export type UserUpdate = z.infer<typeof userUpdateSchema>;
