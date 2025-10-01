import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  name?: string;
  role?: "user" | "admin";
  createdAt?: Date;
  tokenVersion: number;
}

const UserSchema = new mongoose.Schema<IUser>({
  email: { type: String, required: true, unique: true, index: true },
  passwordHash: { type: String, required: true },
  name: { type: String, default: "" },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  createdAt: Date,
  tokenVersion: { type: Number, default: 0 },
});

export default mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
