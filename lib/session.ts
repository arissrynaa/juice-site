// Edge-safe session helpers (Web Crypto only) - aman dipakai di middleware.
const COOKIE_NAME = "juice_admin";
const TTL_SECONDS = 8 * 60 * 60;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-chars-minimum";
}

async function hmac(payload: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(secret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export async function createSessionToken(): Promise<string> {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = String(exp);
  return `${payload}.${await hmac(payload)}`;
}

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = await hmac(payload);
  if (sig.length !== expected.length) return false;
  if (sig !== expected) return false;
  const exp = Number(payload);
  return Number.isFinite(exp) && exp * 1000 > Date.now();
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: TTL_SECONDS,
  };
}

export const ADMIN_COOKIE = COOKIE_NAME;
