import mongoose from "mongoose";

export interface IUser extends mongoose.Document {
  email: string;
  passwordHash: string;
  name?: string;
  image?: string;
  role?: "user" | "admin";
  createdAt?: Date;
  modifiedAt?: Date;
  tokenVersion: number;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, index: true },
    passwordHash: { type: String, required: true },
    name: { type: String, default: "" },
    image: { type: String, default: "" },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    createdAt: Date,
    modifiedAt: Date,
    tokenVersion: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  },
);

const User =
  (mongoose.models?.User as mongoose.Model<IUser>) ??
  mongoose.model<IUser>("User", UserSchema);

export default User;
