import Link from "next/link";

import { Badge, Card } from "@/components/admin/fields";
import { OrderFilters } from "@/components/admin/OrdersTable";
import { OrderStatusSelect } from "@/components/admin/OrderStatusSelect";
import { formatDateTime, rupiah } from "@/lib/format";
import { listOrders } from "@/lib/store/orders";
import { ORDER_STATUS_LABEL, ORDER_STATUS_TONE } from "@/lib/store/status";
import { isOrderStatus } from "@/lib/store/orders";
import type { OrderStatus } from "@/lib/types";

export const metadata = { title: "Pesanan", robots: { index: false, follow: false } };

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const filter: OrderStatus | undefined =
    status && isOrderStatus(status) ? status : undefined;

  const [orders, all] = await Promise.all([
    listOrders({ status: filter }),
    listOrders(),
  ]);

  const counts: Record<string, number> = {
    "": all.length,
    menunggu: all.filter((o) => o.status === "menunggu").length,
    dibayar: all.filter((o) => o.status === "dibayar").length,
    selesai: all.filter((o) => o.status === "selesai").length,
    batal: all.filter((o) => o.status === "batal").length,
  };

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold">Pesanan</h1>
        <p className="mt-1 text-sm text-muted">
          Verifikasi pembayaran, isi nomor token, lalu tandai selesai.
        </p>
      </header>

      <OrderFilters counts={counts} />

      <div className="mt-4 space-y-3">
        {orders.length === 0 ? (
          <Card>
            <p className="py-8 text-center text-xs text-muted">
              {filter
                ? `Tidak ada pesanan berstatus "${ORDER_STATUS_LABEL[filter]}".`
                : "Belum ada pesanan masuk."}
            </p>
          </Card>
        ) : (
          orders.map((order) => (
            <Card key={order.id}>
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm font-extrabold">{order.invoice}</span>
                    <Badge tone={ORDER_STATUS_TONE[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {order.categoryLabel} · {order.itemLabel}
                  </p>
                  <p className="mt-0.5 text-xs">
                    <span className="text-muted">{order.accountLabel}:</span>{" "}
                    <b>{order.accountId}</b>
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted">
                    {order.paymentMethodName || "—"} · {formatDateTime(order.createdAt)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] text-muted">
                    {rupiah(order.subtotal)} + admin {rupiah(order.fee)}
                  </p>
                  <p className="font-display text-lg font-extrabold text-orange">
                    {rupiah(order.total)}
                  </p>
                </div>
              </div>

              <div className="mt-3 border-t-2 border-dashed border-line pt-3">
                <OrderStatusSelect order={order} />
              </div>
            </Card>
          ))
        )}
      </div>

      <p className="mt-4 text-[11px] text-muted">
        Butuh daftar mentah?{" "}
        <Link href="/admin" className="font-semibold text-tosca-dark hover:underline">
          kembali ke ringkasan
        </Link>
        .
      </p>
    </>
  );
}
