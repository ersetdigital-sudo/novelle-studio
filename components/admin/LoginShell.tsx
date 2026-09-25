import type { ReactNode } from "react";

import { Logo } from "@/components/ui/Logo";

export function LoginShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex w-full max-w-[1050px] flex-col overflow-hidden rounded-[40px] border-2 border-ink bg-white shadow-hard lg:min-h-[660px]">
      <div
        className="bg-ink px-6 pt-6 pb-11 text-white lg:hidden"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 24px), 0 100%)" }}
      >
        <Logo inverted />
        <p className="mt-5 max-w-[340px] font-display text-[26px] font-extrabold leading-[1.15]">
          Semua Kebutuhan Digital, Satu Genggaman.
        </p>
        <p className="mt-2 text-xs text-white/70">Panel internal · katalog, pesanan, konten</p>
      </div>

      <div
        className="absolute top-5 bottom-5 left-5 hidden w-[56%] flex-col justify-between overflow-hidden rounded-l-[32px] bg-ink p-8 text-white lg:flex"
        style={{ clipPath: "polygon(0 0, 100% 0, 88% 100%, 0% 100%)" }}
      >
        <Logo inverted />
        <div className="max-w-[82%]">
          <p className="font-display text-[40px] font-extrabold leading-[1.1]">
            Semua Kebutuhan Digital, Satu Genggaman.
          </p>
          <p className="mt-3 text-sm text-white/70">Panel internal · katalog, pesanan, konten</p>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-10 sm:px-8 lg:ml-[56%] lg:flex-1 lg:py-16 lg:pr-12 lg:pl-16">
        <div className="w-full max-w-[340px]">{children}</div>
      </div>
    </div>
  );
}
