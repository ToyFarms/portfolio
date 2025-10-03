import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password, name } = body;
  if (!email || !password) {
    return NextResponse.json(
      { error: "Required field: email and password" },
      { status: 400 },
    );
  }

  await connectDB();
  const exists = await User.findOne({ email });
  if (exists) {
    return NextResponse.json({ error: "User already exists" }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    passwordHash,
    name: name || "",
    role: "user",
  });
  await user.save();

  return NextResponse.json({ ok: true, id: (user._id as any).toString() });
}
