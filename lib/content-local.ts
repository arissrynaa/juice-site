import { promises as fs } from "node:fs";
import path from "node:path";
import type { Content, MenuItem, SiteSettings } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "content");
const SITE_FILE = path.join(CONTENT_DIR, "site.json");
const MENU_FILE = path.join(CONTENT_DIR, "menu.json");

export async function readLocalContent(): Promise<Content> {
  const [siteRaw, menuRaw] = await Promise.all([
    fs.readFile(SITE_FILE, "utf8"),
    fs.readFile(MENU_FILE, "utf8"),
  ]);
  return {
    site: JSON.parse(siteRaw) as SiteSettings,
    menu: JSON.parse(menuRaw) as MenuItem[],
  };
}

export async function writeLocalContent(content: Content): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
  await Promise.all([
    fs.writeFile(SITE_FILE, JSON.stringify(content.site, null, 2) + "\n", "utf8"),
    fs.writeFile(MENU_FILE, JSON.stringify(content.menu, null, 2) + "\n", "utf8"),
  ]);
}

export async function getContent(): Promise<Content> {
  try {
    return await readLocalContent();
  } catch {
    return { site: {} as SiteSettings, menu: [] };
  }
}
