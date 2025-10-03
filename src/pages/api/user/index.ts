import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";
import { connectDB } from "@/lib/mongodb";
import User, { IUser } from "@/model/User";
import { UserUpdate, userUpdateSchema } from "./types";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    const session = await getServerSession(req, res, {});
    if (!session?.user.email) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    await connectDB();
    const user = await User.findOne({ email: session.user.email })
      .select("-passwordHash")
      .lean();
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ user });
  }

  if (req.method === "PUT") {
    const session = await getServerSession(req, res, {});
    if (!session?.user.email) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const parsed = userUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.issues });
    }

    await connectDB();

    const data = parsed.data as UserUpdate;
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const update: Partial<IUser> & Partial<UserUpdate> = {};
    let hasChanges = false;

    if (typeof data.name !== "undefined" && data.name !== user.name) {
      update.name = data.name;
      hasChanges = true;
    }

    if (typeof data.image !== "undefined" && data.image !== user.image) {
      update.image = data.image === "" ? undefined : data.image;
      hasChanges = true;
    }

    if (data.newPassword) {
      if (!data.currentPassword) {
        return res.status(400).json(
          { error: "Please provide the current password to change it" }
        );
      }

      const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!match) {
        return res.status(401).json(
          { error: "Password does not match" }
        );
      }

      update.passwordHash = await bcrypt.hash(data.newPassword, 10);
      hasChanges = true;
    }

    if (data.email && data.email !== user.email) {
      if (!data.currentPassword) {
        return res.status(400).json(
          { error: "Please provide the current password to change email" }
        );
      }

      const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
      if (!match) {
        return res.status(401).json(
          { error: "Password does not match" }
        );
      }

      const existing = await User.findOne({ email: data.email });
      if (
        existing &&
        (existing._id as any).toString() !== (user._id as any).toString()
      ) {
        return res.status(409).json(
          { error: "Email already in use" }
        );
      }

      update.email = data.email;
      hasChanges = true;
    }

    if (hasChanges) {
      update.tokenVersion = (user.tokenVersion ?? 0) + 1;
    }

    try {
      const updatedUser = await User.findOneAndUpdate(
        { email: session.user.email },
        { $set: update },
        { new: true, select: "-passwordHash" },
      );
      if (!updatedUser) {
        return res.status(500).json(
          { error: "Failed to update user" }
        );
      }

      return res.status(200).json({ user: updatedUser });
    } catch (e: any) {
      console.error("Failed to update user", e);
      if (e?.code === 11000 && e.keyValue?.email) {
        return res.status(409).json(
          { error: "Email already in use" }
        );
      }
      return res.status(500).json(
        { error: e?.message ?? "Server error" }
      );
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
