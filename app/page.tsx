import { getContent } from "@/lib/content-local";
import { Header, MobileHeader } from "@/components/Header";
import { About, Hero } from "@/components/Hero";
import { ContactSection, Footer, HowToOrder, InstagramSection, MenuSection } from "@/components/Sections";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { site, menu } = await getContent();
  const featured = menu.find((m) => m.featured) ?? menu[0];

  return (
    <>
      <Header site={site} />
      <MobileHeader site={site} />
      <main>
        <Hero site={site} featured={featured} />
        <About site={site} />
        <MenuSection menu={menu} />
        <HowToOrder site={site} />
        <InstagramSection site={site} />
        <ContactSection site={site} />
      </main>
      <Footer site={site} />
    </>
  );
}
