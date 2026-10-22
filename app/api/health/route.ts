import { NextResponse } from "next/server";
import { blobConfigured } from "@/lib/store";

export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "juice-site",
    version: "2.0.0",
    store: blobConfigured() ? "blob" : "local",
  });
}
