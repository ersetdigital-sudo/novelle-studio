"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { createOrderAction } from "@/app/public-actions";
import { rupiah } from "@/lib/format";
import { useCatalog } from "@/components/public/CategoryProvider";
import { useTransaction } from "@/providers/TransactionProvider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FlowSteps } from "@/components/ui/FlowSteps";

export function CheckoutClient() {
  const router = useRouter();
  const { state, hydrated, category, label } = useTransaction();
  const { paymentMethods } = useCatalog();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.item || !category) {
      router.replace("/#kategori");
      return;
    }
    setLoading(false);
  }, [hydrated, state.item, category, router]);

  if (loading || !category || !state.item) {
    return <p className="py-16 text-center text-muted">Memuat ringkasan transaksi…</p>;
  }

  function handleConfirm() {
    setError("");
    startTransition(async () => {
      const result = await createOrderAction({
        categorySlug: category!.slug,
        provider: state.provider,
        itemLabel: state.item!.nama,
        accountId: state.number,
        paymentMethodId: paymentMethods[0]?.id ?? null,
      });
      if (!result.ok || !result.invoice) {
        setError(result.message);
        return;
      }
      // Nominal & total dihitung server; klien hanya menerima invoice.
      router.push(`/pembayaran/${result.invoice}`);
    });
  }

  return (
    <>
      <Breadcrumb
        items={[
          { label: category.name, href: `/produk/${category.slug}` },
          { label: "Pembayaran" },
        ]}
      />
      <FlowSteps activeStep={2} />

      <div className="grid gap-5 min-[900px]:grid-cols-[1.6fr_1fr] min-[900px]:items-start">
        <div className="panel">
          <h2 className="text-[22px]">Ringkasan Transaksi</h2>
          <p className="hint mb-4.5">
            Periksa kembali sebelum melanjutkan. Nomor tujuan yang salah tidak dapat dibatalkan.
          </p>
          <div className="row">
            <span>Kategori</span>
            <b>{label}</b>
          </div>
          <div className="row">
            <span>Produk</span>
            <b>{state.item.nama}</b>
          </div>
          <div className="row">
            <span>{category.field.label}</span>
            <b>{state.number}</b>
          </div>
          <div className="sep" />
          <div className="row">
            <span>Harga Produk</span>
            <b>{rupiah(state.item.harga)}</b>
          </div>
          <div className="row">
            <span>Biaya Admin</span>
            <b>{category.admin ? rupiah(category.admin) : "Gratis"}</b>
          </div>
          <div className="row row-total">
            <span>Total Bayar</span>
            <b>{rupiah(state.total)}</b>
          </div>
          <div className="sep" />
          <button className="btn btn-ghost btn-block" onClick={() => router.push(`/produk/${category.slug}`)}>
            ← Ubah Pesanan
          </button>
        </div>

        <div className="panel text-center">
          <h3 className="font-display text-lg font-extrabold">Lanjut ke Pembayaran</h3>
          <p className="hint mt-1.5">
            Kode pembayaran dibuat setelah kamu menekan tombol di bawah. Harga final diverifikasi
            ulang oleh server.
          </p>
          <div className="h-4.5" />
          <button type="button" className="btn btn-orange btn-block" disabled={pending} onClick={handleConfirm}>
            {pending ? "Memproses…" : "Buat Kode Pembayaran"}
          </button>
          {error && (
            <p className="err" role="alert">
              {error}
            </p>
          )}
          <p className="hint mt-3">Tanpa login. Transaksi sebagai tamu.</p>
        </div>
      </div>
    </>
  );
}
