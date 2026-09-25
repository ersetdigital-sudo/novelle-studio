import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { site } from "@/data/site";
import { getCategoryBySlug } from "@/lib/store/catalog";
import { breadcrumbSchema } from "@/lib/seo";
import { ProductPicker } from "@/components/transaction/ProductPicker";
import { JsonLd } from "@/components/ui/JsonLd";

interface PageProps {
  params: Promise<{ kategori: string }>;
}

/** Semua kategori di-prerender saat build. */
export async function generateStaticParams() {
  const { categorySlugs } = await import("@/lib/catalog");
  return categorySlugs.map((kategori) => ({ kategori }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { kategori } = await params;
  const category = await getCategoryBySlug(kategori);

  if (!category) {
    return { title: "Kategori tidak ditemukan" };
  }

  const title = `Isi & Bayar ${category.name} — QRIS Tanpa Daftar`;
  const description = `${category.short}. ${category.field.hint} Bayar pakai QRIS di ${site.name}, tanpa daftar akun.`;

  return {
    title,
    description,
    alternates: { canonical: `/produk/${category.slug}` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `${site.url}/produk/${category.slug}`,
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { kategori } = await params;
  const category = await getCategoryBySlug(kategori);

  // Kategori yang disembunyikan admin tidak bisa diakses.
  if (!category) notFound();

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: category.name,
    description: category.short,
    serviceType: "Pembayaran & isi ulang digital",
    areaServed: "ID",
    provider: { "@type": "Organization", name: site.name, url: site.url },
    url: `${site.url}/produk/${category.slug}`,
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: category.nomLabel,
      itemListElement: category.items.map((item) => ({
        "@type": "Offer",
        name: `${category.name} ${item.nama}`,
        description: item.keterangan,
        price: item.harga,
        priceCurrency: "IDR",
      })),
    },
  };

  return (
    <main className="min-h-[70vh] pt-8.5 pb-17.5">
      <div className="wrap">
        <ProductPicker category={category} />
      </div>
      <JsonLd
        data={breadcrumbSchema([
          { name: category.name, path: `/produk/${category.slug}` },
        ])}
      />
      <JsonLd data={serviceSchema} />
    </main>
  );
}
