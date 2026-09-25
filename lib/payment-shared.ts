import type { PaymentMethod } from "@/lib/types";

/**
 * Util metode pembayaran yang aman dipakai di client & server
 * (tanpa import node:fs / env supaya tidak bocor ke bundle browser).
 */
export function isPaymentMethodReady(method: PaymentMethod): boolean {
  if (method.type === "qris") return method.qrImage.trim().length > 0;
  return method.accountNumber.trim().length > 0;
}

/** Instruksi bawaan kalau admin tidak mengisi langkah pembayaran. */
export function defaultInstructions(method: PaymentMethod): string[] {
  if (method.type === "qris") {
    return [
      "Buka aplikasi bank atau e-wallet yang mendukung QRIS.",
      "Scan kode QR di halaman pembayaran.",
      "Pastikan nominalnya sama dengan total pesanan, lalu bayar.",
    ];
  }
  return [
    `Salin ${method.accountLabel.toLowerCase()} di halaman pembayaran.`,
    "Buka aplikasi bank atau e-wallet, lalu kirim jumlah sesuai total.",
    "Simpan bukti transfer untuk konfirmasi.",
  ];
}
