import type { SiteSettings } from "@/lib/types";

const NAV = [
  ["Tentang Kami", "#about"],
  ["Menu & Harga", "#menu"],
  ["Cara Pesan", "#cara-pesan"],
  ["Instagram", "#instagram"],
  ["Kontak & Lokasi", "#kontak-lokasi"],
] as const;

export function Header({ site }: { site: SiteSettings }) {
  return (
    <header className="hidden md:block fixed top-0 inset-x-0 z-40 bg-surface/85 backdrop-blur border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-8 flex items-center justify-between h-16">
        <a href="#hero" className="font-headline font-bold text-primary text-lg tracking-tight">
          {site.brand?.toUpperCase()}
        </a>
        <nav className="flex items-center gap-6 text-sm font-semibold text-muted">
          {NAV.map(([label, href]) => (
            <a key={href} href={href} className="hover:text-primary transition-colors">
              {label}
            </a>
          ))}
        </nav>
        <a href={site.waLink} target="_blank" rel="noopener noreferrer" className="btn-primary text-sm font-semibold">
          Pesan via WhatsApp
        </a>
      </div>
    </header>
  );
}

export function MobileHeader({ site }: { site: SiteSettings }) {
  return (
    <header className="md:hidden fixed top-0 inset-x-0 z-40 bg-surface/90 backdrop-blur border-b border-surface-border">
      <div className="px-5 h-14 flex items-center justify-between">
        <a href="#hero" className="font-headline font-bold text-primary text-base tracking-tight">
          {site.brand?.toUpperCase()}
        </a>
        <a
          href={site.waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary text-xs font-semibold px-3 py-2"
        >
          Pesan
        </a>
      </div>
    </header>
  );
}
