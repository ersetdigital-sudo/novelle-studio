import type { Metadata } from "next";

import { CheckoutClient } from "@/components/transaction/CheckoutClient";

export const metadata: Metadata = {
  title: "Pembayaran",
  description:
    "Ringkasan transaksi dan pembayaran Novelle Studio. Periksa nominal dan nomor tujuan sebelum melanjutkan.",
  robots: { index: false, follow: true },
};

export default function CheckoutPage() {
  return (
    <main className="min-h-[70vh] pt-8.5 pb-17.5">
      <div className="wrap">
        <CheckoutClient />
      </div>
    </main>
  );
}
