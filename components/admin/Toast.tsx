"use client";

import { useCallback, useState } from "react";

export interface ToastState {
  message: string;
  tone: "ok" | "error";
}

/** Umpan balik setelah simpan; cukup satu pesan per form. */
export function useToast() {
  const [toast, setToast] = useState<ToastState | null>(null);

  const show = useCallback((message: string, tone: "ok" | "error" = "ok") => {
    setToast({ message, tone });
  }, []);

  const clear = useCallback(() => setToast(null), []);

  return { toast, show, clear };
}

export function Toast({ toast }: { toast: ToastState | null }) {
  if (!toast) return null;
  return (
    <p
      role="status"
      aria-live="polite"
      className={`rounded-xl border-2 px-4 py-3 text-xs font-semibold ${
        toast.tone === "ok"
          ? "border-tosca bg-tosca-soft text-tosca-dark"
          : "border-rose-200 bg-rose-50 text-rose-700"
      }`}
    >
      {toast.message}
    </p>
  );
}
