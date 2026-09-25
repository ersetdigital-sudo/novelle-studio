"use client";

import { useState, useTransition } from "react";

import { setOrderStatusAction } from "@/app/admin/actions";
import { ORDER_STATUS_ACTIONS, ORDER_STATUS_LABEL } from "@/lib/store/status";
import type { ActionResult, Order, OrderStatus } from "@/lib/types";

/** Dropdown status per pesanan; hanya menawarkan transisi yang sah. */
export function OrderStatusSelect({ order }: { order: Order }) {
  const [pending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<ActionResult | null>(null);
  const [token, setToken] = useState(order.token);
  const [showToken, setShowToken] = useState(false);

  const options = ORDER_STATUS_ACTIONS[order.status];

  function submit(next: OrderStatus, withToken?: string) {
    startTransition(async () => {
      const result = await setOrderStatusAction(order.invoice, next, withToken);
      setFeedback(result);
      if (result.ok && next === "selesai" && withToken === undefined) {
        // Token dibuat server kalau admin tidak mengisinya.
        setShowToken(true);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {options.length > 0 ? (
        options.map((next) => (
          <button
            key={next}
            type="button"
            disabled={pending}
            className="rounded-full border-2 border-line bg-white px-3.5 py-1.5 text-[11px] font-bold text-ink transition-colors hover:border-tosca hover:text-tosca-dark disabled:opacity-50"
            onClick={() => {
              if (next === "selesai" && order.status !== "selesai") {
                setShowToken(true);
                return;
              }
              submit(next);
            }}
          >
            {next === "selesai" ? "✓ Tandai Selesai" : ORDER_STATUS_LABEL[next]}
          </button>
        ))
      ) : (
        <span className="text-[11px] text-muted">Status akhir — tidak bisa diubah.</span>
      )}

      {showToken && order.status !== "selesai" && (
        <span className="flex items-center gap-1.5">
          <input
            className="w-44 rounded-xl border-2 border-line bg-white px-3 py-1.5 text-[11px] font-semibold outline-none focus:border-tosca"
            placeholder="Nomor token (opsional)"
            value={token}
            onChange={(event) => setToken(event.target.value)}
          />
          <button
            type="button"
            disabled={pending}
            className="rounded-full bg-tosca px-3.5 py-1.5 text-[11px] font-bold text-white transition-opacity disabled:opacity-50"
            onClick={() => submit("selesai", token)}
          >
            {pending ? "…" : "Konfirmasi"}
          </button>
        </span>
      )}

      {feedback && (
        <span
          className={`text-[11px] font-semibold ${feedback.ok ? "text-tosca-dark" : "text-rose-600"}`}
          role="status"
        >
          {feedback.message}
        </span>
      )}
    </div>
  );
}
