import { ablyRest } from "@/lib/ably";
import { NextRequest, NextResponse } from "next/server";

async function createTokenRequest(clientId?: string) {
  return ablyRest.auth.createTokenRequest(clientId ? { clientId } : undefined);
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("clientId");

    const tokenReq = await createTokenRequest(id!);
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
    const url = new URL(req.url);
    const id = url.searchParams.get("clientId");

    const tokenReq = await createTokenRequest(id!);
    return NextResponse.json(tokenReq);
  } catch (err) {
    console.error("TokenRequest POST failed", err);
    return NextResponse.json(
      { error: "token request failed" },
      { status: 500 },
    );
  }
}
