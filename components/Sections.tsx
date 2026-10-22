import type { MenuItem, SiteSettings } from "@/lib/types";

export function MenuSection({ menu }: { menu: MenuItem[] }) {
  const featured = menu.find((m) => m.featured) ?? menu[0];
  const others = menu.filter((m) => m !== featured);

  return (
    <section id="menu" className="w-full py-16 lg:py-24 bg-surface-container">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="block text-secondary text-xs font-bold uppercase tracking-widest mb-2">
            Menu &amp; Harga
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary">Menu Kami</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featured && (
            <article className="lg:col-span-2 bg-white border border-card-border rounded-xl p-6 shadow-lift">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                {featured.image && (
                  <div className="rounded-lg overflow-hidden bg-surface-container h-56">
                    <img
                      src={featured.image}
                      alt={featured.imageAlt || featured.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div>
                  {featured.badge && (
                    <span className="inline-block px-2.5 py-1 rounded-full bg-secondary text-white text-xs font-bold mb-3">
                      {featured.badge}
                    </span>
                  )}
                  <h3 className="text-xl font-semibold text-primary mb-2">{featured.name}</h3>
                  <p className="text-sm text-muted mb-4">{featured.description}</p>
                  {featured.nutrition && (
                    <p className="text-sm text-secondary font-semibold mb-4">{featured.nutrition}</p>
                  )}
                  <p className="text-2xl font-bold text-primary">{featured.price}</p>
                </div>
              </div>
            </article>
          )}
          {others.map((item) => (
            <article
              key={item.id}
              className="bg-surface-container rounded-xl border border-surface-border p-6 flex flex-col justify-between"
            >
              <div>
                {item.badge && (
                  <span className="inline-block px-2.5 py-1 rounded-full bg-white text-muted text-xs font-semibold mb-3">
                    {item.badge}
                  </span>
                )}
                <h3 className="font-semibold text-primary mb-2">{item.name}</h3>
                <p className="text-sm text-muted">{item.description}</p>
              </div>
              <span className="mt-4 text-sm font-semibold text-muted">{item.price}</span>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HowToOrder({ site }: { site: SiteSettings }) {
  const stepBg = ["bg-badge-green-bg text-secondary", "bg-badge-cacao-bg text-primary", "bg-badge-citrus-bg text-badge-citrus-text"];

  return (
    <section id="cara-pesan" className="w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="block text-secondary text-xs font-bold uppercase tracking-widest mb-2">
            Sistem PO H-1
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary">Cara Pesan</h2>
          <p className="text-muted mt-3">Pre-Order H-1. Pesan hari ini, nikmati kesegarannya besok!</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {site.steps?.map((step, i) => (
            <div key={step} className="bg-white border border-card-border rounded-xl p-8 text-center">
              <span
                className={`inline-flex w-14 h-14 rounded-full items-center justify-center font-headline text-xl font-bold mb-4 ${stepBg[i % 3]}`}
              >
                {i + 1}
              </span>
              <h3 className="font-semibold text-primary">{step}</h3>
            </div>
          ))}
        </div>
        <div className="text-center">
          <a
            href={site.waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary inline-flex items-center justify-center font-semibold px-8 py-4 text-lg"
          >
            Pesan via WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}

export function InstagramSection({ site }: { site: SiteSettings }) {
  return (
    <section id="instagram" className="w-full py-16 lg:py-24 bg-surface-container">
      <div className="max-w-7xl mx-auto px-5 md:px-8 text-center">
        <span className="block text-secondary text-xs font-bold uppercase tracking-widest mb-2">Instagram</span>
        <h2 className="text-3xl lg:text-4xl font-semibold text-primary mb-4">Ikuti Kami</h2>
        <p className="text-muted max-w-xl mx-auto mb-8">{site.instagramBlurb}</p>
        <a
          href={site.instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary inline-flex items-center justify-center font-semibold"
        >
          Follow di Instagram
        </a>
      </div>
    </section>
  );
}

export function ContactSection({ site }: { site: SiteSettings }) {
  return (
    <section id="kontak-lokasi" className="w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          <div>
            <span className="block text-secondary text-xs font-bold uppercase tracking-widest mb-2">
              Kontak &amp; Lokasi
            </span>
            <h2 className="text-3xl lg:text-4xl font-semibold text-primary mb-6">Temukan Kami</h2>
            <ul className="space-y-4 mb-8">
              <li className="bg-white border border-card-border rounded-lg p-4">
                <p className="font-semibold text-primary">Alamat</p>
                <p className="text-sm text-muted">{site.address}</p>
              </li>
              <li className="bg-white border border-card-border rounded-lg p-4">
                <p className="font-semibold text-primary">Email</p>
                <a href={`mailto:${site.email}`} className="text-sm text-secondary hover:underline break-all">
                  {site.email}
                </a>
              </li>
              <li className="bg-white border border-card-border rounded-lg p-4">
                <p className="font-semibold text-primary">WhatsApp</p>
                <a
                  href={site.waLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary hover:underline"
                >
                  {site.phoneDisplay}
                </a>
              </li>
              <li className="bg-white border border-card-border rounded-lg p-4">
                <p className="font-semibold text-primary">Instagram</p>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-secondary hover:underline"
                >
                  {site.instagramHandle}
                </a>
              </li>
            </ul>
          </div>
          <div className="bg-white border border-card-border rounded-xl p-4 shadow-lift">
            <iframe
              title={`Lokasi ${site.brand}`}
              className="w-full h-80 rounded-lg bg-surface-container"
              src={site.mapsEmbed}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export function Footer({ site }: { site: SiteSettings }) {
  return (
    <footer className="w-full bg-surface-container border-t border-surface-border py-8 text-center">
      <p className="text-sm text-muted">{site.footerText}</p>
    </footer>
  );
}
