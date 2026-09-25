"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { site } from "@/data/site";
import { QR_TRANSFORM, optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { rupiah } from "@/lib/format";
import { useTransaction } from "@/providers/TransactionProvider";
import { useCatalog } from "@/components/public/CategoryProvider";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { FlowSteps } from "@/components/ui/FlowSteps";

const PAYMENT_WINDOW_SECONDS = 10 * 60;

function formatCountdown(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

export function CheckoutView() {
  const router = useRouter();
  const { state, hydrated, category, label } = useTransaction();
  const { paymentMethods } = useCatalog();
  const [secondsLeft, setSecondsLeft] = useState(PAYMENT_WINDOW_SECONDS);
  const [loading, setLoading] = useState(true);

  const qris = paymentMethods.find((item) => item.type === "qris" && item.qrImage);
  const qrImage = qris?.qrImage || site.qrisImage;

  // Belum ada pesanan (misal halaman di-refresh setelah session habis) → balik ke beranda.
  useEffect(() => {
    if (!hydrated) return;
    if (!state.item || !state.trxId || !category) {
      router.replace("/#kategori");
      return;
    }
    setLoading(false);
  }, [hydrated, state.item, state.trxId, category, router]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((value) => (value > 0 ? value - 1 : 0));
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (loading || !category || !state.item) {
    return <p className="py-16 text-center text-muted">Memuat ringkasan transaksi…</p>;
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
            Periksa kembali sebelum membayar. Nomor tujuan yang salah tidak dapat
            dibatalkan.
          </p>
          <div className="row">
            <span>Kode Transaksi</span>
            <b>{state.trxId}</b>
          </div>
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
          <Link href={`/produk/${category.slug}`} className="btn btn-ghost btn-block">
            ← Ubah Pesanan
          </Link>
        </div>

        <div className="panel text-center">
          <span className="qris-tag">● Bayar dengan QRIS</span>
          <div className="qris-frame">
            {/* >>> GANTI public/qris-placeholder.svg DENGAN QRIS ASLI (PNG/JPG) <<< */}
            <Image
              src={optimizeCloudinaryUrl(qrImage, QR_TRANSFORM)}
              alt={`Kode QRIS ${site.name} untuk pembayaran`}
              width={300}
              height={300}
              loading="lazy"
              unoptimized
            />
          </div>
          <p className="mt-3.5 font-semibold">Total: {rupiah(state.total)}</p>
          <p className="hint">
            Scan pakai aplikasi bank / e-wallet apa pun yang mendukung QRIS.
          </p>
          <div className="sep" />
          <p className="hint mb-1">Selesaikan pembayaran dalam</p>
          <p className="timer" aria-live="polite">
            {secondsLeft > 0 ? formatCountdown(secondsLeft) : "Kedaluwarsa"}
          </p>
          <div className="h-4.5" />
          <button
            type="button"
            className="btn btn-orange btn-block"
            onClick={() => router.push("/status")}
          >
            Saya Sudah Bayar
          </button>
          <p className="hint">
            Kendala pembayaran?{" "}
            <a
              href={site.contact.whatsapp}
              target="_blank"
              rel="noopener"
              className="font-semibold text-tosca-dark"
            >
              Hubungi CS {site.contact.phoneDisplay}
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
