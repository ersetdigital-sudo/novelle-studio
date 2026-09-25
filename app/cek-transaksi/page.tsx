import type { Metadata } from "next";
import { Suspense } from "react";

import { CheckView } from "@/components/transaction/CheckView";

export const metadata: Metadata = {
  title: "Cek Transaksi",
  description:
    "Lacak status transaksi Novelle Studio dengan kode transaksi. Tidak perlu akun — cukup masukkan kodenya.",
  alternates: { canonical: "/cek-transaksi" },
};

export default function CheckTransactionPage() {
  return (
    <main className="min-h-[70vh] pt-8.5 pb-17.5">
      <div className="wrap">
        {/* useSearchParams() butuh Suspense boundary saat halaman di-prerender */}
        <Suspense fallback={<p className="py-16 text-center text-muted">Memuat…</p>}>
          <CheckView />
        </Suspense>
      </div>
    </main>
  );
}
