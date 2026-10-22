import crypto from "node:crypto";

const COOKIE_NAME = "juice_admin";
const TTL_SECONDS = 8 * 60 * 60;

function secret(): string {
  return process.env.AUTH_SECRET ?? "dev-secret-change-me-please-32-chars-minimum";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [scheme, salt, hash] = String(stored || "").split(":");
  if (scheme !== "scrypt" || !salt || !hash) return false;
  const check = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, "hex");
  return check.length === expected.length && crypto.timingSafeEqual(check, expected);
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("base64url");
}

export function createSessionToken(): string {
  const exp = Math.floor(Date.now() / 1000) + TTL_SECONDS;
  const payload = `${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = sign(payload);
  if (sig.length !== expected.length) return false;
  if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return false;
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
