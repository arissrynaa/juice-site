import { del, get, list, put } from "@vercel/blob";
import { promises as fs } from "node:fs";
import path from "node:path";
import type { Content, MenuItem, SiteSettings } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const LOCAL_SITE = path.join(CONTENT_DIR, "site.json");
const LOCAL_MENU = path.join(CONTENT_DIR, "menu.json");

const SITE_BLOB = "content/site.json";
const MENU_BLOB = "content/menu.json";
const IMAGES_PREFIX = "images";

export function blobConfigured(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

async function readLocal(): Promise<Content> {
  const [siteRaw, menuRaw] = await Promise.all([
    fs.readFile(LOCAL_SITE, "utf8"),
    fs.readFile(LOCAL_MENU, "utf8"),
  ]);
  return {
    site: JSON.parse(siteRaw) as SiteSettings,
    menu: JSON.parse(menuRaw) as MenuItem[],
  };
}

async function writeLocal(content: Content): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(LOCAL_SITE, JSON.stringify(content.site, null, 2) + "\n", "utf8"),
    fs.writeFile(LOCAL_MENU, JSON.stringify(content.menu, null, 2) + "\n", "utf8"),
  ]);
}

async function readBlobJson<T>(blobPath: string, fallback: T): Promise<T> {
  try {
    const result = await get(blobPath, { access: "public", useCache: false });
    if (!result || result.statusCode !== 200) return fallback;
    const text = await new Response(result.stream).text();
    if (!text) return fallback;
    return JSON.parse(text) as T;
  } catch {
    return fallback;
  }
}

export async function getContent(): Promise<Content> {
  const local = await readLocal().catch(() => ({
    site: {} as SiteSettings,
    menu: [] as MenuItem[],
  }));

  if (!blobConfigured()) return local;

  const [site, menu] = await Promise.all([
    readBlobJson<SiteSettings>(SITE_BLOB, local.site),
    readBlobJson<MenuItem[]>(MENU_BLOB, local.menu),
  ]);

  return { site, menu };
}

export async function saveContent(content: Content): Promise<{ where: "blob" | "local" }> {
  if (!blobConfigured()) {
    await writeLocal(content).catch(() => {});
    return { where: "local" };
  }

  await Promise.all([
    put(SITE_BLOB, JSON.stringify(content.site, null, 2) + "\n", {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    }),
    put(MENU_BLOB, JSON.stringify(content.menu, null, 2) + "\n", {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 60,
    }),
  ]);

  return { where: "blob" };
}

export async function listImages(): Promise<string[]> {
  if (!blobConfigured()) return [];
  try {
    const { blobs } = await list({ prefix: IMAGES_PREFIX });
    return blobs.map((b) => b.url).sort();
  } catch {
    return [];
  }
}

function contentTypeFor(name: string): string {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (ext === "png") return "image/png";
  if (ext === "webp") return "image/webp";
  if (ext === "gif") return "image/gif";
  if (ext === "svg") return "image/svg+xml";
  return "image/jpeg";
}

export async function uploadImage(
  filename: string,
  base64: string,
): Promise<{ ok: boolean; url: string; why?: string }> {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]/g, "-");
  const bytes = Buffer.from(base64, "base64");

  if (blobConfigured()) {
    try {
      const res = await put(`${IMAGES_PREFIX}/${safeName}`, bytes, {
        access: "public",
        contentType: contentTypeFor(safeName),
        addRandomSuffix: false,
        allowOverwrite: true,
        cacheControlMaxAge: 60 * 60 * 24 * 30,
      });
      return { ok: true, url: res.url };
    } catch (err) {
      return { ok: false, url: "", why: err instanceof Error ? err.message : "blob upload failed" };
    }
  }

  try {
    const target = path.join(process.cwd(), "public", IMAGES_PREFIX, safeName);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, bytes);
    return { ok: true, url: `/images/${safeName}` };
  } catch (err) {
    return { ok: false, url: "", why: err instanceof Error ? err.message : "local write failed" };
  }
}

export async function deleteImage(blobPath: string): Promise<boolean> {
  if (!blobConfigured()) return false;
  try {
    await del(blobPath);
    return true;
  } catch {
    return false;
  }
}
