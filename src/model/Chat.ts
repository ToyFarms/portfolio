import mongoose, { Types } from "mongoose";
import { IUser } from "./User";

export interface IChatMessage extends mongoose.Document {
  sender: number;
  content: string;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatRoom extends mongoose.Document {
  participants: Types.ObjectId[];
  messages: IChatMessage[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChatMessagePopulated extends mongoose.Document {
  sender: number;
  content: string;
  read?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
export interface IChatRoomPopulated extends mongoose.Document {
  participants: IUser[];
  messages: IChatMessagePopulated[];
  createdAt?: Date;
  updatedAt?: Date;
}

const ChatMessageSchema = new mongoose.Schema<IChatMessage>(
  {
    sender: {
      type: Number,
      required: true,
    },
    content: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const ChatRoomSchema = new mongoose.Schema<IChatRoom>(
  {
    participants: {
      type: [
        { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
      ],
      validate: {
        validator: (v: Types.ObjectId[]) => Array.isArray(v) && v.length === 2,
        message: "participants must be an array of exactly two user ids",
      },
      required: true,
    },
    messages: { type: [ChatMessageSchema], default: [] },
  },
  { timestamps: true },
);

ChatRoomSchema.pre("save", function (next) {
  if (this.participants && this.participants.length === 2) {
    const p = this.participants
      .map((id: Types.ObjectId) => id.toString())
      .sort();
    this.participants = p.map((s) => new Types.ObjectId(s)) as any;
  }
  next();
});

ChatRoomSchema.index(
  { "participants.0": 1, "participants.1": 1 },
  { unique: true },
);

export const ChatRoom =
  (mongoose.models?.ChatRoom as mongoose.Model<IChatRoom>) ??
  mongoose.model<IChatRoom>("ChatRoom", ChatRoomSchema);
