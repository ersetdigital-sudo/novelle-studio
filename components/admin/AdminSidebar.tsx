"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Ringkasan" },
  { href: "/admin/pesanan", label: "Pesanan" },
  { href: "/admin/katalog", label: "Katalog & Harga" },
  { href: "/admin/pembayaran", label: "Pembayaran" },
  { href: "/admin/konten", label: "Konten Situs" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/admin") return pathname === "/admin";
  return pathname.startsWith(href);
}

export function AdminSidebar({
  brandName,
  authEnabled,
}: {
  brandName: string;
  authEnabled: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-60 shrink-0 bg-ink lg:block">
      <div className="sticky top-0 flex h-screen flex-col p-5">
        <div className="mb-7">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-tosca">
            Panel Admin
          </p>
          <p className="font-display text-lg font-extrabold text-white">{brandName}</p>
        </div>

        <nav aria-label="Navigasi admin" className="flex flex-col gap-1">
          {LINKS.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-tosca text-ink"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <Link
            href="/"
            target="_blank"
            className="text-xs font-semibold text-tosca hover:underline"
          >
            ↗ Lihat situs publik
          </Link>
          {!authEnabled && (
            <p className="mt-3 rounded-xl border-2 border-orange/40 bg-orange-soft px-3 py-2 text-[11px] font-medium text-orange-dark">
              Login admin mati. Isi ADMIN_PASSWORD sebelum Supabase tersambung.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Navigasi admin mobile"
      className="flex gap-1.5 overflow-x-auto border-b-2 border-line bg-white px-4 py-2.5 lg:hidden"
    >
      {LINKS.map((link) => {
        const active = isActive(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              active ? "bg-tosca text-ink" : "bg-cream text-muted"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
