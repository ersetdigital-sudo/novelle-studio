import { site } from "@/data/site";
import { isPaymentMethodReady } from "@/lib/payment-shared";
import { isSupabaseConfigured, supabaseFetch } from "@/lib/store/config";
import { CONTENT_FILES, readJsonFile, writeJsonFile } from "@/lib/store/files";
import type { PaymentMethod, PaymentType } from "@/lib/types";

export { isPaymentMethodReady };

export const PAYMENTS_TAG = "novelle-payments";

/** Metode awal: QRIS memakai gambar di public/qris-placeholder.svg. */
export const DEFAULT_PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: "qris-utama",
    name: "QRIS (semua bank & e-wallet)",
    type: "qris",
    accountLabel: "QRIS",
    accountNumber: "",
    accountName: site.name,
    qrImage: site.qrisImage,
    instructions: [
      "Buka aplikasi bank atau e-wallet yang mendukung QRIS.",
      "Scan kode QR di halaman pembayaran.",
      "Pastikan nominalnya sama dengan total pesanan, lalu bayar.",
    ],
    isActive: true,
    sortOrder: 0,
  },
];

interface PaymentRow {
  id: string;
  name: string;
  type: PaymentType;
  account_label: string;
  account_number: string | null;
  account_name: string | null;
  qr_image: string | null;
  instructions: string[] | null;
  is_active: boolean;
  sort_order: number;
}

function mapRow(row: PaymentRow): PaymentMethod {
  return {
    id: row.id,
    name: row.name,
    type: row.type === "transfer" ? "transfer" : "qris",
    accountLabel: row.account_label || (row.type === "qris" ? "QRIS" : "Nomor Tujuan"),
    accountNumber: row.account_number ?? "",
    accountName: row.account_name ?? "",
    qrImage: row.qr_image ?? "",
    instructions: Array.isArray(row.instructions) ? row.instructions : [],
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

/** Metode tidak lengkap tidak boleh tampil ke pembeli — util di lib/payment-shared.ts. */

export interface PaymentSnapshot {
  methods: PaymentMethod[];
  error: string | null;
}

async function loadRaw(): Promise<PaymentMethod[]> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<PaymentRow[]>(
      "payment_methods?select=*&order=sort_order.asc",
    );
    return rows.map(mapRow);
  }
  return (await readJsonFile<PaymentMethod[]>(CONTENT_FILES.payments)) ?? [];
}

/** Dipakai halaman publik & checkout — hanya metode aktif yang siap dipakai. */
export async function getPaymentMethods(): Promise<PaymentSnapshot> {
  try {
    const stored = await loadRaw();
    const methods = (stored.length ? stored : DEFAULT_PAYMENT_METHODS)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { methods: methods.filter((m) => m.isActive && isPaymentMethodReady(m)), error: null };
  } catch (error) {
    return {
      methods: DEFAULT_PAYMENT_METHODS,
      error: error instanceof Error ? error.message : "Gagal memuat metode pembayaran.",
    };
  }
}

/** Dipakai dashboard: semua metode, termasuk yang nonaktif. */
export async function getPaymentMethodsForEdit(): Promise<PaymentSnapshot> {
  try {
    const stored = await loadRaw();
    const methods = (stored.length ? stored : DEFAULT_PAYMENT_METHODS)
      .slice()
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return { methods, error: null };
  } catch (error) {
    return {
      methods: DEFAULT_PAYMENT_METHODS,
      error: error instanceof Error ? error.message : "Gagal memuat metode pembayaran.",
    };
  }
}

export async function getPaymentMethodById(
  id: string | null,
): Promise<PaymentMethod | undefined> {
  if (!id) return undefined;
  const { methods } = await getPaymentMethods();
  return methods.find((method) => method.id === id);
}

export async function savePaymentMethods(methods: PaymentMethod[]): Promise<void> {
  const prepared = methods.map((method, index) => ({ ...method, sortOrder: index }));

  if (isSupabaseConfigured()) {
    await supabaseFetch("payment_methods?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    if (prepared.length) {
      await supabaseFetch("payment_methods", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify(
          prepared.map((method) => ({
            id: method.id,
            name: method.name,
            type: method.type,
            account_label: method.accountLabel,
            account_number: method.accountNumber,
            account_name: method.accountName,
            qr_image: method.qrImage,
            instructions: method.instructions,
            is_active: method.isActive,
            sort_order: method.sortOrder,
          })),
        ),
      });
    }
    return;
  }

  await writeJsonFile(CONTENT_FILES.payments, prepared);
}

export async function resetPaymentMethods(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch("payment_methods?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    return;
  }
  await writeJsonFile(CONTENT_FILES.payments, DEFAULT_PAYMENT_METHODS);
}
