"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { formatDateTime, rupiah } from "@/lib/format";
import { SpinnerIcon, SuccessIcon } from "@/lib/icons";
import { useTransaction } from "@/providers/TransactionProvider";
import { useContact } from "@/components/public/ContactProvider";
import { FlowSteps } from "@/components/ui/FlowSteps";

/** Simulasi verifikasi pembayaran oleh sistem. */
const VERIFICATION_DELAY_MS = 3500;

export function StatusView() {
  const router = useRouter();
  const { state, hydrated, category, label, finishPayment } = useTransaction();
  const { whatsapp } = useContact();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hydrated) return;
    if (!state.trxId || !state.item || !category) {
      router.replace("/#kategori");
      return;
    }
    setLoading(false);
  }, [hydrated, state.trxId, state.item, category, router]);

  // Pesanan baru: tampilkan status menunggu, lalu selesaikan otomatis.
  useEffect(() => {
    if (!hydrated || !state.trxId || !state.item || state.status === "ok") return;
    const timer = window.setTimeout(() => finishPayment(), VERIFICATION_DELAY_MS);
    return () => window.clearTimeout(timer);
  }, [hydrated, state.trxId, state.item, state.status, finishPayment]);

  if (loading || !category || !state.item) {
    return <p className="py-16 text-center text-muted">Memuat status transaksi…</p>;
  }

  const isSuccess = state.status === "ok";

  return (
    <>
      <FlowSteps activeStep={3} />

      <div className="mx-auto max-w-[560px] text-center">
        <div
          className={`status-ic ${isSuccess ? "status-ic-ok" : "status-ic-wait"}`}
          aria-hidden="true"
        >
          {isSuccess ? (
            <span className="pop">
              <SuccessIcon />
            </span>
          ) : (
            <SpinnerIcon />
          )}
        </div>

        <h2 className="mb-2 text-[28px]">
          {isSuccess ? "Transaksi Berhasil" : "Menunggu Konfirmasi Pembayaran"}
        </h2>
        <p className="mb-6 text-muted" aria-live="polite">
          {isSuccess
            ? "Pembayaran diterima dan pesanan sudah diproses ke penyedia layanan."
            : "Kami sedang memverifikasi pembayaran QRIS kamu. Jangan tutup halaman ini."}
        </p>

        <div className="receipt">
          <div className="row">
            <span>Status</span>
            <b>
              <span className={`badge ${isSuccess ? "badge-ok" : "badge-wait"}`}>
                {isSuccess ? "Transaksi Berhasil" : "Menunggu Konfirmasi"}
              </span>
            </b>
          </div>
          <div className="row">
            <span>Kode Transaksi</span>
            <b>{state.trxId}</b>
          </div>
          <div className="row">
            <span>Waktu</span>
            <b>{state.paidAt ? formatDateTime(state.paidAt) : "—"}</b>
          </div>
          <div className="sep" />
          <div className="row">
            <span>Produk</span>
            <b>
              {label} · {state.item.nama}
            </b>
          </div>
          <div className="row">
            <span>{category.field.label}</span>
            <b>{state.number}</b>
          </div>
          <div className="row">
            <span>Metode Bayar</span>
            <b>QRIS</b>
          </div>
          <div className="row row-total">
            <span>Total Dibayar</span>
            <b>{rupiah(state.total)}</b>
          </div>
          {isSuccess && state.token && (
            <>
              <div className="sep" />
              <div className="row">
                <span>Nomor Token / Serial</span>
                <b className="tracking-[1px]">{state.token}</b>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-wrap justify-center gap-2.5">
          <Link href="/#kategori" className="btn btn-tosca">
            Transaksi Lagi
          </Link>
          <Link
            href={`/cek-transaksi?kode=${encodeURIComponent(state.trxId)}`}
            className="btn btn-ghost"
          >
            Cek Transaksi Ini
          </Link>
          <Link href="/" className="btn btn-ghost">
            Kembali ke Beranda
          </Link>
        </div>

        <p className="hint mt-4.5">
          Simpan kode transaksi ini sebagai bukti. Butuh bantuan?{" "}
          <a
            href={whatsapp}
            target="_blank"
            rel="noopener"
            className="font-semibold text-tosca-dark"
          >
            Chat CS
          </a>
        </p>
      </div>
    </>
  );
}
