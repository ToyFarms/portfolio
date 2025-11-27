import { ablyRest } from "@/lib/ably";
import { NextRequest, NextResponse } from "next/server";

async function createTokenRequest(clientId?: string) {
  return ablyRest.auth.createTokenRequest(clientId ? { clientId } : undefined);
}

export async function GET(_req: NextRequest) {
  try {
    const tokenReq = await createTokenRequest(undefined);
    return NextResponse.json(tokenReq);
  } catch (err) {
    console.error("TokenRequest GET failed", err);
    return NextResponse.json(
      { error: "token request failed" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const clientId = body?.id;
    const tokenReq = await createTokenRequest(clientId);
    return NextResponse.json(tokenReq);
  } catch (err) {
    console.error("TokenRequest POST failed", err);
    return NextResponse.json(
      { error: "token request failed" },
      { status: 500 },
    );
  }
}
