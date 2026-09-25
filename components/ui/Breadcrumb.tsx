import Link from "next/link";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumb({ items }: { items: readonly Crumb[] }) {
  return (
    <nav className="crumb" aria-label="Breadcrumb">
      <Link href="/">Beranda</Link>
      {items.map((item) => (
        <span key={item.label} className="flex items-center gap-2">
          <span aria-hidden="true">›</span>
          {item.href ? (
            <Link href={item.href}>{item.label}</Link>
          ) : (
            <b>{item.label}</b>
          )}
        </span>
      ))}
    </nav>
  );
}
