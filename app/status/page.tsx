import { redirect } from "next/navigation";

/**
 * Alur lama /status sudah digantikan /pembayaran/[invoice] dan /cek-transaksi.
 * Route ini hanya menjembatani tautan lama.
 */
export default function LegacyStatusPage() {
  redirect("/cek-transaksi");
}
