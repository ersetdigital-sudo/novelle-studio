"use server";

import { revalidatePath } from "next/cache";

import { createOrder, claimPayment } from "@/lib/store/orders";
import type { ActionResult } from "@/lib/types";

/**
 * Aksi publik — tidak butuh login admin.
 * createOrder menghitung harga di server dari katalog; input klien hanya
 * slug kategori, provider, dan label nominal.
 */
export async function createOrderAction(input: {
  categorySlug: string;
  provider: string | null;
  itemLabel: string;
  accountId: string;
  paymentMethodId: string | null;
}): Promise<ActionResult & { invoice?: string }> {
  const accountId = input.accountId.trim();
  if (!input.itemLabel || !input.categorySlug) {
    return { ok: false, message: "Lengkapi pilihan produk terlebih dahulu." };
  }
  if (accountId.length < 6) {
    return { ok: false, message: "Nomor tujuan belum valid." };
  }
  return createOrder(input);
}

/** Pembeli menandai "saya sudah bayar": menunggu → dibayar (klaim, bukan verifikasi). */
export async function claimPaymentAction(invoice: string): Promise<ActionResult> {
  const invoiceClean = invoice.trim();
  if (!/^NVL\d{6,}$/.test(invoiceClean)) {
    return { ok: false, message: "Format invoice tidak valid." };
  }
  const result = await claimPayment(invoiceClean);
  revalidatePath(`/pembayaran/${invoiceClean}`);
  return result;
}
