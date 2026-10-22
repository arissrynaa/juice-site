import { promises as fs } from "node:fs";
import path from "node:path";

const API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO ?? "arissrynaa/juice-site";
const BRANCH = process.env.CONTENT_BRANCH ?? "master";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

const PUBLIC_DIR = path.join(process.cwd(), "public");

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "juice-site-admin",
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function getSha(filePath: string): Promise<string | undefined> {
  const res = await fetch(`${API}/repos/${REPO}/contents/${filePath}?ref=${BRANCH}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { sha: string };
  return data.sha;
}

export async function uploadImage(
  filename: string,
  base64: string,
): Promise<{ ok: boolean; path: string; why?: string }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const filePath = `public/images/${safeName}`;

  if (TOKEN) {
    try {
      const sha = await getSha(filePath);
      const res = await fetch(`${API}/repos/${REPO}/contents/${filePath}`, {
        method: "PUT",
        headers: { ...headers(), "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `chore(media): upload ${safeName}`,
          content: base64,
          branch: BRANCH,
          ...(sha ? { sha } : {}),
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        return { ok: false, path: filePath, why: `github ${res.status}: ${text.slice(0, 150)}` };
      }
      return { ok: true, path: filePath };
    } catch (err) {
      return { ok: false, path: filePath, why: err instanceof Error ? err.message : "upload failed" };
    }
  }

  try {
    const target = path.join(PUBLIC_DIR, "images", safeName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, Buffer.from(base64, "base64"));
    return { ok: true, path: filePath };
  } catch (err) {
    return { ok: false, path: filePath, why: err instanceof Error ? err.message : "local write failed" };
  }
}
