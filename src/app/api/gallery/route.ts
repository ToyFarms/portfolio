// src/app/api/gallery/route.ts
import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import streamifier from "streamifier";
import { connectDB } from "@/lib/mongodb";
import { GalleryImage } from "@/model/Gallery";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const UPLOAD_FOLDER = process.env.CLOUDINARY_UPLOAD_FOLDER || "gallery";

async function uploadBufferToCloudinary(buffer: Buffer, options: any = {}) {
  return new Promise<any>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

export async function GET(req: NextRequest) {
  await connectDB();

  const url = new URL(req.url);
  const limitParam = Number(url.searchParams.get("limit") || "50");
  const limit = Math.min(Math.max(1, limitParam), 200);
  const before = url.searchParams.get("before");

  const filter: any = {};
  if (before) {
    const maybeDate = isNaN(Number(before))
      ? new Date(before)
      : new Date(Number(before));
    if (!isNaN(maybeDate.getTime())) {
      filter.createdAt = { $lt: maybeDate };
    }
  }

  const docs = await GalleryImage.find(filter)
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  const out = docs.map((img) => ({
    _id: img._id,
    filename: img.filename,
    url: img.url,
    publicId: img.publicId,
    contentType: img.contentType,
    size: img.size,
    tags: img.tags,
    width: img.width,
    height: img.height,
    format: img.format,
    createdAt: img.createdAt,
  }));

  const nextCursor = docs.length > 0 ? docs[docs.length - 1].createdAt : null;

  return NextResponse.json({ images: out, nextCursor });
}

export async function POST(req: NextRequest) {
  await connectDB();

  const contentType = req.headers.get("content-type") || "";

  if (contentType.includes("multipart/form-data")) {
    const form = await req.formData();

    const filesFromMultiple = (form.getAll("files") || []).filter(
      Boolean,
    ) as File[];
    const singleFile = (form.get("file") as File) || null;

    const files: File[] = [];
    if (filesFromMultiple.length) files.push(...filesFromMultiple);
    if (singleFile) files.push(singleFile);

    if (files.length === 0) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const tags = (form.get("tags") as string) || undefined;
    const createdIds: string[] = [];

    for (const file of files) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadOpts: any = {
        folder: UPLOAD_FOLDER,
        resource_type: "image",
        use_filename: true,
        unique_filename: true,
      };

      let result;
      try {
        result = await uploadBufferToCloudinary(buffer, uploadOpts);
      } catch (err) {
        console.error("Cloudinary upload failed:", err);
        return NextResponse.json({ error: "Upload failed" }, { status: 500 });
      }

      const img = new GalleryImage({
        filename: file.name,
        url: result.secure_url,
        publicId: result.public_id,
        contentType: file.type || "image",
        size: buffer.byteLength,
        width: result.width,
        height: result.height,
        format: result.format,
        tags,
      });

      await img.save();
      createdIds.push(String(img._id));
    }

    return NextResponse.json({ ids: createdIds }, { status: 201 });
  }

  try {
    const body = await req.json();

    if (body.url) {
      const url = String(body.url);
      const filename = body.filename || url.split("/").pop() || "remote";
      let result;
      try {
        result = await cloudinary.uploader.upload(url, {
          folder: UPLOAD_FOLDER,
          resource_type: "image",
          use_filename: true,
          unique_filename: true,
        });
      } catch (err) {
        console.error("Cloudinary remote upload failed:", err);
        return NextResponse.json(
          { error: "Remote upload failed" },
          { status: 500 },
        );
      }

      const img = new GalleryImage({
        filename,
        url: result.secure_url,
        publicId: result.public_id,
        size: result.bytes,
        width: result.width,
        height: result.height,
        format: result.format,
        tags: body.tags,
      });
      await img.save();
      return NextResponse.json({ ids: [String(img._id)] }, { status: 201 });
    }

    if (Array.isArray(body.urls) && body.urls.length > 0) {
      const createdIds: string[] = [];
      for (const u of body.urls) {
        const url = String(u);
        const filename = (url && url.split("/").pop()) || "remote";
        let result;
        try {
          result = await cloudinary.uploader.upload(url, {
            folder: UPLOAD_FOLDER,
            resource_type: "image",
            use_filename: true,
            unique_filename: true,
          });
        } catch (err) {
          console.error("Cloudinary remote upload failed for", url, err);
          continue;
        }

        const img = new GalleryImage({
          filename,
          url: result.secure_url,
          publicId: result.public_id,
          size: result.bytes,
          width: result.width,
          height: result.height,
          format: result.format,
          tags: body.tags,
        });
        await img.save();
        createdIds.push(String(img._id));
      }
      if (createdIds.length === 0) {
        return NextResponse.json(
          { error: "No URLs uploaded" },
          { status: 500 },
        );
      }
      return NextResponse.json({ ids: createdIds }, { status: 201 });
    }
  } catch (e) {}

  return NextResponse.json(
    { error: "No file or url provided" },
    { status: 400 },
  );
}
