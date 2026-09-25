"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, useTransition } from "react";

import { claimPaymentAction } from "@/app/public-actions";
import { QR_TRANSFORM, optimizeCloudinaryUrl } from "@/lib/cloudinary";
import { rupiah } from "@/lib/format";
import { useCatalog } from "@/components/public/CategoryProvider";
import type { Order, PaymentMethod } from "@/lib/types";

/** Jendela pembayaran 15 menit sejak pesanan dibuat (created_at, bukan waktu buka halaman). */
const PAYMENT_WINDOW_MS = 15 * 60 * 1000;

function formatCountdown(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  return `${minutes}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

export function PaymentDetail({ order }: { order: Order }) {
  const { paymentMethods } = useCatalog();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const method: PaymentMethod | undefined = useMemo(
    () => paymentMethods.find((item) => item.id === order.paymentMethodId) ?? paymentMethods[0],
    [paymentMethods, order.paymentMethodId],
  );

  // Hitung mundur dari waktu pesanan dibuat di server.
  const deadline = useMemo(
    () => new Date(order.createdAt).getTime() + PAYMENT_WINDOW_MS,
    [order.createdAt],
  );
  const [remaining, setRemaining] = useState(() => deadline - Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setRemaining(deadline - Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [deadline]);

  const expired = remaining <= 0;
  const settled = order.status === "selesai" || order.status === "dibayar" || order.status === "batal";

  function claim() {
    setMessage("");
    startTransition(async () => {
      const result = await claimPaymentAction(order.invoice);
      setMessage(result.message);
    });
  }

  return (
    <div className="panel text-center">
      <span className="qris-tag">● {method?.name ?? "Metode Pembayaran"}</span>

      {method?.type === "qris" && method.qrImage ? (
        <div className="qris-frame">
          <Image
            src={optimizeCloudinaryUrl(method.qrImage, QR_TRANSFORM)}
            alt={`Kode ${method.name} untuk pembayaran ${order.invoice}`}
            width={300}
            height={300}
            loading="lazy"
            unoptimized
          />
        </div>
      ) : null}

      {method?.type === "transfer" && method.accountNumber ? (
        <div className="mx-auto mt-2 max-w-[280px] rounded-md border-2 border-line bg-cream p-4">
          <p className="text-[11px] font-semibold text-muted">{method.accountLabel}</p>
          <p className="mt-1 font-display text-xl font-extrabold tracking-[1px]">
            {method.accountNumber}
          </p>
          {method.accountName && <p className="text-xs text-muted">{method.accountName}</p>}
          <button
            type="button"
            className="btn btn-ghost mt-3 px-4 py-2 text-xs"
            onClick={() => void navigator.clipboard?.writeText(method.accountNumber)}
          >
            Salin Nomor
          </button>
        </div>
      ) : null}

      {method?.instructions.length ? (
        <ol className="mx-auto mt-4 max-w-[300px] list-decimal space-y-1 pl-5 text-left text-xs text-muted">
          {method.instructions.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      ) : null}

      <p className="mt-4 font-semibold">Total: {rupiah(order.total)}</p>

      <div className="sep" />
      <p className="hint mb-1">
        {expired ? "Waktu pembayaran habis" : "Selesaikan pembayaran dalam"}
      </p>
      <p className="timer" aria-live="polite">
        {expired ? "Kedaluwarsa" : formatCountdown(remaining)}
      </p>
      <div className="h-4.5" />

      {order.status === "menunggu" && !expired ? (
        <button type="button" className="btn btn-orange btn-block" disabled={pending} onClick={claim}>
          {pending ? "Mengirim…" : "Saya Sudah Bayar"}
        </button>
      ) : settled ? (
        <p className="hint">
          Pembayaran dilaporkan — status terkini bisa dilihat di{" "}
          <a href="/cek-transaksi" className="font-semibold text-tosca-dark">
            Cek Transaksi
          </a>
          .
        </p>
      ) : expired ? (
        <p className="hint">Buat pesanan baru untuk mendapatkan kode pembayaran lagi.</p>
      ) : null}

      {message && (
        <p className="hint mt-2 font-semibold text-tosca-dark" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
