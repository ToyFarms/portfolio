// src/pages/api/gallery/index.ts
import { NextApiRequest, NextApiResponse } from "next";
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

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    await connectDB();

    const limitParam = Number(req.query.limit as string || "50");
    const limit = Math.min(Math.max(1, limitParam), 200);
    const before = req.query.before as string;

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

    return res.status(200).json({ images: out, nextCursor });
  }

  if (req.method === "POST") {
    await connectDB();

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
      const form = req.body;

      const filesFromMultiple = (form.files || []).filter(Boolean);
      const singleFile = form.file || null;

      const files: any[] = [];
      if (filesFromMultiple.length) files.push(...filesFromMultiple);
      if (singleFile) files.push(singleFile);

      if (files.length === 0) {
        return res.status(400).json({ error: "No file provided" });
      }

      const tags = form.tags || undefined;
      const createdIds: string[] = [];

      for (const file of files) {
        const buffer = Buffer.from(file.data);

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
          return res.status(500).json({ error: "Upload failed" });
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

      return res.status(201).json({ ids: createdIds });
    }

    try {
      const body = req.body;

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
          return res.status(500).json(
            { error: "Remote upload failed" }
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
        return res.status(201).json({ ids: [String(img._id)] });
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
          return res.status(500).json(
            { error: "No URLs uploaded" }
          );
        }
        return res.status(201).json({ ids: createdIds });
      }
    } catch (e) {}

    return res.status(400).json(
      { error: "No file or url provided" }
    );
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
