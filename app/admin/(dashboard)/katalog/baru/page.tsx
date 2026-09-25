import Link from "next/link";

import { NewCategoryForm } from "@/components/admin/NewCategoryForm";

export const metadata = { title: "Tambah Kategori", robots: { index: false, follow: false } };

export default function AdminNewCategoryPage() {
  return (
    <>
      <header className="mb-5">
        <Link href="/admin/katalog" className="text-xs font-semibold text-tosca-dark hover:underline">
          ← Katalog
        </Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold">Tambah Kategori Baru</h1>
        <p className="mt-1 text-sm text-muted">
          Isi nama dan tampilannya saja — sisanya sudah ada isian awal.
        </p>
      </header>

      <NewCategoryForm />
    </>
  );
}
