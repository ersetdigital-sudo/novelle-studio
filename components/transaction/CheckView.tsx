"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import { site } from "@/data/site";
import { formatFullDateTime, formatTime, rupiah } from "@/lib/format";
import { EmptyReceiptIcon, SearchIcon, TrackCheckIcon } from "@/lib/icons";
import type { Order } from "@/lib/types";
import { Breadcrumb } from "@/components/ui/Breadcrumb";

interface TimelineStep {
  title: string;
  subtitle: string;
  state: "done" | "now" | "next";
}

function buildTimeline(order: Order): TimelineStep[] {
  const time = formatTime(order.createdAt);
  const isPaid = order.status === "dibayar" || order.status === "selesai";
  const isDone = order.status === "selesai";
  const isCancelled = order.status === "batal";

  if (isCancelled) {
    return [
      { title: "Pesanan Dibuat", subtitle: `Invoice diterbitkan · ${time}`, state: "done" },
      { title: "Dibatalkan", subtitle: "Pesanan ini dibatalkan", state: "now" },
    ];
  }

  return [
    { title: "Pesanan Dibuat", subtitle: `Invoice diterbitkan · ${time}`, state: "done" },
    {
      title: "Pembayaran",
      subtitle: isPaid ? `Dilaporkan dibayar · ${time}` : "Menunggu pembayaran",
      state: isPaid ? "done" : "now",
    },
    {
      title: "Verifikasi Admin",
      subtitle: isDone ? "Pembayaran terverifikasi" : isPaid ? "Sedang dicek ke rekening" : "Menunggu pelaporan",
      state: isDone ? "done" : isPaid ? "now" : "next",
    },
    {
      title: "Selesai",
      subtitle: isDone
        ? order.token
          ? `Nomor token/serial: ${order.token}`
          : "Produk sudah masuk ke nomor tujuan"
        : "Menunggu penyelesaian",
      state: isDone ? "done" : "next",
    },
  ];
}

const STATUS_BADGE: Record<Order["status"], { label: string; tone: string }> = {
  menunggu: { label: "Menunggu Pembayaran", tone: "badge-wait" },
  dibayar: { label: "Menunggu Verifikasi", tone: "badge-wait" },
  selesai: { label: "Selesai", tone: "badge-ok" },
  batal: { label: "Dibatalkan", tone: "badge-wait" },
};

export function CheckView() {
  const searchParams = useSearchParams();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);

  const runCheck = useCallback(async (rawCode: string) => {
    const trimmed = rawCode.trim();
    if (!trimmed) {
      setError("Masukkan kode transaksi terlebih dahulu.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(`/api/cek-transaksi?invoice=${encodeURIComponent(trimmed)}`);
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { message?: string } | null;
        setError(data?.message ?? "Gagal memeriksa transaksi.");
        return;
      }
      const data = (await response.json()) as { order: Order | null };
      if (!data.order) {
        setError(
          `Invoice ${trimmed.toUpperCase()} tidak ditemukan. Pastikan kodenya benar — contoh: NVL2648173142.`,
        );
        return;
      }
      setResult(data.order);
    } finally {
      setLoading(false);
    }
  }, []);

  // Invoice bisa dikirim lewat URL: /cek-transaksi?kode=NVL…
  useEffect(() => {
    const prefill = searchParams.get("kode");
    if (prefill) {
      setCode(prefill);
      void runCheck(prefill);
    }
  }, [searchParams, runCheck]);

  const timeline = result ? buildTimeline(result) : [];

  return (
    <>
      <Breadcrumb items={[{ label: "Cek Transaksi" }]} />

      <div className="mx-auto mb-6.5 max-w-[720px] text-center">
        <h1 className="text-[32px] tracking-[-0.6px] md:text-[42px]">Lacak transaksi kamu</h1>
        <p className="mt-2 text-muted">
          Masukkan kode invoice yang kamu terima setelah membuat pesanan. Tidak perlu akun — cukup
          kodenya.
        </p>
      </div>

      <div className="mx-auto max-w-[720px] rounded-lg border-2 border-ink bg-white p-5.5 shadow-hard">
        <form
          onSubmit={(event) => {
            event.preventDefault();
            void runCheck(code);
          }}
        >
          <label className="label-fl" htmlFor="kode-transaksi">
            Kode Invoice
          </label>
          <div className="flex flex-col gap-2.5 min-[620px]:flex-row">
            <input
              id="kode-transaksi"
              className="input flex-1 font-display font-bold tracking-[1px]"
              placeholder="NVL12345678"
              autoComplete="off"
              value={code}
              onChange={(event) => {
                setCode(event.target.value);
                setError("");
              }}
            />
            <button type="submit" className="btn btn-orange" disabled={loading}>
              <SearchIcon />
              {loading ? "Mencari…" : "Lacak"}
            </button>
          </div>
        </form>
        <p className="hint">Format kode: NVL diikuti angka. Contoh: NVL2648173142</p>
        {error && (
          <p className="err" role="alert">
            {error}
          </p>
        )}
      </div>

      {!result && !loading && (
        <div className="mx-auto mt-6.5 max-w-[720px] rounded-lg border-2 border-dashed border-line px-5 py-8.5 text-center text-muted">
          <span className="mx-auto mb-3.5 block w-fit">
            <EmptyReceiptIcon />
          </span>
          <b className="block font-display text-[17px] text-ink">Belum ada yang dilacak</b>
          <span className="text-sm">
            Masukkan kode invoice di atas untuk melihat statusnya.
          </span>
        </div>
      )}

      {result && (
        <div className="mx-auto mt-6.5 max-w-[720px] fadein">
          <div className="panel">
            <div className="mb-1.5 flex flex-wrap items-start justify-between gap-3.5">
              <div>
                <h2 className="text-[22px]">
                  {result.categoryLabel} · {result.itemLabel}
                </h2>
                <span className="hint m-0 block">{formatFullDateTime(result.createdAt)}</span>
              </div>
              <span className={`badge ${STATUS_BADGE[result.status].tone}`}>
                {STATUS_BADGE[result.status].label}
              </span>
            </div>

            <div className="sep" />

            <ol className="my-1 mb-1.5 flex flex-col">
              {timeline.map((step, index) => (
                <li key={step.title} className="tstep" data-state={step.state}>
                  <span className="dotline" aria-hidden="true">
                    <span className="dot">
                      {step.state === "done" ? <TrackCheckIcon /> : null}
                    </span>
                    {index < timeline.length - 1 && <span className="bar" />}
                  </span>
                  <span className="tbody pb-4">
                    <b>{step.title}</b>
                    <span>{step.subtitle}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="sep" />
            <div className="row">
              <span>Kode Invoice</span>
              <b>{result.invoice}</b>
            </div>
            <div className="row">
              <span>{result.accountLabel}</span>
              <b>{result.accountId}</b>
            </div>
            <div className="row">
              <span>Metode Bayar</span>
              <b>{result.paymentMethodName || "QRIS"}</b>
            </div>
            <div className="row row-total">
              <span>Total</span>
              <b>{rupiah(result.total)}</b>
            </div>
            {result.token && (
              <>
                <div className="sep" />
                <div className="row">
                  <span>Nomor Token / Serial</span>
                  <b className="tracking-[1px]">{result.token}</b>
                </div>
              </>
            )}
            <div className="sep" />
            <div className="flex flex-wrap gap-2.5">
              {result.status === "menunggu" && (
                <Link href={`/pembayaran/${result.invoice}`} className="btn btn-orange">
                  Lanjutkan Pembayaran
                </Link>
              )}
              <Link href="/#kategori" className="btn btn-tosca">
                Transaksi Lagi
              </Link>
              <a
                href={site.contact.whatsapp}
                target="_blank"
                rel="noopener"
                className="btn btn-ghost"
              >
                Laporkan Kendala
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
