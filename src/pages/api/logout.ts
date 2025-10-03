import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Clear the session cookie
  res.setHeader('Set-Cookie', 'next-auth.session-token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; HttpOnly; SameSite=Lax');

  return res.redirect("/");
}
