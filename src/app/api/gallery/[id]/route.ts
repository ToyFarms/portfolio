import { connectDB } from "@/lib/mongodb";
import { GalleryImage } from "@/model/Gallery";
import { NextRequest, NextResponse } from "next/server";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const img = await GalleryImage.findById(id).exec();
  if (!img) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (img.url && !img.data) {
    return NextResponse.redirect(img.url);
  }

  if (img.data && img.contentType) {
    return new NextResponse(img.data, {
      headers: { "Content-Type": img.contentType },
    });
  }

  return NextResponse.json({ error: "No image data" }, { status: 404 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  const img = await GalleryImage.findById(id).exec();
  if (!img) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const tags = (form.get("tags") as string) || undefined;
    if (file) {
      const buffer = Buffer.from(await file.arrayBuffer());
      img.filename = file.name;
      img.data = buffer;
      img.contentType = file.type || "application/octet-stream";
      img.size = buffer.byteLength;
      img.url = undefined;
    }
    if (tags !== undefined) img.tags = tags;
    await img.save();
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json();
    if (body.tags !== undefined) img.tags = body.tags;
    if (body.filename !== undefined) img.filename = body.filename;
    if (body.url !== undefined) {
      img.url = body.url;
      img.data = undefined;
      img.contentType = undefined;
      img.size = undefined;
    }
    await img.save();
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const { id } = params;
  await GalleryImage.findByIdAndDelete(id).exec();
  return NextResponse.json({ ok: true });
}
