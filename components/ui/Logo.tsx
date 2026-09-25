import Link from "next/link";

import { site } from "@/data/site";

interface LogoProps {
  /** Versi footer memakai teks putih. */
  inverted?: boolean;
  /** Kalau false, logo dirender tanpa link (dipakai di footer brand block). */
  asLink?: boolean;
}

export function Logo({ inverted = false, asLink = true }: LogoProps) {
  const content = (
    <span className="logo flex shrink-0 items-center gap-2.5">
      <span className="logo-mark" aria-hidden="true">
        <span>N</span>
      </span>
      <span className={`brand-name${inverted ? " text-white" : ""}`}>
        {site.shortName}
        <i>.</i>Studio
      </span>
    </span>
  );

  if (!asLink) return content;

  return (
    <Link href="/" aria-label={`${site.name} — beranda`} className="flex items-center">
      {content}
    </Link>
  );
}
