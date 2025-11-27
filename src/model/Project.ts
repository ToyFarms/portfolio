import mongoose from "mongoose";

export interface IProject extends mongoose.Document {
  title: string;
  url: string | null;
  description: string | null;
  imageKey: string | null;
  technologies: string[];
}

const ProjectSchema = new mongoose.Schema<IProject>({
  title: { type: String },
  url: { type: String },
  description: { type: String },
  imageKey: { type: String },
  technologies: { type: [String], default: [] },
});

export const Project =
  mongoose.models.Project || mongoose.model<IProject>("Project", ProjectSchema);
