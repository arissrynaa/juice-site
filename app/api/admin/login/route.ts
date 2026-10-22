import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, cookieOptions, createSessionToken } from "@/lib/session";

export async function POST(request: Request) {
  let password = "";
  try {
    const body = (await request.json()) as { password?: string };
    password = body.password ?? "";
  } catch {
    return NextResponse.json({ ok: false, why: "INVALID_BODY" }, { status: 400 });
  }

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return NextResponse.json({ ok: false, why: "ADMIN_PASSWORD_NOT_SET" }, { status: 500 });
  }
  if (password !== expected) {
    return NextResponse.json({ ok: false, why: "INVALID_PASSWORD" }, { status: 401 });
  }

  const jar = await cookies();
  jar.set(ADMIN_COOKIE, await createSessionToken(), cookieOptions());
  return NextResponse.json({ ok: true });
}
