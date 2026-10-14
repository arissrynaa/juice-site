# Fruits Juice R&F — Astro + Decap CMS

Landing page satu halaman, dibangun ulang dari `landing_page_fruits_juice_r_f/index.html` (versi statis murni) ke Astro, dengan Decap CMS sebagai editor konten.

## Struktur

- `src/content/settings/site.json` — semua teks/kontak/keunggulan (edit via CMS "Pengaturan Situs")
- `src/content/menu/*.json` — item menu produk (edit via CMS "Menu Produk")
- `src/pages/index.astro` — satu-satunya halaman; membaca JSON di atas
- `src/styles/global.css` — design tokens DESIGN.md via Tailwind v4 `@theme`
- `public/admin/` — Decap CMS (`/admin`)

## Develop lokal

```bash
npm install
npm run dev            # website di http://localhost:4321
npx decap-server       # di terminal terpisah — backend CMS lokal, /admin bisa login tanpa GitHub
```

## Deploy (gratis — Cloudflare Pages / Netlify)

1. Push repo ini ke GitHub.
2. Ganti `repo: OWNER/REPO` di `public/admin/config.yml` dengan repo asli, dan isi `site_url`.
3. Buat OAuth app GitHub (homepage = URL situs, callback = `https://<situs>/callback`) lalu deploy OAuth client kecil — opsi termudah: **Netlify Identity** (aktifkan di site settings, gratis) atau self-host pakai `decapbridge`/Cloudflare Worker.
4. Hubungkan repo ke Cloudflare Pages (build: `npm run build`, output: `dist`).
5. Olivia edit konten di `https://<situs>/admin` — perubahan tersimpan sebagai commit ke repo, situs otomatis rebuild.

## Catatan konten

- Harga masih placeholder `Rp —` (isi dari CMS, field "Harga").
- Map sudah terisi embed SMKN 1 Setu (dari link goo.gl Olivia), bisa diganti dari CMS.
