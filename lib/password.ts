// Node-only password hashing helpers (scrypt). Dipakai CLI, bukan middleware.
import crypto from "node:crypto";

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
