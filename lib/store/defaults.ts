import { catalog, categoryOrder } from "@/data/catalog";
import { faqs } from "@/data/faqs";
import { promos } from "@/data/promos";
import { site } from "@/data/site";
import { testimonials } from "@/data/testimonials";
import type {
  CategoryItemRecord,
  CategorySetting,
  CategorySlug,
  SiteContent,
} from "@/lib/types";

/**
 * Isi awal yang dipakai kalau Supabase/JSON belum punya data.
 * Semua teks di sini bisa ditimpa dari dashboard tanpa menyentuh kode.
 */
export const DEFAULT_CONTENT: SiteContent = {
  settings: {
    name: site.name,
    tagline: site.tagline,
    description: site.description,
    phoneDisplay: site.contact.phoneDisplay,
    whatsapp: site.contact.whatsapp,
    email: site.contact.email,
  },
  hero: {
    badge: "⚡ Proses otomatis di bawah 30 detik · tanpa daftar akun",
    title: "Semua Kebutuhan",
    accent: "Digital",
    titleSuffix: ", Satu Genggaman",
    lead: "Pulsa, token listrik, paket data, sampai angsuran kendaraan — bayar semuanya di Novelle Studio. Cukup isi nomor, scan QRIS, beres.",
    primaryCta: "Mulai Transaksi →",
    secondaryCta: "Lihat Cara Kerjanya",
    stats: [
      { value: "8", label: "Kategori layanan" },
      { value: "24/7", label: "Transaksi nonstop" },
      { value: "120rb+", label: "Transaksi diproses" },
    ],
  },
  why: {
    kicker: "Kenapa Novelle Studio",
    title: "Dibuat biar kamu nggak mikir dua kali",
    subtitle: "",
    items: [
      {
        title: "Proses Kilat Otomatis",
        description:
          "Begitu pembayaran QRIS terdeteksi, sistem langsung memproses pesanan. Rata-rata selesai di bawah 30 detik.",
      },
      {
        title: "Aman Tanpa Buat Akun",
        description:
          "Guest checkout sepenuhnya. Kami tidak menyimpan password, tidak minta data pribadi berlebihan.",
      },
      {
        title: "Harga Jujur di Depan",
        description:
          "Biaya admin ditampilkan sebelum bayar. Tidak ada potongan tersembunyi saat transaksi berjalan.",
      },
    ],
  },
  steps: {
    kicker: "Cara Transaksi",
    title: "Tiga langkah, selesai",
    subtitle: "Nggak perlu daftar, nggak perlu install apa pun.",
    items: [
      {
        title: "Pilih Produk & Nominal",
        description:
          "Tentukan kategori, masukkan nomor tujuan atau ID pelanggan, lalu pilih nominal yang kamu butuhkan.",
      },
      {
        title: "Scan QRIS",
        description:
          "Cek ringkasan transaksi, lalu bayar dengan scan QRIS dari aplikasi bank atau e-wallet mana pun.",
      },
      {
        title: "Terima Otomatis",
        description:
          "Klik konfirmasi pembayaran. Pesanan diproses dan status transaksi tampil langsung di layar.",
      },
    ],
  },
  promos: {
    kicker: "Promo Bulan Ini",
    title: "Hemat sedikit, tiap hari",
    subtitle: "",
    items: promos.map((promo) => ({ ...promo })),
  },
  testimonials: {
    kicker: "Kata Mereka",
    title: "Dipakai harian, bukan sekali coba",
    subtitle: "",
    items: testimonials.map((item) => ({ ...item })),
  },
  faqs: {
    kicker: "FAQ",
    title: "Pertanyaan yang sering masuk",
    subtitle: "",
    items: faqs.map((item) => ({ ...item })),
  },
};

/** Pengaturan operasional per kategori dari data/catalog.ts. */
export function defaultCategorySettings(): CategorySetting[] {
  return categoryOrder.map((slug) => {
    const category = catalog[slug];
    return {
      slug,
      adminFee: category.admin,
      nomLabel: category.nomLabel,
      providerLabel: category.providers?.label ?? null,
      providers: category.providers ? [...category.providers.list] : null,
      fieldLabel: category.field.label,
      fieldPlaceholder: category.field.placeholder,
      fieldHint: category.field.hint,
      fieldMinLength: category.field.minLength,
      altProvider: category.altProvider ?? null,
      isActive: true,
    };
  });
}

/** Daftar nominal awal, id dibuat deterministik supaya seed-nya stabil. */
export function defaultCategoryItems(): CategoryItemRecord[] {
  const records: CategoryItemRecord[] = [];

  for (const slug of categoryOrder) {
    const category = catalog[slug];
    category.items.forEach((item, index) => {
      records.push({
        id: `${slug}-main-${index}`,
        categorySlug: slug,
        variant: "main",
        label: item.nama,
        note: item.keterangan,
        price: item.harga,
        sortOrder: index,
        isActive: true,
      });
    });
    category.altItems?.forEach((item, index) => {
      records.push({
        id: `${slug}-alt-${index}`,
        categorySlug: slug,
        variant: "alt",
        label: item.nama,
        note: item.keterangan,
        price: item.harga,
        sortOrder: index,
        isActive: true,
      });
    });
  }

  return records;
}

/** Kategori yang punya daftar nominal alternatif (mis. PLN pascabayar). */
export function hasAltVariant(slug: CategorySlug): boolean {
  return Boolean(catalog[slug].altItems?.length);
}
