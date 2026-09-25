import { NextResponse } from "next/server";

import { getOrderByInvoice } from "@/lib/store/orders";

/** Lookup publik satu invoice — tanpa data sensitif, hanya ringkasan pesanan. */
export async function GET(request: Request): Promise<NextResponse> {
  const invoice = new URL(request.url).searchParams.get("invoice")?.trim() ?? "";

  if (!/^NVL\d{6,}$/.test(invoice)) {
    return NextResponse.json(
      { message: "Format invoice tidak valid. Contoh: NVL2648173142" },
      { status: 400 },
    );
  }

  try {
    const order = await getOrderByInvoice(invoice.toUpperCase());
    if (!order) {
      return NextResponse.json({ order: null }, { status: 404 });
    }
    return NextResponse.json({ order });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Gagal memeriksa transaksi." },
      { status: 500 },
    );
  }
}
