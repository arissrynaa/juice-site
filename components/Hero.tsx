import type { MenuItem, SiteSettings } from "@/lib/types";

export function Hero({ site, featured }: { site: SiteSettings; featured?: MenuItem }) {
  return (
    <section id="hero" className="w-full bg-gradient-to-b from-surface to-surface-container pt-24 md:pt-32 pb-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7">
          {site.heroBadge && (
            <span className="inline-block px-3 py-1 rounded-full bg-badge-green-bg text-secondary text-xs font-bold tracking-wide mb-6">
              {site.heroBadge}
            </span>
          )}
          <h1 className="text-4xl lg:text-5xl font-bold text-primary leading-tight tracking-tight mb-4">
            {site.slogan}
          </h1>
          <p className="text-base lg:text-lg text-muted max-w-xl mb-8">{site.heroSub}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a
              href={site.waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary font-semibold text-center"
            >
              Pesan Sekarang
            </a>
            <a
              href="#menu"
              className="inline-flex items-center justify-center px-6 py-3 rounded-lg border-[1.5px] border-primary text-primary font-semibold text-center hover:bg-primary/5 transition-colors"
            >
              Lihat Menu
            </a>
          </div>
        </div>
        <div className="lg:col-span-5">
          <div className="bg-white rounded-xl p-4 shadow-lift border border-card-border">
            {site.heroImage && (
              <img
                src={site.heroImage}
                alt={site.heroImageAlt}
                className="w-full h-72 md:h-80 object-cover rounded-lg bg-surface-container"
              />
            )}
            {featured && (
              <div className="flex items-center justify-between pt-4 px-1">
                <div>
                  <p className="font-headline font-semibold text-primary">{featured.name}</p>
                  {featured.nutrition && <p className="text-sm text-muted">{featured.nutrition}</p>}
                </div>
                {featured.badge && (
                  <span className="px-2.5 py-1 rounded-full bg-badge-cacao-bg text-primary text-xs font-bold">
                    {featured.badge}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function About({ site }: { site: SiteSettings }) {
  const iconBg: Record<string, string> = {
    nutrition: "bg-badge-green-bg text-secondary",
    eco: "bg-badge-green-bg text-secondary",
    icecream: "bg-badge-cacao-bg text-primary",
    local_drink: "bg-badge-citrus-bg text-badge-citrus-text",
  };

  return (
    <section id="about" className="w-full py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-5 md:px-8">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <span className="block text-secondary text-xs font-bold uppercase tracking-widest mb-2">
            Tentang Kami
          </span>
          <h2 className="text-3xl lg:text-4xl font-semibold text-primary mb-4">{site.aboutTitle}</h2>
          <p className="text-muted">{site.aboutBody}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {site.advantages?.map((adv) => (
            <div key={adv.title} className="bg-white border border-card-border rounded-xl p-6">
              <span
                className={`inline-flex w-10 h-10 rounded-full items-center justify-center mb-4 ${iconBg[adv.icon] ?? iconBg.nutrition}`}
              >
                <AdvantageIcon name={adv.icon} />
              </span>
              <h3 className="font-semibold text-primary mb-2">{adv.title}</h3>
              <p className="text-sm text-muted">{adv.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdvantageIcon({ name }: { name: string }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8 };
  if (name === "eco") {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22c5-2 8-6 8-11V4h-6c-4 0-7 3-7 8 0 4 2 8 5 10Z" />
        <path d="M9 12c2-3 5-4 8-4" />
      </svg>
    );
  }
  if (name === "icecream") {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 21h8l-4-9-4 9Z" />
        <path d="M12 12a4 4 0 0 0 4-4 4 4 0 0 0-8 0 4 4 0 0 0 4 4Z" />
      </svg>
    );
  }
  if (name === "local_drink") {
    return (
      <svg {...common} strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 8h12l-1 12H7L6 8Z" />
        <path d="M7 8V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v2" />
        <path d="M6 13h12" />
      </svg>
    );
  }
  return (
    <svg {...common} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 21c-4 0-7-3-7-7 0-4 4-10 7-12 3 2 7 8 7 12 0 4-3 7-7 7Z" />
      <path d="M12 21V9" />
    </svg>
  );
}
