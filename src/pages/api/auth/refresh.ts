import { NextApiRequest, NextApiResponse } from "next";
import { getServerSession } from "next-auth";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const session = await getServerSession(req, res, {});
    
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    // The session refresh is handled by NextAuth's JWT callback
    // This endpoint just triggers a session validation
    return res.status(200).json({ 
      success: true, 
      message: "Session validated successfully" 
    });
  } catch (error) {
    console.error("Session validation error:", error);
    return res.status(500).json(
      { error: "Failed to validate session" }
    );
  }
}
