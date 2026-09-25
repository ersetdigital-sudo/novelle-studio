import Link from "next/link";

import { Badge, Card } from "@/components/admin/fields";
import { getCategoryOverview } from "@/lib/store/catalog";
import { rupiah } from "@/lib/format";

export const metadata = { title: "Katalog & Harga", robots: { index: false, follow: false } };

export default async function AdminCatalogPage() {
  const { overview, error } = await getCategoryOverview();

  return (
    <>
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-extrabold">Katalog &amp; Harga</h1>
          <p className="mt-1 text-sm text-muted">
            Pilih kategori untuk mengatur nominal, harga, dan biaya adminnya.
          </p>
        </div>
        <Link href="/admin/katalog/baru" className="btn btn-orange px-4 py-2 text-sm">
          + Tambah Kategori
        </Link>
      </header>

      {error && (
        <p className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {overview.map((item) => (
          <Link key={item.slug} href={`/admin/katalog/${item.slug}`} className="block">
            <Card
              title={item.name}
              description={item.short}
              action={
                <span className="flex items-center gap-1.5">
                  {item.isCustom && <Badge tone="neutral">custom</Badge>}
                  {item.isActive ? <Badge tone="ok">aktif</Badge> : <Badge tone="off">disembunyikan</Badge>}
                </span>
              }
            >
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted">
                <span>
                  <b className="text-ink">{item.itemCount}</b> nominal
                </span>
                <span>
                  admin <b className="text-ink">{rupiah(item.adminFee)}</b>
                </span>
                <span>
                  mulai <b className="text-tosca-dark">{rupiah(item.startingPrice)}</b>
                </span>
                {item.hasAltVariant && <Badge tone="wait">punya daftar alt</Badge>}
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
