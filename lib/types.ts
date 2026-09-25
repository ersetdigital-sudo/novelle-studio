/** Slug kategori layanan bawaan yang hardcoded di data/catalog.ts. */
export type CategorySlug =
  | "pulsa"
  | "pln"
  | "data"
  | "pdam"
  | "bpjs"
  | "internet"
  | "emoney"
  | "multifinance";

/** Satu pilihan nominal / paket di dalam sebuah kategori. */
export interface NominalItem {
  /** Nama paket, contoh: "Pulsa 10.000". */
  nama: string;
  /** Keterangan singkat, contoh: "Masa aktif +14 hari". */
  keterangan: string;
  /** Harga dalam rupiah. */
  harga: number;
}

/** Field input nomor tujuan pada halaman produk. */
export interface CategoryField {
  label: string;
  placeholder: string;
  type: "tel" | "text";
  hint: string;
  /** Panjang minimum nomor supaya tombol lanjut aktif. */
  minLength: number;
}

/** Daftar pilihan penyedia / operator / wilayah (opsional per kategori). */
export interface CategoryProviders {
  label: string;
  list: readonly string[];
}

export interface Category {
  slug: string;
  name: string;
  /** Deskripsi singkat untuk kartu kategori. */
  short: string;
  /** Warna tint pastel untuk ikon & kartu. */
  tint: string;
  /** Kunci ikon di lib/icons.tsx; kategori code memakai slug-nya sendiri. */
  icon?: string;
  /** Biaya admin dalam rupiah (0 = gratis). */
  admin: number;
  /** Label bagian pilih nominal. */
  nomLabel: string;
  providers?: CategoryProviders;
  field: CategoryField;
  items: readonly NominalItem[];
  /** Varian nominal untuk provider tertentu (contoh: PLN pascabayar). */
  altItems?: readonly NominalItem[];
  /** Provider yang memakai altItems. */
  altProvider?: string;
}

/* ============================================================
   Konten presentasi (dokumen JSON yang diedit dari dashboard)
   ============================================================ */
export interface HeroStat {
  value: string;
  label: string;
}

export interface TextItem {
  title: string;
  description: string;
}

export interface SectionHeader {
  kicker: string;
  title: string;
  subtitle: string;
}

export interface Promo {
  code: string;
  title: string;
  description: string;
  variant: "tosca" | "orange" | "indigo";
}

export interface Testimonial {
  rating: number;
  quote: string;
  name: string;
  role: string;
  initial: string;
  color: string;
}

export interface Faq {
  question: string;
  answer: string;
}

export interface SiteContent {
  settings: {
    name: string;
    tagline: string;
    description: string;
    phoneDisplay: string;
    whatsapp: string;
    email: string;
  };
  hero: {
    /** Teks pill di atas judul. */
    badge: string;
    /** Judul dipecah 3 bagian supaya kata yang di-highlight diatur admin. */
    title: string;
    accent: string;
    titleSuffix: string;
    lead: string;
    primaryCta: string;
    secondaryCta: string;
    stats: HeroStat[];
  };
  why: SectionHeader & { items: TextItem[] };
  steps: SectionHeader & { items: TextItem[] };
  promos: SectionHeader & { items: Promo[] };
  testimonials: SectionHeader & { items: Testimonial[] };
  faqs: SectionHeader & { items: Faq[] };
  customCategories: CustomCategory[];
}

/* ============================================================
   Metode pembayaran
   ============================================================ */
export type PaymentType = "qris" | "transfer";

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  accountLabel: string;
  accountNumber: string;
  accountName: string;
  qrImage: string;
  instructions: string[];
  isActive: boolean;
  sortOrder: number;
}

/* ============================================================
   Pesanan
   ============================================================ */
export type OrderStatus = "menunggu" | "dibayar" | "selesai" | "batal";

export const ORDER_STATUSES: readonly OrderStatus[] = [
  "menunggu",
  "dibayar",
  "selesai",
  "batal",
];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: "Menunggu Pembayaran",
  dibayar: "Menunggu Verifikasi",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

export interface Order {
  id: string;
  invoice: string;
  categorySlug: string;
  categoryLabel: string;
  itemLabel: string;
  accountId: string;
  accountLabel: string;
  paymentMethodId: string | null;
  paymentMethodName: string;
  subtotal: number;
  fee: number;
  total: number;
  token: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

/** Hasil seragam dari server action supaya form bisa menampilkan pesan. */
export interface ActionResult {
  ok: boolean;
  message: string;
}

/* ============================================================
   Override katalog dari dashboard
   ============================================================ */

/** Data operasional per kategori yang bisa diubah admin. */
export interface CategorySetting {
  slug: string;
  adminFee: number;
  nomLabel: string;
  providerLabel: string | null;
  providers: string[] | null;
  fieldLabel: string;
  fieldPlaceholder: string;
  fieldHint: string;
  fieldMinLength: number;
  altProvider: string | null;
  isActive: boolean;
}

/** Satu baris nominal/paket di tabel category_items. */
export interface CategoryItemRecord {
  id: string;
  categorySlug: string;
  variant: "main" | "alt";
  label: string;
  note: string;
  price: number;
  sortOrder: number;
  isActive: boolean;
}

/** Kategori hasil gabungan default kode + override dashboard. */
export interface ResolvedCategory extends Category {
  isActive: boolean;
  settings: CategorySetting;
}

/* ============================================================
   Kategori custom (dibuat dari dashboard, disimpan di site_content)
   ============================================================ */

export interface CustomCategoryItem {
  label: string;
  note: string;
  price: number;
  isActive: boolean;
}

export interface CustomCategory {
  slug: string;
  name: string;
  short: string;
  tint: string;
  icon: string;
  admin: number;
  nomLabel: string;
  field: CategoryField;
  isActive: boolean;
  items: CustomCategoryItem[];
  createdAt: string;
}

/** Status transaksi hasil simulasi pembayaran. */
export type TransactionStatus = "wait" | "ok";

/** Transaksi yang disimpan di localStorage perangkat (tanpa akun/server). */
export interface StoredTransaction {
  id: string;
  produk: string;
  tujuanLabel: string;
  tujuan: string;
  total: number;
  token: string;
  waktu: string;
  status: TransactionStatus;
}

/** State alur transaksi yang dibagi antar halaman. */
export interface TransactionState {
  category: string | null;
  /** Snapshot kategori saat dipilih — menopang slug custom di checkout. */
  categoryData: Category | null;
  provider: string | null;
  item: NominalItem | null;
  /** Nomor tujuan / ID pelanggan yang diisi user. */
  number: string;
  trxId: string;
  total: number;
  admin: number;
  /** Waktu pembayaran (ISO string), null sebelum bayar. */
  paidAt: string | null;
  status: TransactionStatus;
  token: string;
}
