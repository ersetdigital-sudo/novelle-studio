"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const ICONS = {
  ringkasan: (
    <>
      <rect x="3" y="3" width="7" height="9" rx="1.5" />
      <rect x="14" y="3" width="7" height="5" rx="1.5" />
      <rect x="14" y="12" width="7" height="9" rx="1.5" />
      <rect x="3" y="16" width="7" height="5" rx="1.5" />
    </>
  ),
  pesanan: (
    <>
      <path d="M8 5H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <rect x="8" y="3" width="8" height="4" rx="1" />
      <path d="M8 12h8" />
      <path d="M8 16h5" />
    </>
  ),
  katalog: (
    <>
      <path d="M12.6 2.6A2 2 0 0 0 11.2 2H4a2 2 0 0 0-2 2v7.2a2 2 0 0 0 .6 1.4l8.7 8.7a2.4 2.4 0 0 0 3.4 0l6.6-6.6a2.4 2.4 0 0 0 0-3.4z" />
      <path d="M7 7h.01" />
    </>
  ),
  pembayaran: (
    <>
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <path d="M2 10h20" />
      <path d="M6 15h4" />
    </>
  ),
  konten: (
    <>
      <circle cx="12" cy="12" r="9.5" />
      <path d="M12 2.5a15 15 0 0 1 0 19 15 15 0 0 1 0-19" />
      <path d="M2.5 12h19" />
    </>
  ),
  external: (
    <>
      <path d="M7 17 17 7" />
      <path d="M8 7h9v9" />
    </>
  ),
} as const;

const LINKS = [
  { href: "/admin", label: "Ringkasan", icon: ICONS.ringkasan },
  { href: "/admin/pesanan", label: "Pesanan", icon: ICONS.pesanan },
  { href: "/admin/katalog", label: "Katalog & Harga", icon: ICONS.katalog },
  { href: "/admin/pembayaran", label: "Pembayaran", icon: ICONS.pembayaran },
  { href: "/admin/konten", label: "Konten Situs", icon: ICONS.konten },
] as const;

function MenuIcon({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {children}
    </svg>
  );
}

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
                className={`flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-colors ${
                  active
                    ? "bg-tosca text-ink"
                    : "text-white/75 hover:bg-white/10 hover:text-white"
                }`}
              >
                <MenuIcon className="size-[18px] shrink-0">{link.icon}</MenuIcon>
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto pt-4">
          <Link
            href="/"
            target="_blank"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-tosca hover:underline"
          >
            <MenuIcon className="size-3.5 shrink-0">{ICONS.external}</MenuIcon>
            Lihat situs publik
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
            className={`flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${
              active ? "bg-tosca text-ink" : "bg-cream text-muted"
            }`}
          >
            <MenuIcon className="size-3.5 shrink-0">{link.icon}</MenuIcon>
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
