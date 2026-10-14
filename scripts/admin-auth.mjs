// Auth proxy sederhana untuk /admin (Decap CMS) — form login, tanpa GitHub.
// Password diambil dari file .admin-pass (format: scrypt:salt:hash). Generate dengan:
//   node scripts/admin-auth.js hash <password-anda>
// Jalankan: node scripts/admin-auth.js   (serve dist + gate /admin di port 3000)
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const PORT = 3000;
const SECRET = process.env.ADMIN_SECRET || crypto.randomBytes(32).toString('hex');
const PASS_FILE = path.join(ROOT, '.admin-pass');
const SESSION_TTL = 8 * 60 * 60 * 1000; // 8 jam

// --- password helpers ---
function hashPassword(pw) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(pw, salt, 64).toString('hex');
  return `scrypt:${salt}:${hash}`;
}
// mode hash: tulis/overwrite .admin-pass lalu keluar, tanpa start server
if (process.argv[2] === 'hash') {
  const pw = process.argv[3];
  if (!pw) { console.error('Usage: node scripts/admin-auth.mjs hash <password>'); process.exit(1); }
  fs.writeFileSync(PASS_FILE, hashPassword(pw), { mode: 0o600 });
  console.log('Password tersimpan (hash) di .admin-pass');
  process.exit(0);
}
function verifyPassword(pw, stored) {
  const [scheme, salt, hash] = String(stored || '').split(':');
  if (scheme !== 'scrypt' || !salt || !hash) return false;
  const check = crypto.scryptSync(pw, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return check.length === expected.length && crypto.timingSafeEqual(check, expected);
}
if (!fs.existsSync(PASS_FILE)) {
  const gen = crypto.randomBytes(6).toString('hex');
  fs.writeFileSync(PASS_FILE, hashPassword(gen), { mode: 0o600 });
  console.log(`Password admin baru: ${gen} (tersimpan ter-hash di .admin-pass)`);
}
const STORED = fs.readFileSync(PASS_FILE, 'utf8').trim();

// --- session token: base64url(payload).hmac ---
function sign(payload) {
  const mac = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${mac}`;
}
function verifyToken(token) {
  if (typeof token !== 'string') return false;
  const idx = token.lastIndexOf('.');
  if (idx < 0) return false;
  const payload = token.slice(0, idx);
  const mac = token.slice(idx + 1);
  const expected = crypto.createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(mac), b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return false;
  const [exp, nonce] = payload.split(':');
  return Number(exp) > Date.now();
}
function parseCookies(req) {
  const out = {};
  (req.headers.cookie || '').split(';').forEach((p) => {
    const i = p.indexOf('=');
    if (i > 0) out[p.slice(0, i).trim()] = decodeURIComponent(p.slice(i + 1).trim());
  });
  return out;
}
function handleBody(req, res, fn, limit = 512 * 1024) {
  let body = '';
  req.on('data', (c) => { body += c; if (body.length > limit) req.destroy(); });
  req.on('end', () => {
    try { fn(JSON.parse(body || '{}')); }
    catch (e) { res.writeHead(400); res.end('JSON tidak valid'); }
  });
}

// --- rate limiting (per IP, sliding window) ---
const attempts = new Map(); // ip -> {count, windowStart, blockedUntil}
const MAX_ATTEMPTS = 5;
const WINDOW = 10 * 60 * 1000;        // 10 menit
const BLOCK = 15 * 60 * 1000;         // blokir 15 menit setelah 5 gagal
function checkRate(ip) {
  const s = attempts.get(ip) || { count: 0, windowStart: Date.now(), blockedUntil: 0 };
  attempts.set(ip, s);
  if (s.blockedUntil > Date.now()) return { ok: false, retryIn: Math.ceil((s.blockedUntil - Date.now()) / 1000) };
  if (Date.now() - s.windowStart > WINDOW) { s.count = 0; s.windowStart = Date.now(); }
  return { ok: true, state: s };
}
function recordFail(ip) {
  const s = attempts.get(ip);
  if (!s) return;
  s.count += 1;
  if (s.count >= MAX_ATTEMPTS) s.blockedUntil = Date.now() + BLOCK;
  attempts.set(ip, s);
}

// --- static file serving ---
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.yml': 'text/yaml', '.json': 'application/json', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
function serveFile(res, filePath, status = 200) {
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404, { 'Content-Type': 'text/plain' }); return res.end('Not Found'); }
    res.writeHead(status, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown').split(',')[0].trim();

  // ---- POST /admin/login ----
  if (url.pathname === '/admin/login' && req.method === 'POST') {
    const rate = checkRate(ip);
    if (!rate.ok) {
      res.writeHead(429, { 'Content-Type': 'text/html; charset=utf-8', 'Retry-After': rate.retryIn });
      return res.end(`Terlalu banyak percobaan. Coba lagi dalam ${Math.ceil(rate.retryIn / 60)} menit.`);
    }
    let body = '';
    req.on('data', (c) => { body += c; if (body.length > 4096) req.destroy(); });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const pw = params.get('password') || '';
      if (verifyPassword(pw, STORED)) {
        attempts.delete(ip);
        const payload = `${Date.now() + SESSION_TTL}:${crypto.randomUUID()}`;
        res.setHeader('Set-Cookie', `admin_session=${encodeURIComponent(sign(payload))}; HttpOnly; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL / 1000}`);
        res.writeHead(302, { Location: '/admin/' });
        return res.end();
      }
      recordFail(ip);
      res.writeHead(401, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(loginPage('Password salah.'));
    });
    return;
  }

  // ---- proxy ke decap-server (backend CMS lokal), di balik auth ----
  if (url.pathname.startsWith('/api/v1')) {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(302, { Location: '/admin/login' }); return res.end(); }
    const proxy = http.request(
      { host: '127.0.0.1', port: 8081, path: req.url, method: req.method, headers: { ...req.headers, host: '127.0.0.1:8081' } },
      (pres) => { res.writeHead(pres.statusCode, pres.headers); pres.pipe(res); }
    );
    proxy.on('error', () => { res.writeHead(502); res.end('decap-server tidak jalan — jalankan: npx decap-server'); });
    req.pipe(proxy);
    return;
  }

  // ---- Admin editor (custom, tanpa Decap) ----
  if (url.pathname === '/admin/logout') {
    res.setHeader('Set-Cookie', 'admin_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0');
    res.writeHead(302, { Location: '/admin/login' });
    return res.end();
  }
  if (url.pathname === '/admin' || url.pathname === '/admin/' || url.pathname === '/admin/index.html') {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(302, { Location: '/admin/login' }); return res.end(); }
    return serveFile(res, path.join(ROOT, 'scripts', 'admin.html'));
  }
  if (url.pathname === '/admin/api/content') {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(401); return res.end('unauthorized'); }
    const menuDir = path.join(ROOT, 'src/content/menu');
    const menu = {};
    for (const f of fs.readdirSync(menuDir).filter(f => f.endsWith('.json'))) {
      menu[f.replace(/\.json$/, '')] = JSON.parse(fs.readFileSync(path.join(menuDir, f), 'utf8'));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ site: JSON.parse(fs.readFileSync(path.join(ROOT, 'src/content/settings/site.json'), 'utf8')), menu }));
  }
  if (url.pathname === '/admin/api/save' && req.method === 'POST') {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(401); return res.end('unauthorized'); }
    return handleBody(req, res, ({ file, data }) => {
      const m = /^(settings\/site|menu\/[a-z0-9-]+)$/.exec(file);
      if (!m) { res.writeHead(400); return res.end('path tidak valid'); }
      const dest = path.join(ROOT, 'src/content', file + '.json');
      JSON.parse(JSON.stringify(data)); // validasi: harus JSON murni
      fs.writeFileSync(dest, JSON.stringify(data, null, 2) + '\n');
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  }
  if (url.pathname === '/admin/api/delete' && req.method === 'POST') {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(401); return res.end('unauthorized'); }
    return handleBody(req, res, ({ file }) => {
      const m = /^menu\/[a-z0-9-]+$/.exec(file);
      if (!m) { res.writeHead(400); return res.end('hanya item menu yang bisa dihapus'); }
      const dest = path.join(ROOT, 'src/content', file + '.json');
      if (fs.existsSync(dest)) fs.unlinkSync(dest);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true }));
    });
  }

  if (url.pathname === '/admin/api/upload' && req.method === 'POST') {
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) { res.writeHead(401); return res.end('unauthorized'); }
    const name = (url.searchParams.get('name') || '').toLowerCase();
    if (!/^[a-z0-9][a-z0-9._-]{0,80}\.(png|jpe?g|webp|gif|svg)$/.test(name)) {
      res.writeHead(400); return res.end('nama file tidak valid (huruf kecil/angka, ekstensi png/jpg/webp/gif/svg)');
    }
    const chunks = [];
    let size = 0, tooBig = false;
    req.on('data', (c) => { size += c.length; if (size > 5 * 1024 * 1024) { tooBig = true; req.destroy(); } else chunks.push(c); });
    req.on('end', () => {
      if (tooBig) return;
      const dest = path.join(ROOT, 'public/images', name);
      fs.writeFileSync(dest, Buffer.concat(chunks));
      // dist/ ikut diisi supaya tidak wajib rebuild untuk preview
      fs.copyFileSync(dest, path.join(DIST, 'images', name));
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, path: '/images/' + name }));
    });
    return;
  }

  // ---- gate semua /admin kecuali halaman login itu sendiri ----
  if (url.pathname.startsWith('/admin')) {
    if (url.pathname === '/admin/login' && req.method === 'GET') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(loginPage());
    }
    const sess = parseCookies(req).admin_session;
    if (!verifyToken(sess)) {
      res.writeHead(302, { Location: '/admin/login' });
      return res.end();
    }
    // lolos auth → serve file admin statis (fallback; editor utama ditangani route di atas)
    const rel = url.pathname === '/admin' || url.pathname === '/admin/' ? '/admin/index.html' : url.pathname;
    return serveFile(res, path.join(DIST, rel));
  }

  // ---- sisanya: static dist biasa ----
  const rel = url.pathname === '/' ? '/index.html' : url.pathname;
  const target = path.normalize(path.join(DIST, rel));
  if (!target.startsWith(DIST)) { res.writeHead(403); return res.end('Forbidden'); }
  return serveFile(res, target);
});

function loginPage(error) {
  return `<!DOCTYPE html><html lang="id"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>Login Admin — Fruits Juice R&F</title><style>body{font-family:system-ui,sans-serif;background:#FFFDF7;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0}form{background:#fff;border:1px solid #F0E8DC;border-radius:12px;padding:2rem;box-shadow:0 8px 24px -4px rgba(120,53,15,.08);width:min(360px,90vw)}h1{color:#78350F;font-size:1.2rem;margin:0 0 1rem}label{display:block;font-size:.85rem;color:#7C6F64;margin-bottom:.35rem}input{width:100%;box-sizing:border-box;padding:.7rem;border:1.5px solid #D8CFC4;border-radius:.5rem;font-size:1rem;margin-bottom:1rem}button{width:100%;padding:.8rem;background:#78350F;color:#FFFDF7;border:0;border-radius:.5rem;font-size:1rem;font-weight:600;cursor:pointer}button:hover{background:#5C280B}.err{color:#ba1a1a;font-size:.85rem;margin-bottom:.8rem}</style></head><body><form method="POST" action="/admin/login"><h1>Admin — Fruits Juice R&F</h1>${error ? `<p class="err">${error}</p>` : ''}<label for="password">Password</label><input id="password" name="password" type="password" autofocus autocomplete="current-password"/><button type="submit">Masuk</button></form></body></html>`;
}

server.listen(PORT, () => console.log(`Server + auth jalan di http://localhost:${PORT} (admin: /admin)`));
