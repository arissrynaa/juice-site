import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import { blobConfigured, getContent, saveContent } from "@/lib/store";
import type { Content } from "@/lib/types";

async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, why: "UNAUTHORIZED" }, { status: 401 });
  }
  const content = await getContent();
  return NextResponse.json({
    ok: true,
    content,
    store: blobConfigured() ? "blob" : "local",
  });
}

export async function PUT(request: Request) {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, why: "UNAUTHORIZED" }, { status: 401 });
  }

  let content: Content;
  try {
    content = (await request.json()) as Content;
  } catch {
    return NextResponse.json({ ok: false, why: "INVALID_BODY" }, { status: 400 });
  }
  if (!content?.site?.brand || !Array.isArray(content.menu)) {
    return NextResponse.json({ ok: false, why: "INVALID_SHAPE" }, { status: 400 });
  }

  try {
    const result = await saveContent(content);
    return NextResponse.json({
      ok: true,
      store: result.where,
      note:
        result.where === "blob"
          ? "Tersimpan. Perubahan langsung tayang di situs."
          : "Tersimpan di disk lokal (dev mode).",
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, why: err instanceof Error ? err.message : "SAVE_FAILED" },
      { status: 500 },
    );
  }
}
