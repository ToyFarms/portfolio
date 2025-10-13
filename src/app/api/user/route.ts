import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User, { IUser } from "@/model/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserUpdate, userUpdateSchema } from "./types";

export async function GET(_req: Request) {
  const session = await auth();
  if (!session?.user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();
  const user = await User.findOne({ email: session.user.email })
    .select("-passwordHash")
    .lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const parsed = userUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  await connectDB();

  const data = parsed.data as UserUpdate;
  const user = await User.findOne({ email: session.user.email });
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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
      return NextResponse.json(
        { error: "Please provide the current password to change it" },
        { status: 400 },
      );
    }

    const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Password does not match" },
        { status: 401 },
      );
    }

    update.passwordHash = await bcrypt.hash(data.newPassword, 10);
    hasChanges = true;
  }

  if (data.email && data.email !== user.email) {
    if (!data.currentPassword) {
      return NextResponse.json(
        { error: "Please provide the current password to change email" },
        { status: 400 },
      );
    }

    const match = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!match) {
      return NextResponse.json(
        { error: "Password does not match" },
        { status: 401 },
      );
    }

    const existing = await User.findOne({ email: data.email });
    if (
      existing &&
      (existing._id as any).toString() !== (user._id as any).toString()
    ) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
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
      return NextResponse.json(
        { error: "Failed to update user" },
        { status: 500 },
      );
    }

    return NextResponse.json({ user: updatedUser });
  } catch (e: any) {
    console.error("Failed to update user", e);
    if (e?.code === 11000 && e.keyValue?.email) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }
    return NextResponse.json(
      { error: e?.message ?? "Server error" },
      { status: 500 },
    );
  }
}
