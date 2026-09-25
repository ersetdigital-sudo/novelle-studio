import Link from "next/link";

import { FloatingCS } from "@/components/layout/FloatingCS";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { orderedCategories } from "@/lib/catalog";

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] pt-17.5 pb-22.5">
      <div className="wrap text-center">
        <p className="kicker">Error 404</p>
        <h1 className="mt-2 text-[34px] md:text-[44px]">Halaman tidak ditemukan</h1>
        <p className="mx-auto mt-3 max-w-[520px] text-muted">
          Kategori yang kamu cari belum tersedia atau alamatnya salah. Pilih salah
          satu layanan di bawah untuk mulai transaksi.
        </p>

        <div className="mt-7.5 flex flex-wrap justify-center gap-2.5">
          <Link href="/" className="btn btn-orange">
            Kembali ke Beranda
          </Link>
          <Link href="/cek-transaksi" className="btn btn-ghost">
            Cek Transaksi
          </Link>
        </div>

        <ul className="mx-auto mt-10 flex max-w-[720px] flex-wrap justify-center gap-2">
          {orderedCategories.map((category) => (
            <li key={category.slug}>
              <Link href={`/produk/${category.slug}`} className="chip">
                {category.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      </main>
      <Footer />
      <FloatingCS />
    </>
  );
}
