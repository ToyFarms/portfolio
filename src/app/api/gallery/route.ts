import { connectDB } from "@/lib/mongodb";
import { GalleryImage } from "@/model/Gallery";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  await connectDB();
  const images = await GalleryImage.find().sort({ createdAt: -1 }).lean();
  const out = images.map((img) => ({
    _id: img._id,
    contentType: img.contentType,
    size: img.size,
    tags: img.tags,
    url: img.url,
    createdAt: img.createdAt,
  }));

  return NextResponse.json(out);
}

export async function POST(req: NextRequest) {
  await connectDB();

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();
    const file = form.get("file") as File | null;
    const tags = (form.get("tags") as string) || undefined;
    if (!file)
      return NextResponse.json({ error: "No file provided" }, { status: 400 });

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const img = new GalleryImage({
      filename: file.name,
      data: buffer,
      contentType: file.type || "application/octet-stream",
      size: buffer.byteLength,
      tags,
    });
    await img.save();
    return NextResponse.json({ id: img._id }, { status: 201 });
  }

  try {
    const body = await req.json();
    if (body.url) {
      const filename = body.filename || body.url.split("/").pop() || "remote";
      const img = new GalleryImage({
        filename,
        url: body.url,
        tags: body.tags,
      });
      await img.save();
      return NextResponse.json({ id: img._id }, { status: 201 });
    }
  } catch (e) {}

  return NextResponse.json(
    { error: "No file or url provided" },
    { status: 400 },
  );
}
