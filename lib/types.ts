export interface Advantage {
  icon: string;
  title: string;
  desc: string;
}

export interface SiteSettings {
  brand: string;
  slogan: string;
  heroSub: string;
  heroImage: string;
  heroImageAlt: string;
  heroBadge: string;
  waLink: string;
  phoneDisplay: string;
  instagramUrl: string;
  instagramHandle: string;
  instagramBlurb: string;
  email: string;
  address: string;
  mapsEmbed: string;
  footerText: string;
  aboutTitle: string;
  aboutBody: string;
  advantages: Advantage[];
  steps: string[];
}

export interface MenuItem {
  id: string;
  name: string;
  badge: string;
  description: string;
  nutrition: string;
  price: string;
  image: string;
  imageAlt: string;
  featured: boolean;
  order: number;
}

export interface Content {
  site: SiteSettings;
  menu: MenuItem[];
}
