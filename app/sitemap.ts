import type { MetadataRoute } from "next";

import { site } from "@/data/site";
import { categorySlugs } from "@/lib/catalog";

/** sitemap.xml dibuat otomatis: beranda + semua kategori + halaman cek transaksi. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: site.url,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...categorySlugs.map((slug) => ({
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
