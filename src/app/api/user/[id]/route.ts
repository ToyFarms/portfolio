import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import { useRouter } from "next/router";
import { NextResponse } from "next/server";

export async function GET(_req: Request) {
  const session = await auth();
  if (!session?.user.email) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  await connectDB();

  const router = useRouter();
  const user = await User.findOne(
    { id: router.query.id },
    { passwordHash: 0, tokenVersion: 0 },
  ).lean();
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user });
}
