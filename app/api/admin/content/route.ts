import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, verifySessionToken } from "@/lib/session";
import { getContent, writeLocalContent } from "@/lib/content-local";
import { fetchGithubContent, pushGithubContent } from "@/lib/github";
import type { Content } from "@/lib/types";

async function isAuthed(): Promise<boolean> {
  const jar = await cookies();
  return await verifySessionToken(jar.get(ADMIN_COOKIE)?.value);
}

export async function GET() {
  if (!(await isAuthed())) {
    return NextResponse.json({ ok: false, why: "UNAUTHORIZED" }, { status: 401 });
  }
  const local = await getContent();
  const remote = await fetchGithubContent();
  return NextResponse.json({
    ok: true,
    content: remote ?? local,
    source: remote ? "github" : "local",
    githubEnabled: Boolean(process.env.GITHUB_TOKEN),
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

  await writeLocalContent(content);

  let pushed = false;
  let pushError: string | undefined;
  try {
    pushed = await pushGithubContent(content);
  } catch (err) {
    pushError = err instanceof Error ? err.message : "push failed";
  }

  return NextResponse.json({
    ok: true,
    pushed,
    pushError,
    note: pushed
      ? "Content disimpan dan di-commit ke GitHub. Rebuild Vercel berjalan otomatis."
      : "Content disimpan lokal. Set GITHUB_TOKEN agar perubahan tayang otomatis.",
  });
}
