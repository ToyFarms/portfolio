import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import { GalleryImage } from "@/model/Gallery";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (req.method === "GET") {
    await connectDB();
    const img = await GalleryImage.findById(id).exec();
    if (!img) return res.status(404).json({ error: "Not found" });

    if (img.url && !img.data) {
      return res.redirect(img.url);
    }

    if (img.data && img.contentType) {
      res.setHeader("Content-Type", img.contentType);
      return res.send(img.data);
    }

    return res.status(404).json({ error: "No image data" });
  }

  if (req.method === "PUT") {
    await connectDB();
    const img = await GalleryImage.findById(id).exec();
    if (!img) return res.status(404).json({ error: "Not found" });

    const contentType = req.headers["content-type"] || "";

    if (contentType.includes("multipart/form-data")) {
      const form = req.body;
      const file = form.file || null;
      const tags = form.tags || undefined;
      if (file) {
        const buffer = Buffer.from(file.data);
        img.filename = file.name;
        img.data = buffer;
        img.contentType = file.type || "application/octet-stream";
        img.size = buffer.byteLength;
        img.url = undefined;
      }
      if (tags !== undefined) img.tags = tags;
      await img.save();
      return res.status(200).json({ ok: true });
    }

    try {
      const body = req.body;
      if (body.tags !== undefined) img.tags = body.tags;
      if (body.filename !== undefined) img.filename = body.filename;
      if (body.url !== undefined) {
        img.url = body.url;
        img.data = undefined;
        img.contentType = undefined;
        img.size = undefined;
      }
      await img.save();
      return res.status(200).json({ ok: true });
    } catch (e) {
      return res.status(400).json({ error: "Invalid body" });
    }
  }

  if (req.method === "DELETE") {
    await connectDB();
    await GalleryImage.findByIdAndDelete(id).exec();
    return res.status(200).json({ ok: true });
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
