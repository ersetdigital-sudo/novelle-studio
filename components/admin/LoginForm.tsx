"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/admin/actions";
import { inputClass, labelClass } from "@/components/admin/fields";
import type { ActionResult } from "@/lib/types";

export function LoginForm() {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    loginAction,
    null,
  );

  return (
    <div className="mx-auto w-full max-w-sm pt-16">
      <form action={formAction} className="rounded-2xl border-2 border-ink bg-white p-6 shadow-hard">
        <h1 className="font-display text-xl font-extrabold">Masuk Panel Admin</h1>
        <p className="mt-1 mb-5 text-xs text-muted">
          Masukkan password admin untuk mengelola katalog, pesanan, dan konten.
        </p>

        <label className="block">
          <span className={labelClass}>Password</span>
          <input
            className={inputClass}
            type="password"
            name="password"
            autoComplete="current-password"
            required
            autoFocus
          />
        </label>

        {state && !state.ok && (
          <p className="mt-3 rounded-xl border-2 border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700" role="alert">
            {state.message}
          </p>
        )}

        <button type="submit" className="btn btn-orange btn-block mt-5" disabled={pending}>
          {pending ? "Memeriksa…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}
