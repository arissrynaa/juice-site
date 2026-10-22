import type { Metadata } from "next";
import { getContent } from "@/lib/store";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const { site } = await getContent();
  return {
    title: `${site.brand ?? "Fruits Juice R&F"} — Segar, Sehat, Mengenyangkan`,
    description: site.heroSub ?? "Minuman alpukat segar pilihan.",
    openGraph: {
      title: site.brand ?? "Fruits Juice R&F",
      description: site.heroSub ?? "",
      images: site.heroImage ? [site.heroImage] : [],
      type: "website",
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Epilogue:wght@400;600;700;800&family=Manrope:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
