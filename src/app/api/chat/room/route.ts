import { NextRequest, NextResponse } from "next/server";
import { chatroomPutSchema } from "../types";
import { auth } from "@/lib/auth";
import mongoose from "mongoose";
import { ChatRoom } from "@/model/Chat";
import { connectDB } from "@/lib/mongodb";

async function canonicalizeParticipants(a: string, b: string) {
  const parts = [a.toString(), b.toString()].sort();
  return parts.map((s) => new mongoose.Types.ObjectId(s));
}

export async function PUT(req: NextRequest) {
  const parsed = chatroomPutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 403 });
  }

  await connectDB();

  const callerId = session.user.id;
  const otherId = parsed.data.userId;

  if (!otherId) {
    return NextResponse.json(
      { error: "other participant id required" },
      { status: 400 },
    );
  }

  if (otherId === callerId) {
    return NextResponse.json(
      { error: "cannot create a chat with yourself" },
      { status: 400 },
    );
  }

  const participants = await canonicalizeParticipants(callerId, otherId);

  const room = await ChatRoom.findOneAndUpdate(
    { participants },
    { $setOnInsert: { participants }, $set: { updatedAt: new Date() } },
    { upsert: true, new: true },
  ).exec();

  return NextResponse.json({ room });
}

export async function DELETE(req: NextRequest) {
  const parsed = chatroomPutSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: "Not logged in" }, { status: 403 });
  }

  if (session.user.role !== "admin") {
    return NextResponse.json(
      { error: "Only admin permitted to delete chat" },
      { status: 403 },
    );
  }

  await connectDB();

  const callerId = session.user.id;
  const otherId = parsed.data.userId;

  if (!otherId) {
    return NextResponse.json(
      { error: "other participant id required" },
      { status: 400 },
    );
  }

  if (otherId === callerId) {
    return NextResponse.json(
      { error: "cannot create a chat with yourself" },
      { status: 400 },
    );
  }

  const participants = await canonicalizeParticipants(callerId, otherId);

  await ChatRoom.deleteOne({ participants }).exec();
  return NextResponse.json({});
}
