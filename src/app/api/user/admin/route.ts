import { connectDB } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/routeMiddleware";
import User from "@/model/User";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const isAdmin = await requireAdmin(req);
  if (isAdmin instanceof NextResponse) return isAdmin;

  await connectDB();
  const users = await User.find().select("-passwordHash -tokenVersion -__v").lean();
  if (!users) {
    return NextResponse.json(
      { error: "Failed to query users" },
      { status: 404 },
    );
  }

  return NextResponse.json({ users });
}
