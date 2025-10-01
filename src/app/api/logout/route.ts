import { signOut } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  await signOut();

  return NextResponse.redirect(new URL("/", request.url));
}
