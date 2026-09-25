import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";

import "./globals.css";

import { CatalogProvider } from "@/components/public/CategoryProvider";
import { JsonLd } from "@/components/ui/JsonLd";
import { TransactionProvider } from "@/providers/TransactionProvider";
import { getCachedCatalog } from "@/lib/store/cache";
import { getCachedPaymentMethods } from "@/lib/store/cache";
import { site } from "@/data/site";

/* Font lokal dari public/fonts — tanpa request ke Google Fonts. */
const fredoka = localFont({
  src: [
    { path: "../public/fonts/fredoka-wdth-wght--light.ttf", weight: "300", style: "normal" },
    { path: "../public/fonts/fredoka-wdth-wght--regular.ttf", weight: "400", style: "normal" },
    { path: "../public/fonts/fredoka-wdth-wght--medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/fredoka-wdth-wght--semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/fredoka-wdth-wght--bold.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-fredoka",
  display: "swap",
});

const baloo = localFont({
  src: [
    { path: "../public/fonts/baloo2-wght--medium.ttf", weight: "500", style: "normal" },
    { path: "../public/fonts/baloo2-wght--semibold.ttf", weight: "600", style: "normal" },
    { path: "../public/fonts/baloo2-wght--bold.ttf", weight: "700", style: "normal" },
    { path: "../public/fonts/baloo2-wght--extrabold.ttf", weight: "800", style: "normal" },
  ],
  variable: "--font-baloo",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  applicationName: site.name,
  keywords: [
    "PPOB online",
    "jual pulsa online",
    "token listrik PLN",
    "bayar BPJS online",
    "paket data murah",
    "top up e-wallet",
    "bayar tagihan QRIS",
    "tanpa daftar akun",
  ],
  authors: [{ name: site.name, url: site.url }],
  creator: site.name,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: `${site.name} — ${site.tagline}`,
    description:
      "Bayar tagihan & isi ulang digital tanpa ribet. Guest checkout, bayar QRIS, langsung masuk.",
  },
  twitter: {
    card: "summary_large_image",
    title: `${site.name} — ${site.tagline}`,
    description:
      "Bayar tagihan & isi ulang digital tanpa ribet. Guest checkout, bayar QRIS, langsung masuk.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  category: "finance",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FFF6EC",
};

/** Structured data global: organisasi + situs. */
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      description: site.description,
      logo: `${site.url}/icon.svg`,
      areaServed: "ID",
      contactPoint: [
        {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone: site.contact.phoneDisplay,
          email: site.contact.email,
          availableLanguage: ["id"],
        },
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${site.url}/#website`,
      url: site.url,
      name: site.name,
      inLanguage: "id-ID",
      description: site.description,
      publisher: { "@id": `${site.url}/#organization` },
    },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  // Katalog & metode pembayaran dibaca server lalu diberikan ke komponen klien.
  // Cache ber-tag: dashboard memanggil updateTag() saat ada perubahan.
  const [catalog, payments] = await Promise.all([getCachedCatalog(), getCachedPaymentMethods()]);
  const categories = catalog.categories;
  const paymentMethods = payments.methods;

  return (
    <html lang="id" className={`${fredoka.variable} ${baloo.variable}`}>
      <body>
        <JsonLd data={structuredData} />
        <CatalogProvider categories={categories} paymentMethods={paymentMethods}>
          <TransactionProvider>{children}</TransactionProvider>
        </CatalogProvider>
      </body>
    </html>
  );
}
