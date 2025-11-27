import { signOut } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  await signOut();

  return NextResponse.redirect(new URL("/", request.url));
}
