import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function requireAdmin(
  req: NextRequest,
): Promise<{ ok: true; token: any } | NextResponse> {
  const token = await getToken({
    req: req as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
  if (token.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  return { ok: true, token };
}
