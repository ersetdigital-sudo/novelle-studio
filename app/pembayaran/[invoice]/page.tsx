import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PaymentDetail } from "@/components/transaction/PaymentDetail";
import { getActiveCategories } from "@/lib/store/catalog";
import { getOrderByInvoice } from "@/lib/store/orders";
import { rupiah } from "@/lib/format";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pembayaran Pesanan",
  robots: { index: false, follow: false },
};

export default async function InvoicePaymentPage({
  params,
}: {
  params: Promise<{ invoice: string }>;
}) {
  const { invoice } = await params;
  const order = await getOrderByInvoice(decodeURIComponent(invoice));

  if (!order) notFound();

  const categories = await getActiveCategories();
  const category = categories.find((item) => item.slug === order.categorySlug);

  return (
    <main className="min-h-[70vh] pt-8.5 pb-17.5">
      <div className="wrap">
        <nav className="crumb" aria-label="Breadcrumb">
          <Link href="/">Beranda</Link>
          <span aria-hidden="true">›</span>
          {category ? (
            <Link href={`/produk/${category.slug}`}>{category.name}</Link>
          ) : (
            <b>{order.categoryLabel}</b>
          )}
          <span aria-hidden="true">›</span>
          <b>Pembayaran</b>
        </nav>

        <div className="flow">
          <i className="flow-step" data-active="true">1. Pilih Produk</i>
          <b className="flow-sep">—</b>
          <i className="flow-step" data-active="true">2. Bayar</i>
          <b className="flow-sep">—</b>
          <i className="flow-step">3. Status</i>
        </div>

        <div className="grid gap-5 min-[900px]:grid-cols-[1.6fr_1fr] min-[900px]:items-start">
          <div className="panel">
            <h2 className="text-[22px]">Ringkasan Pesanan</h2>
            <p className="hint mb-4.5">
              Selesaikan pembayaran sebelum waktu habis. Nomor tujuan yang salah tidak dapat
              dibatalkan.
            </p>
            <div className="row">
              <span>Kode Invoice</span>
              <b className="font-display">{order.invoice}</b>
            </div>
            <div className="row">
              <span>Produk</span>
              <b>
                {order.categoryLabel} · {order.itemLabel}
              </b>
            </div>
            <div className="row">
              <span>{order.accountLabel}</span>
              <b>{order.accountId}</b>
            </div>
            <div className="sep" />
            <div className="row">
              <span>Harga Produk</span>
              <b>{rupiah(order.subtotal)}</b>
            </div>
            <div className="row">
              <span>Biaya Admin</span>
              <b>{order.fee ? rupiah(order.fee) : "Gratis"}</b>
            </div>
            <div className="row row-total">
              <span>Total Bayar</span>
              <b>{rupiah(order.total)}</b>
            </div>
            <div className="sep" />
            <Link href="/cek-transaksi" className="btn btn-ghost btn-block">
              Lacak pesanan lain
            </Link>
          </div>

          <PaymentDetail order={order} />
        </div>
      </div>
      {/* Gambar QRIS dirender oleh PaymentDetail; import Image dipakai di sana. */}
      <span className="hidden">
        <Image src="/qris-placeholder.svg" alt="" width={1} height={1} unoptimized />
      </span>
    </main>
  );
}
