import { isSupabaseConfigured, supabaseFetch } from "@/lib/store/config";
import { CONTENT_FILES, readJsonFile, writeJsonFile } from "@/lib/store/files";
import { getCatalogSnapshot } from "@/lib/store/catalog";
import { getPaymentMethodById, getPaymentMethods } from "@/lib/store/payments";
import type {
  ActionResult,
  CategorySlug,
  Order,
  OrderStatus,
} from "@/lib/types";

export const ORDERS_TAG = "novelle-orders";

/**
 * Status akhir tidak bisa dibuka lagi — mencegah pesanan yang sudah selesai
 * kembali ke "menunggu" karena salah klik.
 */
const NEXT_STATUS: Record<OrderStatus, readonly OrderStatus[]> = {
  menunggu: ["dibayar", "batal"],
  dibayar: ["selesai", "batal", "menunggu"],
  selesai: [],
  batal: [],
};

export const isOrderStatus = (value: string): value is OrderStatus =>
  value === "menunggu" ||
  value === "dibayar" ||
  value === "selesai" ||
  value === "batal";

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return NEXT_STATUS[from].includes(to);
}

interface OrderRow {
  id: string;
  invoice: string;
  category_slug: string;
  category_label: string;
  item_label: string;
  account_id: string;
  account_label: string | null;
  payment_method_id: string | null;
  payment_method_name: string | null;
  subtotal: number;
  fee: number;
  total: number;
  token: string | null;
  status: string;
  created_at: string;
  updated_at: string;
}

const mapRow = (row: OrderRow): Order => ({
  id: row.id,
  invoice: row.invoice,
  categorySlug: row.category_slug as CategorySlug,
  categoryLabel: row.category_label,
  itemLabel: row.item_label,
  accountId: row.account_id,
  accountLabel: row.account_label ?? "Nomor Tujuan",
  paymentMethodId: row.payment_method_id,
  paymentMethodName: row.payment_method_name ?? "",
  subtotal: row.subtotal,
  fee: row.fee,
  total: row.total,
  token: row.token ?? "",
  status: isOrderStatus(row.status) ? row.status : "menunggu",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

async function readAll(): Promise<Order[]> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<OrderRow[]>(
      "orders?select=*&order=created_at.desc",
    );
    return rows.map(mapRow);
  }
  return (await readJsonFile<Order[]>(CONTENT_FILES.orders)) ?? [];
}

async function writeAll(orders: Order[]): Promise<void> {
  await writeJsonFile(CONTENT_FILES.orders, orders);
}

async function patchOrder(invoice: string, patch: Partial<Order>): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch(`orders?invoice=eq.${encodeURIComponent(invoice)}`, {
      method: "PATCH",
      prefer: "return=minimal",
      body: JSON.stringify({
        ...(patch.status ? { status: patch.status } : {}),
        ...(patch.token !== undefined ? { token: patch.token } : {}),
        updated_at: new Date().toISOString(),
      }),
    });
    return;
  }

  const orders = await readAll();
  await writeAll(
    orders.map((order) =>
      order.invoice === invoice
        ? { ...order, ...patch, updatedAt: new Date().toISOString() }
        : order,
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Baca                                                                */
/* ------------------------------------------------------------------ */

export async function listOrders(options: {
  status?: OrderStatus;
  limit?: number;
} = {}): Promise<Order[]> {
  const { status, limit } = options;

  if (isSupabaseConfigured()) {
    const filters = [
      "select=*",
      "order=created_at.desc",
      ...(status ? [`status=eq.${status}`] : []),
      ...(limit ? [`limit=${limit}`] : []),
    ];
    const rows = await supabaseFetch<OrderRow[]>(`orders?${filters.join("&")}`);
    return rows.map(mapRow);
  }

  const orders = (await readAll()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
  const filtered = status ? orders.filter((order) => order.status === status) : orders;
  return limit ? filtered.slice(0, limit) : filtered;
}

export async function getOrderByInvoice(invoice: string): Promise<Order | null> {
  if (isSupabaseConfigured()) {
    const rows = await supabaseFetch<OrderRow[]>(
      `orders?invoice=eq.${encodeURIComponent(invoice)}&select=*&limit=1`,
    );
    return rows[0] ? mapRow(rows[0]) : null;
  }
  const orders = await readAll();
  return orders.find((order) => order.invoice === invoice) ?? null;
}

export interface OrderStats {
  total: number;
  pending: number;
  awaitingReview: number;
  done: number;
  cancelled: number;
  /** Hanya pesanan yang sudah diverifikasi admin. */
  revenueVerified: number;
  /** Klaim pembayaran yang belum diverifikasi — bukan pendapatan. */
  claimedAmount: number;
}

export async function getOrderStats(): Promise<OrderStats> {
  const orders = await listOrders();
  return {
    total: orders.length,
    pending: orders.filter((order) => order.status === "menunggu").length,
    awaitingReview: orders.filter((order) => order.status === "dibayar").length,
    done: orders.filter((order) => order.status === "selesai").length,
    cancelled: orders.filter((order) => order.status === "batal").length,
    revenueVerified: orders
      .filter((order) => order.status === "selesai")
      .reduce((sum, order) => sum + order.total, 0),
    claimedAmount: orders
      .filter((order) => order.status === "dibayar")
      .reduce((sum, order) => sum + order.total, 0),
  };
}

/* ------------------------------------------------------------------ */
/* Buat pesanan                                                        */
/* ------------------------------------------------------------------ */

export interface CreateOrderInput {
  categorySlug: string;
  /** Provider yang dipilih pembeli, dipakai menentukan varian nominal. */
  provider: string | null;
  itemLabel: string;
  accountId: string;
  paymentMethodId: string | null;
}

function generateInvoice(existing: Set<string>): string {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const candidate =
      "NVL" +
      Date.now().toString().slice(-8) +
      Math.floor(10 + Math.random() * 89).toString();
    if (!existing.has(candidate)) return candidate;
  }
  return "NVL" + Date.now().toString() + Math.floor(Math.random() * 9);
}

/**
 * Harga SELALU dihitung di server dari katalog, bukan dari yang dikirim browser.
 * Yang dikirim klien hanya slug kategori, provider, dan label nominal.
 */
export async function createOrder(
  input: CreateOrderInput,
): Promise<ActionResult & { invoice?: string }> {
  const { categories } = await getCatalogSnapshot();
  const category = categories.find((item) => item.slug === input.categorySlug);
  if (!category) {
    return { ok: false, message: "Kategori tidak tersedia atau sedang disembunyikan." };
  }

  const items =
    input.provider && category.altProvider === input.provider && category.altItems
      ? category.altItems
      : category.items;
  const nominal = items.find((item) => item.nama === input.itemLabel);
  if (!nominal) {
    return { ok: false, message: "Nominal tidak ditemukan di katalog." };
  }

  const accountId = input.accountId.trim();
  if (accountId.length < category.field.minLength) {
    return { ok: false, message: `${category.field.label} belum valid.` };
  }

  const { methods } = await getPaymentMethods();
  const requested = await getPaymentMethodById(input.paymentMethodId);
  const method =
    requested && methods.some((m) => m.id === requested.id) ? requested : methods[0];
  if (!method) {
    return {
      ok: false,
      message: "Belum ada metode pembayaran aktif. Hubungi admin.",
    };
  }

  const existing = new Set((await listOrders()).map((order) => order.invoice));
  const invoice = generateInvoice(existing);
  const now = new Date().toISOString();

  const order: Order = {
    id: crypto.randomUUID(),
    invoice,
    categorySlug: category.slug,
    categoryLabel: category.providers
      ? `${category.name} — ${input.provider ?? category.providers.list[0]}`
      : category.name,
    itemLabel: nominal.nama,
    accountId,
    accountLabel: category.field.label,
    paymentMethodId: method.id,
    paymentMethodName: method.name,
    subtotal: nominal.harga,
    fee: category.admin,
    total: nominal.harga + category.admin,
    token: "",
    status: "menunggu",
    createdAt: now,
    updatedAt: now,
  };

  if (isSupabaseConfigured()) {
    await supabaseFetch("orders", {
      method: "POST",
      prefer: "return=minimal",
      body: JSON.stringify([
        {
          invoice: order.invoice,
          category_slug: order.categorySlug,
          category_label: order.categoryLabel,
          item_label: order.itemLabel,
          account_id: order.accountId,
          account_label: order.accountLabel,
          payment_method_id: order.paymentMethodId,
          payment_method_name: order.paymentMethodName,
          subtotal: order.subtotal,
          fee: order.fee,
          total: order.total,
          status: order.status,
        },
      ]),
    });
  } else {
    await writeAll([order, ...(await readAll())]);
  }

  return { ok: true, message: "Pesanan dibuat.", invoice };
}

/* ------------------------------------------------------------------ */
/* Ubah status                                                         */
/* ------------------------------------------------------------------ */

/** Pembeli hanya boleh mengklaim pembayaran: menunggu → dibayar. */
export async function claimPayment(invoice: string): Promise<ActionResult> {
  const order = await getOrderByInvoice(invoice);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  if (order.status === "dibayar") return { ok: true, message: "Sudah ditandai dibayar." };
  if (!canTransition(order.status, "dibayar")) {
    return { ok: false, message: "Pesanan ini tidak bisa diubah lagi." };
  }
  await patchOrder(invoice, { status: "dibayar" });
  return { ok: true, message: "Terima kasih, pembayaran akan diverifikasi." };
}

/** Dashboard: ubah status apa pun yang masih diizinkan state machine. */
export async function updateOrderStatus(
  invoice: string,
  next: OrderStatus,
  token?: string,
): Promise<ActionResult> {
  const order = await getOrderByInvoice(invoice);
  if (!order) return { ok: false, message: "Pesanan tidak ditemukan." };
  if (order.status === next && token === undefined) {
    return { ok: true, message: "Status tidak berubah." };
  }
  if (order.status !== next && !canTransition(order.status, next)) {
    return {
      ok: false,
      message: `Status "${order.status}" tidak bisa diubah ke "${next}".`,
    };
  }
  await patchOrder(invoice, {
    status: next,
    ...(token !== undefined ? { token } : {}),
  });
  return { ok: true, message: "Status diperbarui." };
}

/** Nomor token/serial diisi admin saat pesanan diverifikasi selesai. */
export function createToken(categorySlug: string): string {
  if (categorySlug === "pln") {
    return Array.from({ length: 5 }, () =>
      Math.floor(1000 + Math.random() * 9000).toString(),
    ).join("-");
  }
  return "REF" + Math.floor(100000000 + Math.random() * 899999999).toString();
}

export async function resetOrders(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch("orders?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    return;
  }
  await writeAll([]);
}
