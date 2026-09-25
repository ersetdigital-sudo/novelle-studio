/**
 * Konfigurasi global situs.
 * >>> Semua data yang perlu diganti manual (kontak CS, email, URL) ada di file ini. <<<
 */
export const site = {
  name: "Novelle Studio",
  shortName: "Novelle",
  tagline: "Semua Kebutuhan Digital, Satu Genggaman",
  description:
    "Novelle Studio: bayar pulsa, token PLN, paket data, PDAM, BPJS, internet, e-money, dan angsuran multifinance dalam satu genggaman. Tanpa daftar akun, bayar pakai QRIS.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://novellestudio.id",
  locale: "id_ID",
  /** >>> GANTI NOMOR CS DI SINI <<< */
  contact: {
    phoneDisplay: "0812-3456-7890",
    whatsapp: "https://wa.me/6281234567890",
    email: "halo@novellestudio.id",
  },
  /** Gambar QRIS statis resultan. Ganti file di public/qris-placeholder.svg dengan QRIS asli. */
  qrisImage: "/qris-placeholder.svg",
} as const;

export const heroStats = [
  { value: "8", label: "Kategori layanan" },
  { value: "24/7", label: "Transaksi nonstop" },
  { value: "120rb+", label: "Transaksi diproses" },
] as const;

/** Menu utama navbar — dijaga tetap ringkas (maksimal 5 item). */
export const navLinks = [
  { label: "Home", href: "/" },
  { label: "Produk", href: "/#kategori" },
  { label: "Cara Transaksi", href: "/#cara" },
  { label: "Promo", href: "/#promo" },
  { label: "FAQ", href: "/#faq" },
] as const;

/** Cek transaksi tampil terpisah di sisi kanan navbar (bukan bagian menu utama). */
export const checkLink = { label: "Cek Transaksi", href: "/cek-transaksi" } as const;
