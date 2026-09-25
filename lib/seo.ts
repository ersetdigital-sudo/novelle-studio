import { site } from "@/data/site";

export interface BreadcrumbItem {
  name: string;
  /** Path relatif, contoh: "/produk/pulsa". */
  path: string;
}

/** JSON-LD BreadcrumbList — dipakai di halaman selain beranda. */
export function breadcrumbSchema(items: readonly BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Beranda", path: "/" }, ...items].map(
      (item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.name,
        item: `${site.url}${item.path}`,
      }),
    ),
  };
}
