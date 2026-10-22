"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/admin/content")
      .then((r) => {
        if (r.ok) router.replace("/admin");
      })
      .catch(() => {});
  }, [router]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = (await res.json()) as { ok: boolean; why?: string };
      if (data.ok) {
        router.replace("/admin");
        router.refresh();
      } else {
        setError(
          data.why === "ADMIN_PASSWORD_NOT_SET"
            ? "Server belum punya ADMIN_PASSWORD. Set di environment Vercel."
            : "Password salah.",
        );
      }
    } catch {
      setError("Gagal menghubungi server.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-surface-container px-5">
      <form onSubmit={onSubmit} className="w-full max-w-sm bg-white border border-card-border rounded-xl p-8 shadow-lift">
        <h1 className="font-headline font-bold text-primary text-xl mb-1">Admin Dashboard</h1>
        <p className="text-sm text-muted mb-6">Masuk untuk mengelola konten situs.</p>
        {error && <p className="text-sm text-red-600 mb-4">{error}</p>}
        <label className="label" htmlFor="pw">
          Password
        </label>
        <input
          id="pw"
          type="password"
          className="field mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          required
        />
        <button type="submit" disabled={busy} className="btn-primary w-full font-semibold disabled:opacity-60">
          {busy ? "Memeriksa..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
