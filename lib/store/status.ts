import type { OrderStatus } from "@/lib/types";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  menunggu: "Menunggu Pembayaran",
  dibayar: "Menunggu Verifikasi",
  selesai: "Selesai",
  batal: "Dibatalkan",
};

export const ORDER_STATUS_TONE: Record<
  OrderStatus,
  "neutral" | "ok" | "wait" | "off"
> = {
  menunggu: "wait",
  dibayar: "wait",
  selesai: "ok",
  batal: "off",
};

/** Transisi yang ditawarkan dashboard untuk tiap status. */
export const ORDER_STATUS_ACTIONS: Record<OrderStatus, readonly OrderStatus[]> = {
  menunggu: ["dibayar", "batal"],
  dibayar: ["selesai", "batal", "menunggu"],
  selesai: [],
  batal: [],
};
