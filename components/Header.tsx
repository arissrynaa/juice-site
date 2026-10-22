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
    <div className="hidden md:block fixed top-0 inset-x-0 z-40 px-5 pt-4 pointer-events-none">
      <header className="pointer-events-auto max-w-6xl mx-auto bg-surface/80 backdrop-blur-xl backdrop-saturate-150 border border-card-border/90 rounded-full shadow-[0_6px_24px_-8px_rgba(120,53,15,0.18),0_2px_8px_-4px_rgba(120,53,15,0.10)]">
        <div className="px-3 pl-6 flex items-center justify-between h-14 gap-6">
          <a href="#hero" className="font-headline font-bold text-primary text-lg tracking-tight shrink-0">
            {site.brand?.toUpperCase()}
          </a>
          <nav className="hidden md:flex items-center gap-0.5 text-[13px] font-semibold text-muted">
            {NAV.map(([label, href]) => (
              <a
                key={href}
                href={href}
                className="px-2.5 py-1.5 rounded-full hover:text-primary hover:bg-surface-container transition-colors"
              >
                {label}
              </a>
            ))}
          </nav>
          <a
            href={site.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-sm font-semibold shrink-0 !py-2 !px-4 !rounded-full"
          >
            Pesan via WhatsApp
          </a>
        </div>
      </header>
    </div>
  );
}

export function MobileHeader({ site }: { site: SiteSettings }) {
  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-40 px-3 pt-3 pointer-events-none">
      <header className="pointer-events-auto bg-surface/85 backdrop-blur-xl border border-card-border/90 rounded-full shadow-[0_4px_18px_-6px_rgba(120,53,15,0.20)]">
        <div className="pl-4 pr-1.5 h-12 flex items-center justify-between gap-3">
          <a href="#hero" className="font-headline font-bold text-primary text-[15px] tracking-tight truncate">
            {site.brand?.toUpperCase()}
          </a>
          <a
            href={site.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-xs font-semibold !py-1.5 !px-3.5 !rounded-full shrink-0"
          >
            Pesan
          </a>
        </div>
      </header>
    </div>
  );
}
