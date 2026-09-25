"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const FILTERS = [
  { value: "", label: "Semua" },
  { value: "menunggu", label: "Menunggu" },
  { value: "dibayar", label: "Menunggu Verifikasi" },
  { value: "selesai", label: "Selesai" },
  { value: "batal", label: "Dibatalkan" },
] as const;

export function OrderFilters({ counts }: { counts: Record<string, number> }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const active = searchParams.get("status") ?? "";

  return (
    <div className="flex flex-wrap gap-1.5" role="group" aria-label="Filter status pesanan">
      {FILTERS.map((filter) => {
        const isActive = active === filter.value;
        const href = filter.value
          ? `${pathname}?status=${encodeURIComponent(filter.value)}`
          : pathname;
        return (
          <Link
            key={filter.label}
            href={href}
            aria-pressed={isActive}
            className={`rounded-full border-2 px-3.5 py-1.5 text-xs font-bold transition-colors ${
              isActive
                ? "border-tosca bg-tosca text-white"
                : "border-line bg-white text-muted hover:border-tosca hover:text-tosca-dark"
            }`}
          >
            {filter.label}
            {(counts[filter.value] ?? 0) > 0 && (
              <span className="ml-1.5 opacity-70">{counts[filter.value]}</span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
