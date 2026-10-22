import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({ ok: true, service: "juice-site", version: "2.0.0" });
}
