import Link from "next/link";

import { Badge, Card } from "@/components/admin/fields";
import { getCategoryOverview } from "@/lib/store/catalog";
import { getContentSnapshot } from "@/lib/store/content";
import { getOrderStats, listOrders } from "@/lib/store/orders";
import { formatDateTime, rupiah } from "@/lib/format";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/store/status";

export const metadata = { title: "Ringkasan", robots: { index: false, follow: false } };

export default async function AdminOverviewPage() {
  const [stats, recent, overview, { content }] = await Promise.all([
    getOrderStats(),
    listOrders({ limit: 6 }),
    getCategoryOverview(),
    getContentSnapshot(),
  ]);

  const metrics = [
    { label: "Pendapatan terverifikasi", value: rupiah(stats.revenueVerified), hint: "status selesai" },
    { label: "Menunggu pembayaran", value: stats.pending, hint: "invoice aktif" },
    { label: "Menunggu verifikasi", value: stats.awaitingReview, hint: "klaim 'sudah bayar'" },
    { label: "Pesanan selesai", value: stats.done, hint: `${stats.total} total` },
  ];

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold">Ringkasan</h1>
        <p className="mt-1 text-sm text-muted">
          Pantau pesanan masuk dan kelola isi situs dari satu tempat.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-2xl border-2 border-ink bg-white p-5 shadow-hard">
            <p className="text-xs font-semibold text-muted">{metric.label}</p>
            <p className="mt-1.5 font-display text-2xl font-extrabold">{metric.value}</p>
            <p className="mt-1 text-[11px] text-muted">{metric.hint}</p>
          </div>
        ))}
      </div>

      {stats.claimedAmount > 0 && (
        <p className="rounded-2xl border-2 border-orange-soft bg-orange-soft/60 px-4 py-3.5 text-xs text-orange-dark">
          Ada <b>{rupiah(stats.claimedAmount)}</b> klaim pembayaran yang belum diverifikasi —
          angka itu belum masuk pendapatan. Cek rekening lalu ubah statusnya di halaman Pesanan.
        </p>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        <Card
          title="Harga per kategori"
          description={`${overview.overview.length} kategori terdaftar`}
          action={
            <Link href="/admin/katalog" className="text-xs font-bold text-tosca-dark hover:underline">
              Kelola
            </Link>
          }
        >
          <ul className="divide-y divide-line">
            {overview.overview.map((item) => (
              <li key={item.slug} className="flex items-center gap-3 py-2.5">
                <Link href={`/admin/katalog/${item.slug}`} className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-bold">{item.name}</span>
                  <span className="text-[11px] text-muted">
                    {item.activeItemCount}/{item.itemCount} nominal aktif · admin {rupiah(item.adminFee)}
                  </span>
                </Link>
                <span className="text-xs font-bold text-tosca-dark">{rupiah(item.startingPrice)}</span>
                {item.isActive ? <Badge tone="ok">aktif</Badge> : <Badge tone="off">disembunyikan</Badge>}
              </li>
            ))}
          </ul>
        </Card>

        <Card
          title="Pesanan terbaru"
          action={
            <Link href="/admin/pesanan" className="text-xs font-bold text-tosca-dark hover:underline">
              Lihat semua
            </Link>
          }
        >
          {recent.length === 0 ? (
            <p className="py-8 text-center text-xs text-muted">
              Belum ada pesanan. Akan muncul otomatis begitu ada yang top up.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-2.5 py-2.5">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold">{order.invoice}</p>
                    <p className="truncate text-[11px] text-muted">
                      {order.categoryLabel} · {order.itemLabel} · {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                  <span className="text-xs font-bold">{rupiah(order.total)}</span>
                  <Badge tone={ORDER_STATUS_TONE[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <p className="text-[11px] text-muted">
        Brand aktif: {content.settings.name} · {content.settings.tagline}
      </p>
    </>
  );
}
