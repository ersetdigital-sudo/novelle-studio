"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

import { checkLink, navLinks } from "@/data/site";
import { BurgerIcon, SearchIcon } from "@/lib/icons";
import { Logo } from "@/components/ui/Logo";

const menuLinkClass =
  "rounded-full px-3 py-2 text-[14.5px] font-medium text-muted transition-colors hover:bg-tosca-soft hover:text-tosca-dark";
const menuLinkActiveClass = "bg-tosca-soft text-tosca-dark";

/** Menu dianggap aktif untuk halaman terkait (mis. "Produk" saat di /produk/*). */
function isActiveHref(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  if (href === "/#kategori") return pathname.startsWith("/produk");
  if (href === checkLink.href) return pathname.startsWith(checkLink.href);
  return false;
}

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const menuRef = useRef<HTMLDivElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // Tutup menu mobile setiap kali pindah halaman.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Tutup saat klik di luar area menu (atau tombol burger) dan saat tekan Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || burgerRef.current?.contains(target)) return;
      setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-60 border-b-2 border-[#f0e3d6] bg-cream/92 backdrop-blur-[10px]">
      <div className="wrap flex h-[74px] items-center gap-4">
        <Logo />

        <nav aria-label="Navigasi utama" className="mx-auto hidden min-[960px]:flex gap-0.5">
          {navLinks.map((link) => {
            const isActive = isActiveHref(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActive ? "page" : undefined}
                className={`${menuLinkClass}${isActive ? ` ${menuLinkActiveClass}` : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto hidden items-center gap-3 min-[960px]:flex">
          <Link
            href={checkLink.href}
            aria-current={isActiveHref(pathname, checkLink.href) ? "page" : undefined}
            className="flex items-center gap-1.5 text-[14.5px] font-semibold text-tosca-dark hover:text-orange"
          >
            <SearchIcon />
            {checkLink.label}
          </Link>
          <span className="h-6 w-px bg-line" aria-hidden="true" />
          <Link href="/#kategori" className="btn btn-orange px-5 py-3 text-[15px]">
            Mulai Transaksi
          </Link>
        </div>

        <button
          ref={burgerRef}
          type="button"
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="menu-mobile"
          aria-label={open ? "Tutup menu" : "Buka menu"}
          className="ml-auto grid h-11 w-11 cursor-pointer place-items-center rounded-xl border-2 border-line bg-white min-[960px]:hidden"
        >
          <BurgerIcon />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            ref={menuRef}
            id="menu-mobile"
            // Animasi slide-down: tinggi panel tumbuh dari 0, tanpa lompatan layout.
            initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-b-2 border-[#f0e3d6] bg-cream min-[960px]:hidden"
          >
            <nav
              aria-label="Navigasi mobile"
              className="flex flex-col gap-1 px-5 pt-2 pb-5"
            >
              {navLinks.map((link) => {
                const isActive = isActiveHref(pathname, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={isActive ? "page" : undefined}
                    // Anchor dalam halaman tidak mengubah pathname, jadi menu ditutup manual.
                    onClick={() => setOpen(false)}
                    className={`rounded-xl px-3.5 py-2.75 font-medium ${
                      isActive ? "bg-tosca-soft text-tosca-dark" : "bg-white"
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="my-2 h-px bg-line" aria-hidden="true" />

              <Link
                href={checkLink.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.75 font-medium text-tosca-dark"
              >
                <SearchIcon />
                {checkLink.label}
              </Link>
              <Link
                href="/#kategori"
                onClick={() => setOpen(false)}
                className="btn btn-orange mt-1.5 w-full"
              >
                Mulai Transaksi
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
