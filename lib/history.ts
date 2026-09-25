import type { Category, StoredTransaction } from "@/lib/types";

export const NOVELLE_TRX_KEY = "novelle_trx_v1";
const MAX_HISTORY = 12;

/** Baca riwayat transaksi dari localStorage. Aman dipanggil di server (return []). */
export function loadTransactions(): StoredTransaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(window.localStorage.getItem(NOVELLE_TRX_KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as StoredTransaction[]) : [];
  } catch {
    return [];
  }
}

/** Simpan transaksi terbaru di urutan paling depan (maksimal 12 entri). */
export function saveTransaction(trx: StoredTransaction): void {
  if (typeof window === "undefined") return;
  try {
    const rest = loadTransactions().filter((item) => item.id !== trx.id);
    window.localStorage.setItem(
      NOVELLE_TRX_KEY,
      JSON.stringify([trx, ...rest].slice(0, MAX_HISTORY)),
    );
  } catch {
    // localStorage diblokir (mode private) — riwayat cukup dilewati.
  }
}

/** Cari transaksi berdasarkan kode (case-insensitive). */
export function findTransaction(id: string): StoredTransaction | undefined {
  const needle = id.trim().toUpperCase();
  return loadTransactions().find((item) => item.id.toUpperCase() === needle);
}

/** Buat kode transaksi baru, contoh: "NVL2648173142". */
export function createTransactionId(): string {
  return (
    "NVL" +
    Date.now().toString().slice(-8) +
    Math.floor(Math.random() * 90 + 10).toString()
  );
}

/** Nomor token PLN (20 digit berkelompok) atau nomor referensi untuk kategori lain. */
export function createToken(category: Category["slug"] | null): string {
  if (category === "pln") {
    return Array.from({ length: 5 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString(),
    ).join("-");
  }
  return "REF" + Math.floor(100000000 + Math.random() * 899999999).toString();
}
