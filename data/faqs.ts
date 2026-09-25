import type { Faq } from "@/lib/types";

export type { Faq };

export const faqs: readonly Faq[] = [
  {
    question: "Apakah harus mendaftar atau login dulu?",
    answer:
      "Tidak sama sekali. Novelle Studio memakai sistem guest checkout — cukup isi nomor tujuan, pilih nominal, lalu bayar. Tidak ada akun, tidak ada password.",
  },
  {
    question: "Berapa lama pesanan saya diproses?",
    answer:
      "Setelah pembayaran QRIS dikonfirmasi, mayoritas transaksi selesai di bawah 30 detik. Untuk tagihan seperti PDAM dan BPJS, status resmi bisa memerlukan waktu hingga 1x24 jam mengikuti sistem penyedia layanan.",
  },
  {
    question: "Bagaimana kalau saya salah memasukkan nomor tujuan?",
    answer:
      "Transaksi yang sudah diproses tidak dapat dibatalkan. Mohon periksa kembali nomor tujuan pada halaman ringkasan sebelum melakukan pembayaran.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Saat ini seluruh pembayaran dilakukan melalui QRIS, sehingga bisa dibayar dari aplikasi bank mana pun maupun e-wallet seperti DANA, OVO, GoPay, dan ShopeePay.",
  },
  {
    question: "Apakah ada biaya admin tersembunyi?",
    answer:
      "Tidak ada. Biaya admin selalu ditampilkan terpisah pada ringkasan transaksi sebelum Anda membayar.",
  },
  {
    question: "Bagaimana cara menyimpan bukti transaksi?",
    answer:
      "Setiap transaksi memiliki kode unik yang muncul di halaman status. Simpan atau tangkap layar kode tersebut, lalu sertakan saat menghubungi CS bila ada kendala.",
  },
];
