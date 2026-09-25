import type { MetadataRoute } from "next";

import { site } from "@/data/site";
import { categorySlugs } from "@/lib/catalog";
import { getCustomCategories } from "@/lib/store/catalog";

/** sitemap.xml dibuat otomatis: beranda + semua kategori + halaman cek transaksi. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const customSlugs = (await getCustomCategories())
    .filter((category) => category.isActive)
    .map((category) => category.slug);

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...[...categorySlugs, ...customSlugs].map((slug) => ({
      url: `${site.url}/produk/${slug}`,
      lastModified,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    {
      url: `${site.url}/cek-transaksi`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];
}
