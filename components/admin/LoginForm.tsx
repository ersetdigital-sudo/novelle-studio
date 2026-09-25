"use client";

import Link from "next/link";
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
    <form action={formAction}>
      <h1 className="font-display text-2xl font-extrabold lg:text-3xl">Masuk Panel Admin</h1>
      <p className="mt-2 mb-6 text-sm text-muted">
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

      <Link href="/" className="mt-6 block text-center text-sm font-semibold text-muted hover:text-ink">
        ← Kembali ke situs
      </Link>
    </form>
  );
}
