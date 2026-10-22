"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Content, MenuItem, SiteSettings } from "@/lib/types";

type Tab = "site" | "menu" | "media";

const TEXT_FIELDS: Array<{ key: keyof SiteSettings; label: string; type?: "text" | "textarea" }> = [
  { key: "brand", label: "Brand" },
  { key: "slogan", label: "Slogan / Headline" },
  { key: "heroSub", label: "Hero Subtext", type: "textarea" },
  { key: "heroBadge", label: "Hero Badge" },
  { key: "heroImage", label: "Hero Image Path" },
  { key: "heroImageAlt", label: "Hero Image Alt" },
  { key: "waLink", label: "WhatsApp Link" },
  { key: "phoneDisplay", label: "Nomor WhatsApp (tampil)" },
  { key: "instagramUrl", label: "Instagram URL" },
  { key: "instagramHandle", label: "Instagram Handle" },
  { key: "instagramBlurb", label: "Instagram Blurb", type: "textarea" },
  { key: "email", label: "Email" },
  { key: "address", label: "Alamat", type: "textarea" },
  { key: "mapsEmbed", label: "Google Maps Embed URL", type: "textarea" },
  { key: "footerText", label: "Footer Text" },
  { key: "aboutTitle", label: "Judul Tentang Kami" },
  { key: "aboutBody", label: "Isi Tentang Kami", type: "textarea" },
];

export default function AdminDashboard({ initial }: { initial: Content }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("site");
  const [site, setSite] = useState<SiteSettings>(initial.site);
  const [menu, setMenu] = useState<MenuItem[]>(initial.menu);
  const [status, setStatus] = useState<{ kind: "idle" | "saving" | "ok" | "err"; msg: string }>({
    kind: "idle",
    msg: "",
  });
  const [storeMode, setStoreMode] = useState<"blob" | "local">("local");

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && d.content) {
          setSite(d.content.site);
          setMenu(d.content.menu);
          setStoreMode(d.store === "blob" ? "blob" : "local");
        }
      })
      .catch(() => {});
  }, []);

  const content = useMemo<Content>(() => ({ site, menu }), [site, menu]);

  const setSiteField = useCallback((key: keyof SiteSettings, value: string) => {
    setSite((s) => ({ ...s, [key]: value }));
  }, []);

  const updateMenuItem = useCallback((id: string, patch: Partial<MenuItem>) => {
    setMenu((list) => list.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }, []);

  const addMenuItem = useCallback(() => {
    setMenu((list) => [
      ...list,
      {
        id: `item-${Date.now().toString(36)}`,
        name: "Menu Baru",
        badge: "",
        description: "",
        nutrition: "",
        price: "Rp —",
        image: "",
        imageAlt: "",
        featured: false,
        order: list.length + 1,
      },
    ]);
  }, []);

  const removeMenuItem = useCallback((id: string) => {
    setMenu((list) => list.filter((item) => item.id !== id));
  }, []);

  const moveItem = useCallback((id: string, dir: -1 | 1) => {
    setMenu((list) => {
      const sorted = [...list].sort((a, b) => a.order - b.order);
      const idx = sorted.findIndex((i) => i.id === id);
      const swap = idx + dir;
      if (idx < 0 || swap < 0 || swap >= sorted.length) return list;
      const tmp = sorted[idx].order;
      sorted[idx].order = sorted[swap].order;
      sorted[swap].order = tmp;
      return sorted;
    });
  }, []);

  async function save() {
    setStatus({ kind: "saving", msg: "Menyimpan..." });
    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(content),
      });
      const data = (await res.json()) as { ok: boolean; note?: string; why?: string };
      if (!data.ok) {
        setStatus({ kind: "err", msg: `Gagal menyimpan: ${data.why ?? "unknown"}` });
        return;
      }
      setStatus({ kind: "ok", msg: data.note ?? "Tersimpan." });
    } catch {
      setStatus({ kind: "err", msg: "Gagal menghubungi server." });
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-surface-container">
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-surface-border">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <div>
            <h1 className="font-headline font-bold text-primary leading-tight">Admin Dashboard</h1>
            <p className="text-xs text-muted">
              {storeMode === "blob" ? "Penyimpanan: Vercel Blob - perubahan langsung tayang" : "Penyimpanan: lokal (dev)"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" target="_blank" className="text-sm font-semibold text-secondary hover:underline">
              Lihat Situs
            </a>
            <button onClick={logout} className="text-sm font-semibold text-muted hover:text-primary">
              Keluar
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-5 py-6">
        <div className="flex gap-2 mb-6 border-b border-surface-border">
          {(
            [
              ["site", "Pengaturan Situs"],
              ["menu", "Menu Produk"],
              ["media", "Media"],
            ] as Array<[Tab, string]>
          ).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 -mb-px transition-colors ${
                tab === key
                  ? "border-primary text-primary"
                  : "border-transparent text-muted hover:text-primary"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "site" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <section className="bg-white border border-card-border rounded-xl p-5">
              <h2 className="font-semibold text-primary mb-4">Identitas & Hero</h2>
              {TEXT_FIELDS.map((f) => (
                <div key={String(f.key)} className="mb-4">
                  <label className="label" htmlFor={String(f.key)}>
                    {f.label}
                  </label>
                  {f.type === "textarea" ? (
                    <textarea
                      id={String(f.key)}
                      className="field min-h-[80px]"
                      value={String(site[f.key] ?? "")}
                      onChange={(e) => setSiteField(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      id={String(f.key)}
                      className="field"
                      value={String(site[f.key] ?? "")}
                      onChange={(e) => setSiteField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))}
            </section>

            <section className="bg-white border border-card-border rounded-xl p-5">
              <h2 className="font-semibold text-primary mb-4">Keunggulan</h2>
              {site.advantages?.map((adv, i) => (
                <div key={i} className="mb-4 pb-4 border-b border-surface-border last:border-0">
                  <div className="grid grid-cols-[110px_1fr] gap-2 mb-2">
                    <div>
                      <label className="label">Icon</label>
                      <input
                        className="field"
                        value={adv.icon}
                        onChange={(e) => {
                          const next = [...(site.advantages ?? [])];
                          next[i] = { ...adv, icon: e.target.value };
                          setSite({ ...site, advantages: next });
                        }}
                      />
                    </div>
                    <div>
                      <label className="label">Judul</label>
                      <input
                        className="field"
                        value={adv.title}
                        onChange={(e) => {
                          const next = [...(site.advantages ?? [])];
                          next[i] = { ...adv, title: e.target.value };
                          setSite({ ...site, advantages: next });
                        }}
                      />
                    </div>
                  </div>
                  <label className="label">Deskripsi</label>
                  <textarea
                    className="field min-h-[60px]"
                    value={adv.desc}
                    onChange={(e) => {
                      const next = [...(site.advantages ?? [])];
                      next[i] = { ...adv, desc: e.target.value };
                      setSite({ ...site, advantages: next });
                    }}
                  />
                </div>
              ))}

              <h2 className="font-semibold text-primary mt-6 mb-4">Langkah Pemesanan</h2>
              {site.steps?.map((step, i) => (
                <div key={i} className="mb-3">
                  <label className="label">Langkah {i + 1}</label>
                  <input
                    className="field"
                    value={step}
                    onChange={(e) => {
                      const next = [...(site.steps ?? [])];
                      next[i] = e.target.value;
                      setSite({ ...site, steps: next });
                    }}
                  />
                </div>
              ))}
            </section>
          </div>
        )}

        {tab === "menu" && (
          <div className="space-y-5">
            <div className="flex justify-end">
              <button onClick={addMenuItem} className="btn-primary text-sm font-semibold">
                + Tambah Item
              </button>
            </div>
            {[...menu]
              .sort((a, b) => a.order - b.order)
              .map((item) => (
                <section key={item.id} className="bg-white border border-card-border rounded-xl p-5">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <h2 className="font-semibold text-primary">{item.name}</h2>
                    <div className="flex items-center gap-2">
                      <button onClick={() => moveItem(item.id, -1)} className="text-sm text-muted hover:text-primary">
                        Naik
                      </button>
                      <button onClick={() => moveItem(item.id, 1)} className="text-sm text-muted hover:text-primary">
                        Turun
                      </button>
                      <button
                        onClick={() => removeMenuItem(item.id)}
                        className="text-sm text-red-600 hover:underline"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Nama</label>
                      <input
                        className="field"
                        value={item.name}
                        onChange={(e) => updateMenuItem(item.id, { name: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Harga</label>
                      <input
                        className="field"
                        value={item.price}
                        onChange={(e) => updateMenuItem(item.id, { price: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Badge</label>
                      <input
                        className="field"
                        value={item.badge}
                        onChange={(e) => updateMenuItem(item.id, { badge: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Path Gambar</label>
                      <input
                        className="field"
                        value={item.image}
                        onChange={(e) => updateMenuItem(item.id, { image: e.target.value })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="label">Deskripsi</label>
                      <textarea
                        className="field min-h-[80px]"
                        value={item.description}
                        onChange={(e) => updateMenuItem(item.id, { description: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="label">Info Gizi</label>
                      <input
                        className="field"
                        value={item.nutrition}
                        onChange={(e) => updateMenuItem(item.id, { nutrition: e.target.value })}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 text-sm font-semibold text-primary">
                        <input
                          type="checkbox"
                          checked={item.featured}
                          onChange={(e) => updateMenuItem(item.id, { featured: e.target.checked })}
                        />
                        Jadikan produk unggulan
                      </label>
                    </div>
                  </div>
                </section>
              ))}
          </div>
        )}

        {tab === "media" && <MediaPanel />}

        <div className="sticky bottom-0 mt-8 py-4 bg-surface-container/90 backdrop-blur border-t border-surface-border flex items-center gap-4">
          <button onClick={save} disabled={status.kind === "saving"} className="btn-primary font-semibold disabled:opacity-60">
            {status.kind === "saving" ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
          {status.kind === "ok" && <span className="text-sm text-secondary">{status.msg}</span>}
          {status.kind === "err" && <span className="text-sm text-red-600">{status.msg}</span>}
        </div>
      </div>
    </main>
  );
}

function MediaPanel() {
  const [files, setFiles] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin/upload")
      .then((r) => r.json())
      .then((d) => {
        if (d?.ok && Array.isArray(d.images)) setFiles(d.images);
      })
      .catch(() => {});
  }, []);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("");
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const dataUrl = String(reader.result);
        const res = await fetch("/api/admin/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: file.name, dataUrl }),
        });
        const data = (await res.json()) as { ok: boolean; url?: string; why?: string };
        if (data.ok && data.url) {
          setFiles((f) => [data.url as string, ...f]);
          setMsg(`Terupload: ${data.url}`);
        } else {
          setMsg(`Gagal: ${data.why ?? "unknown"}`);
        }
      } catch {
        setMsg("Gagal mengunggah.");
      } finally {
        setBusy(false);
      }
    };
    reader.readAsDataURL(file);
  }

  return (
    <section className="bg-white border border-card-border rounded-xl p-5">
      <h2 className="font-semibold text-primary mb-1">Upload Gambar</h2>
      <p className="text-sm text-muted mb-4">
        Format PNG/JPG, maks 5MB. File masuk ke folder images. Salin path-nya ke kolom gambar produk.
      </p>
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={onPick}
        disabled={busy}
        className="block w-full text-sm"
      />
      {busy && <p className="text-sm text-muted mt-3">Mengunggah...</p>}
      {msg && <p className="text-sm text-secondary mt-3 break-all">{msg}</p>}
      {files.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {files.map((url) => (
            <figure key={url} className="border border-card-border rounded-lg overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={url} className="w-full h-24 object-cover bg-surface-container" />
              <figcaption className="text-[10px] p-1.5 text-muted break-all">{url}</figcaption>
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}
