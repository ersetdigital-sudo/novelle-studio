import type { Testimonial } from "@/lib/types";

export type { Testimonial };

export const testimonials: readonly Testimonial[] = [
  {
    rating: 5,
    quote:
      "Biasanya saya ribet buka aplikasi bank buat token listrik. Di sini tinggal isi nomor meter, scan, token langsung keluar.",
    name: "Rina Kusmawati",
    role: "Ibu rumah tangga, Bekasi",
    initial: "R",
    color: "#0FB9A8",
  },
  {
    rating: 5,
    quote:
      "Yang saya suka: nggak disuruh bikin akun. Buka, bayar, tutup. Buat jualan pulsa kecil-kecilan di warung jadi gampang.",
    name: "Dimas Prakoso",
    role: "Pemilik warung, Sidoarjo",
    initial: "D",
    color: "#FF7A2F",
  },
  {
    rating: 4,
    quote:
      "Bayar angsuran motor dan BPJS sekaligus tanpa antre. Rincian biaya adminnya jelas dari awal, jadi tenang.",
    name: "Siti Anggraini",
    role: "Karyawan swasta, Bandung",
    initial: "S",
    color: "#2F3E9E",
  },
];
