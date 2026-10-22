import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import { uploadImage } from "@/lib/upload";

export async function POST(request: Request) {
  const jar = await cookies();
  if (!await verifySessionToken(jar.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ ok: false, why: "UNAUTHORIZED" }, { status: 401 });
  }

  let filename = "";
  let dataUrl = "";
  try {
    const body = (await request.json()) as { filename?: string; dataUrl?: string };
    filename = body.filename ?? "";
    dataUrl = body.dataUrl ?? "";
  } catch {
    return NextResponse.json({ ok: false, why: "INVALID_BODY" }, { status: 400 });
  }

  const match = /^data:image\/[a-zA-Z0-9.+-]+;base64,(.+)$/.exec(dataUrl);
  if (!filename || !match) {
    return NextResponse.json({ ok: false, why: "INVALID_IMAGE" }, { status: 400 });
  }

  const result = await uploadImage(filename, match[1]);
  if (!result.ok) {
    return NextResponse.json({ ok: false, why: result.why }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url: `/images/${filename.replace(/[^a-zA-Z0-9._-]/g, "-")}` });
}
