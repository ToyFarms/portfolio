import { NextApiRequest, NextApiResponse } from "next";
import { connectDB } from "@/lib/mongodb";
import User from "@/model/User";
import bcrypt from "bcryptjs";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json(
      { error: "Required field: email and password" }
    );
  }

  await connectDB();
  const exists = await User.findOne({ email });
  if (exists) {
    return res.status(409).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = new User({
    email,
    passwordHash,
    name: name || "",
    role: "user",
  });
  await user.save();

  return res.status(200).json({ ok: true, id: (user._id as any).toString() });
}
