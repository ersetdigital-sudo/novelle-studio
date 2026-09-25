import type { Promo } from "@/lib/types";

export type { Promo };

export const promos: readonly Promo[] = [
  {
    code: "KODE: NOVEL5",
    title: "Cashback 5% Token PLN",
    description: "Maksimal Rp10.000 untuk pembelian token mulai Rp100.000.",
    variant: "tosca",
  },
  {
    code: "KODE: DATAHEMAT",
    title: "Diskon Rp3.000",
    description: "Berlaku untuk semua paket data di atas 5GB.",
    variant: "orange",
  },
  {
    code: "OTOMATIS",
    title: "Gratis Admin BPJS",
    description: "Setiap Jumat, biaya admin BPJS Kesehatan kami tanggung.",
    variant: "indigo",
  },
];
