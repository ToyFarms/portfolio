import mongoose from "mongoose";

export interface IGalleryImage extends mongoose.Document {
  filename?: string | null;
  data?: Buffer | null;
  contentType?: string | null;
  size?: number | null;
  bytes?: number | null;
  tags?: string[] | null;
  url?: string | null;
  publicId?: string | null;
  width?: number | null;
  height?: number | null;
  format?: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const GalleryImageSchema = new mongoose.Schema<IGalleryImage>(
  {
    filename: { type: String },
    data: { type: Buffer, select: false },

    contentType: { type: String },
    size: { type: Number },
    bytes: { type: Number },
    tags: {
      type: [String],
      index: true,
      default: [],
      set: (value: string[] | string | null) => {
        if (!value) return [];
        if (Array.isArray(value))
          return value.map((t) => t.trim()).filter(Boolean);
        return value
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);
      },
    },

    url: { type: String, index: true },
    publicId: { type: String, index: true },

    width: { type: Number },
    height: { type: Number },
    format: { type: String },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

GalleryImageSchema.virtual("dataURI").get(function (this: IGalleryImage) {
  if (this.data && this.contentType) {
    return `data:${this.contentType};base64,${this.data.toString("base64")}`;
  }
  return null;
});

GalleryImageSchema.virtual("thumbnailUrl").get(function (this: IGalleryImage) {
  if (this.publicId) {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const fmt = this.format || "jpg";
    return cloudName
      ? `https://res.cloudinary.com/${cloudName}/image/upload/w_400,h_300,c_fill/${this.publicId}.${fmt}`
      : this.url;
  }
  return this.url || null;
});

GalleryImageSchema.index({ createdAt: -1 });

export const GalleryImage =
  mongoose.models.GalleryImage ||
  mongoose.model<IGalleryImage>("GalleryImage", GalleryImageSchema);

export default GalleryImage;

// TODO: this belongs in /api
export type ImageItem = {
  _id: string;
  filename: string;
  contentType?: string;
  size?: number;
  tags?: string[];
  url?: string;
  createdAt?: string;
};
