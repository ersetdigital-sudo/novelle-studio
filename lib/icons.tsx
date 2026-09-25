import type { CategorySlug } from "@/lib/types";

type IconProps = { className?: string };

/** Ikon kategori — warna mengikuti tint masing-masing kategori di data/catalog.ts. */
export function CategoryIcon({
  slug,
  className,
}: IconProps & { slug: CategorySlug }) {
  const common = { width: 26, height: 26, viewBox: "0 0 24 24", fill: "none" };

  switch (slug) {
    case "pulsa":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <rect x="6" y="2" width="12" height="20" rx="3" fill="#0FB9A8" />
          <rect x="8" y="5" width="8" height="12" rx="1.5" fill="#fff" />
          <circle cx="12" cy="19.3" r="1.1" fill="#fff" />
        </svg>
      );
    case "pln":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#FF7A2F" />
        </svg>
      );
    case "data":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path
            d="M2 8.5a14 14 0 0120 0"
            stroke="#2F3E9E"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M5.5 12.5a9 9 0 0113 0"
            stroke="#2F3E9E"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="12" cy="18" r="2.4" fill="#2F3E9E" />
        </svg>
      );
    case "pdam":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path
            d="M12 3s6 6.6 6 10.4A6 6 0 116 13.4C6 9.6 12 3 12 3z"
            fill="#22A6E8"
          />
        </svg>
      );
    case "bpjs":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <path
            d="M12 3l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V6l8-3z"
            fill="#17A673"
          />
          <path
            d="M12 8.5v7M8.5 12h7"
            stroke="#fff"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
        </svg>
      );
    case "internet":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="9" stroke="#7B4DDB" strokeWidth="2.2" />
          <path
            d="M3 12h18M12 3c2.6 3 2.6 15 0 18M12 3c-2.6 3-2.6 15 0 18"
            stroke="#7B4DDB"
            strokeWidth="2.2"
          />
        </svg>
      );
    case "emoney":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <rect
            x="2.5"
            y="5.5"
            width="19"
            height="13"
            rx="3.4"
            fill="#E8A80C"
          />
          <path d="M2.5 10h19" stroke="#fff" strokeWidth="2.2" />
          <circle cx="17.5" cy="14.5" r="1.7" fill="#fff" />
        </svg>
      );
    case "multifinance":
      return (
        <svg {...common} className={className} aria-hidden="true">
          <rect x="3" y="9" width="18" height="11" rx="3" fill="#E8553F" />
          <path
            d="M7 9V7a5 5 0 0110 0v2"
            stroke="#E8553F"
            strokeWidth="2.3"
          />
          <circle cx="12" cy="14.5" r="1.8" fill="#fff" />
        </svg>
      );
  }
}

export function BoltIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M13 2L4 14h6l-1 8 9-12h-6l1-8z" fill="#fff" />
    </svg>
  );
}

export function ShieldCheckIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M12 2l8 3v6c0 5-3.4 9.2-8 11-4.6-1.8-8-6-8-11V5l8-3z" fill="#fff" />
      <path
        d="M8.5 12l2.5 2.5 4.5-5"
        stroke="#12332F"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CardIcon({ className }: IconProps) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="6" width="18" height="12" rx="3" fill="#fff" />
      <path d="M3 10h18" stroke="#12332F" strokeWidth="2" />
      <circle cx="17" cy="14.5" r="1.6" fill="#12332F" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: IconProps) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="#fff"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2a10 10 0 00-8.6 15.1L2 22l5-1.3A10 10 0 1012 2zm0 18a8 8 0 01-4.1-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8 8 0 1112 20zm4.4-5.8c-.2-.1-1.4-.7-1.6-.8s-.4-.1-.6.1-.6.8-.8 1-.3.2-.6.1a6.6 6.6 0 01-3.2-2.8c-.2-.4.2-.4.6-1.2a.6.6 0 000-.6l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 00-.7.3A2.8 2.8 0 006 9.2a5 5 0 001 2.6 11 11 0 004.2 3.7c1.5.6 2.1.7 2.8.6a2.4 2.4 0 001.6-1.1 2 2 0 00.1-1.1c0-.1-.2-.2-.4-.3z" />
    </svg>
  );
}

export function SearchIcon({ className }: IconProps) {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      // currentColor → ikon otomatis ikut warna teks pemakainya.
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m16.5 16.5 4 4" />
    </svg>
  );
}

export function BurgerIcon() {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" aria-hidden="true">
      <path
        d="M0 1h20M0 7h20M0 13h20"
        stroke="#12332F"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SpinnerIcon() {
  return (
    <svg
      className="spin"
      width="44"
      height="44"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" stroke="#FFD3B5" strokeWidth="3" />
      <path
        d="M21 12a9 9 0 00-9-9"
        stroke="#FF7A2F"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SuccessIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#0FB9A8" />
      <path
        d="M7.5 12.3l3 3 6-6.4"
        stroke="#fff"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TrackCheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#fff"
      strokeWidth="3.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m5 12.5 4.5 4.5L19 7" />
    </svg>
  );
}

export function EmptyReceiptIcon() {
  return (
    <svg
      width="66"
      height="66"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#B9CFCB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M5 3.5h14v17l-2.3-1.7-2.4 1.7-2.3-1.7-2.4 1.7L7.3 18.8 5 20.5z" />
      <path d="M8.5 8h7M8.5 12h7M8.5 15.5h3.5" />
    </svg>
  );
}
