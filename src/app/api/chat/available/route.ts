import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ChatRoom } from "@/model/Chat";
import User from "@/model/User";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 403 });
  }

  await connectDB();

  const meId = session.user.id.toString();

  const participantIds: Types.ObjectId[] = await ChatRoom.find({
    participants: meId,
  })
    .distinct("participants")
    .lean()
    .exec();

  const otherParticipantIds = (participantIds || []).filter(
    (id) => id.toString() !== meId,
  );

  const targetRole = session.user.role === "admin" ? "user" : "admin";

  const users = await User.find(
    { role: targetRole, _id: { $nin: otherParticipantIds } },
    { passwordHash: 0, tokenVersion: 0 },
  )
    .lean()
    .exec();

  return NextResponse.json({ users });
}
