import { PaymentEditor } from "@/components/admin/PaymentEditor";
import { getPaymentMethodsForEdit } from "@/lib/store/payments";

export const metadata = { title: "Pembayaran", robots: { index: false, follow: false } };

export default async function AdminPaymentsPage() {
  const { methods, error } = await getPaymentMethodsForEdit();

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold">Metode Pembayaran</h1>
        <p className="mt-1 text-sm text-muted">
          QRIS dengan gambar, atau transfer/e-wallet dengan nomor tujuan + tombol salin.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </p>
      )}

      <PaymentEditor methods={methods} />
    </>
  );
}
