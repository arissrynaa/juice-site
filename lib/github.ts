import type { Content, MenuItem, SiteSettings } from "./types";

const API = "https://api.github.com";
const REPO = process.env.GITHUB_REPO ?? "arissrynaa/juice-site";
const BRANCH = process.env.CONTENT_BRANCH ?? "master";
const TOKEN = process.env.GITHUB_TOKEN ?? "";

const SITE_PATH = "content/site.json";
const MENU_PATH = "content/menu.json";

interface GhFile {
  content: string;
  sha: string;
}

function headers(): Record<string, string> {
  const h: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "juice-site-admin",
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function ghGet(path: string): Promise<GhFile | null> {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}?ref=${BRANCH}`, {
    headers: headers(),
    cache: "no-store",
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`github GET ${path} failed: ${res.status}`);
  const data = (await res.json()) as { content: string; sha: string };
  return { content: Buffer.from(data.content, "base64").toString("utf8"), sha: data.sha };
}

async function ghPut(path: string, body: string, sha?: string): Promise<void> {
  const res = await fetch(`${API}/repos/${REPO}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify({
      message: `chore(content): update ${path.split("/").pop()} via admin`,
      content: Buffer.from(body, "utf8").toString("base64"),
      branch: BRANCH,
      ...(sha ? { sha } : {}),
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`github PUT ${path} failed: ${res.status} ${text.slice(0, 200)}`);
  }
}

export function githubConfigured(): boolean {
  return Boolean(TOKEN);
}

export async function fetchGithubContent(): Promise<Content | null> {
  if (!githubConfigured()) return null;
  try {
    const [site, menu] = await Promise.all([ghGet(SITE_PATH), ghGet(MENU_PATH)]);
    if (!site || !menu) return null;
    return {
      site: JSON.parse(site.content) as SiteSettings,
      menu: JSON.parse(menu.content) as MenuItem[],
    };
  } catch {
    return null;
  }
}

export async function pushGithubContent(content: Content): Promise<boolean> {
  if (!githubConfigured()) return false;
  const [site, menu] = await Promise.all([ghGet(SITE_PATH), ghGet(MENU_PATH)]);
  await Promise.all([
    ghPut(SITE_PATH, JSON.stringify(content.site, null, 2) + "\n", site?.sha),
    ghPut(MENU_PATH, JSON.stringify(content.menu, null, 2) + "\n", menu?.sha),
  ]);
  return true;
}
