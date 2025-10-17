import mongoose from "mongoose";
import { auth } from "@/lib/auth";
import { connectDB } from "@/lib/mongodb";
import { ChatRoom } from "@/model/Chat";
import { NextRequest, NextResponse } from "next/server";
import { chatSendMessageSchema } from "./types";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (id) {
    const room = await ChatRoom.findById(id)
      .populate("participants", "name email image")
      .sort({ updatedAt: -1 })
      .lean()
      .exec();
    return NextResponse.json({ room });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 403 });
  }

  await connectDB();

  const rooms = await ChatRoom.find({ participants: session.user.id })
    .populate("participants", "name email image")
    .sort({ updatedAt: -1 })
    .lean()
    .exec();

  return NextResponse.json({ rooms });
}

export async function PUT(req: NextRequest) {
  const parsed = chatSendMessageSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 403 });
  }

  await connectDB();

  const { chatroomId, content } = parsed.data;

  if (!mongoose.Types.ObjectId.isValid(chatroomId)) {
    return NextResponse.json({ error: "invalid chatroom id" }, { status: 400 });
  }

  const room = await ChatRoom.findById(chatroomId).exec();
  if (!room) {
    return NextResponse.json({ error: "chatroom not found" }, { status: 404 });
  }

  const callerId = session.user.id.toString();
  const isParticipant =
    room.participants &&
    room.participants.some((p: any) => p.toString() === callerId);

  if (!isParticipant) {
    return NextResponse.json(
      { error: "not a participant in this chat" },
      { status: 403 },
    );
  }

  const message = {
    sender: room.participants.findIndex((x) => x._id.toString() === callerId),
    content,
  };

  const updated = await ChatRoom.findByIdAndUpdate(
    chatroomId,
    {
      $push: { messages: message },
      $set: { updatedAt: new Date() },
    },
    { new: true, runValidators: true },
  ).exec();

  return NextResponse.json({ room: updated });
}
