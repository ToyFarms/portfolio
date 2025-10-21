import { connectDB } from "@/lib/mongodb";
import { GalleryImage } from "@/model/Gallery";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { tags: string } },
) {
  await connectDB();
  const { tags } = await params;
  const images = await GalleryImage.find({
    tags: { $all: tags.replaceAll(" ", "").split(",") },
  }).lean();
  if (!images)
    return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ images });
}
