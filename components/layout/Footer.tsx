import Link from "next/link";

import { getCategoryOverview } from "@/lib/store/catalog";
import { getContentSnapshot } from "@/lib/store/content";
import type { CategorySlug } from "@/lib/types";
import { Logo } from "@/components/ui/Logo";

const serviceLinks: readonly CategorySlug[] = ["pulsa", "data", "pln", "emoney"];
const billLinks: readonly CategorySlug[] = ["pdam", "bpjs", "internet", "multifinance"];

/** Nama tampilan footer per kategori. */
const SLUG_LABEL: Record<CategorySlug, string> = {
  pulsa: "Pulsa",
  data: "Paket Data",
  pln: "Token PLN",
  emoney: "Uang Elektronik",
  pdam: "PDAM",
  bpjs: "BPJS",
  internet: "Internet",
  multifinance: "Multifinance",
};

function CategoryLinks({
  slugs,
  active,
}: {
  slugs: readonly CategorySlug[];
  active: ReadonlySet<string>;
}) {
  const visible = slugs.filter((slug) => active.has(slug));
  if (visible.length === 0) return null;
  return (
    <>
      {visible.map((slug) => (
        <Link key={slug} href={`/produk/${slug}`} className="block py-1 text-sm hover:text-tosca">
          {SLUG_LABEL[slug]}
        </Link>
      ))}
    </>
  );
}

function ColumnTitle({ children }: { children: string }) {
  return <h4 className="mb-3 font-display text-base font-extrabold text-white">{children}</h4>;
}

export async function Footer() {
  const [{ content }, { overview }] = await Promise.all([
    getContentSnapshot(),
    getCategoryOverview(),
  ]);
  const activeSlugs = new Set(overview.filter((item) => item.isActive).map((item) => item.slug));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-5 bg-ink pt-13 pb-6.5 text-[#bfd6d2]">
      <div className="wrap">
        <div className="grid gap-7 min-[800px]:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div>
            <div className="mb-3">
              <Logo inverted asLink={false} />
            </div>
            <p className="max-w-[290px] text-sm">
              {content.settings.tagline}. Layanan pembayaran &amp; isi ulang digital tanpa perlu
              membuat akun.
            </p>
          </div>

          <div>
            <ColumnTitle>Layanan</ColumnTitle>
            <nav aria-label="Layanan">
              <CategoryLinks slugs={serviceLinks} active={activeSlugs} />
            </nav>
          </div>

          <div>
            <ColumnTitle>Tagihan</ColumnTitle>
            <nav aria-label="Tagihan">
              <CategoryLinks slugs={billLinks} active={activeSlugs} />
            </nav>
          </div>

          <div>
            <ColumnTitle>Bantuan</ColumnTitle>
            <a
              href={content.settings.whatsapp}
              target="_blank"
              rel="noopener"
              className="block py-1 text-sm hover:text-tosca"
            >
              WhatsApp: {content.settings.phoneDisplay}
            </a>
            <a
              href={`mailto:${content.settings.email}`}
              className="block py-1 text-sm hover:text-tosca"
            >
              {content.settings.email}
            </a>
            <Link href="/cek-transaksi" className="block py-1 text-sm hover:text-tosca">
              Cek Status Transaksi
            </Link>
            <Link href="/#faq" className="block py-1 text-sm hover:text-tosca">
              Pusat Bantuan / FAQ
            </Link>
          </div>
        </div>

        <div className="mt-7.5 flex flex-wrap justify-between gap-2 border-t border-white/12 pt-4.5 text-[13px]">
          <span>
            © {year} {content.settings.name}. Seluruh hak cipta dilindungi.
          </span>
          <span>Pembayaran didukung QRIS · Transaksi tanpa akun</span>
        </div>
      </div>
    </footer>
  );
}
