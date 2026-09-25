import { catalog, categoryOrder } from "@/data/catalog";
import type { Category, CategorySlug, NominalItem } from "@/lib/types";

/** Semua slug kategori, dipakai untuk routing statis & sitemap. */
export const categorySlugs = Object.keys(catalog) as CategorySlug[];

/** Kategori sesuai urutan tampil di grid beranda. */
export const orderedCategories: readonly Category[] = categoryOrder.map(
  (slug) => catalog[slug],
);

export function isCategorySlug(value: string): value is CategorySlug {
  return value in catalog;
}

/** Ambil kategori by slug, atau undefined kalau slug tidak dikenal. */
export function getCategory(slug: string): Category | undefined {
  return isCategorySlug(slug) ? catalog[slug] : undefined;
}

/** Daftar nominal aktif — PLN pascabayar memakai daftar tagihan (altItems). */
export function getNominalItems(
  category: Category,
  provider: string | null,
): readonly NominalItem[] {
  if (category.altItems && provider && provider === category.altProvider) {
    return category.altItems;
  }
  return category.items;
}

/** Label panjang untuk ringkasan, contoh: "PLN — Token Prabayar". */
export function formatCategoryLabel(
  category: Category,
  provider: string | null,
): string {
  return provider ? `${category.name} — ${provider}` : category.name;
}
