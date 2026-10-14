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
npm run build
node scripts/admin-auth.mjs   # serve dist + form login + admin editor di port 3000
```

- Situs: `http://localhost:3000/`
- Admin: `http://localhost:3000/admin` → form login (password ter-hash di `.admin-pass`).
  Ganti password: `node scripts/admin-auth.mjs hash <password-baru>`
- Admin editor = halaman custom (`scripts/admin.html`), TANPA Decap/GitHub: 2 tab
  (Pengaturan Situs & Menu Produk), tombol Simpan langsung menulis ke
  `src/content/settings/site.json` / `src/content/menu/*.json`.
- Setelah edit, jalankan `npm run build` agar tampilan publik ikut ter-update.
- Keamanan admin sudah dites (login salah, cookie palsu, brute-force → 429).

## Deploy (gratis — Cloudflare Pages / Netlify)

1. Push repo ini ke GitHub.
2. Ganti `repo: OWNER/REPO` di `public/admin/config.yml` dengan repo asli, dan isi `site_url`.
3. Buat OAuth app GitHub (homepage = URL situs, callback = `https://<situs>/callback`) lalu deploy OAuth client kecil — opsi termudah: **Netlify Identity** (aktifkan di site settings, gratis) atau self-host pakai `decapbridge`/Cloudflare Worker.
4. Hubungkan repo ke Cloudflare Pages (build: `npm run build`, output: `dist`).
5. Olivia edit konten di `https://<situs>/admin` — perubahan tersimpan sebagai commit ke repo, situs otomatis rebuild.

## Catatan konten

- Harga masih placeholder `Rp —` (isi dari CMS, field "Harga").
- Map sudah terisi embed SMKN 1 Setu (dari link goo.gl Olivia), bisa diganti dari CMS.
