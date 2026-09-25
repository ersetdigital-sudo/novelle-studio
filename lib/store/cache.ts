import { unstable_cache } from "next/cache";

import { CATALOG_TAG, getCatalogSnapshot } from "@/lib/store/catalog";
import { CONTENT_TAG, getContentSnapshot } from "@/lib/store/content";
import { PAYMENTS_TAG, getPaymentMethods } from "@/lib/store/payments";

/**
 * Halaman publik membaca lewat wrapper ini supaya tetap statis/ISR.
 * Setiap simpan dari dashboard memanggil revalidateTag(tag) sehingga isinya
 * ikut berubah tanpa perlu rebuild — ini yang menghilangkan keharusan
 * "hapus .next dulu" setelah mengubah katalog.
 *
 * Pesanan sengaja TIDAK di-cache karena datanya transaksional.
 */
export const getCachedCatalog = unstable_cache(
  async () => getCatalogSnapshot(),
  ["novelle-catalog"],
  { tags: [CATALOG_TAG] },
);

export const getCachedContent = unstable_cache(
  async () => getContentSnapshot(),
  ["novelle-content"],
  { tags: [CONTENT_TAG] },
);

export const getCachedPaymentMethods = unstable_cache(
  async () => getPaymentMethods(),
  ["novelle-payments"],
  { tags: [PAYMENTS_TAG] },
);
