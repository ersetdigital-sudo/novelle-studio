import Link from "next/link";

import { rupiah } from "@/lib/format";
import { CategoryIcon } from "@/lib/icons";
import type { CategoryOverview } from "@/lib/store/catalog";
import { Reveal } from "@/components/ui/Reveal";

export function CategoryGrid({ categories }: { categories: readonly CategoryOverview[] }) {
  return (
    <ul className="grid grid-cols-2 gap-3.5 min-[620px]:grid-cols-4 min-[620px]:gap-4.5">
      {categories.map((category, index) => (
        <li key={category.slug}>
          <Reveal delay={index * 0.05} className="h-full">
            <Link
              href={`/produk/${category.slug}`}
              className="cat-card flex h-full flex-col"
              aria-label={`Isi atau bayar ${category.name}`}
            >
              <span
                className="corner"
                style={{ background: "var(--color-tosca-soft)" }}
                aria-hidden="true"
              />
              <span className="cat-ico" style={{ background: "var(--color-tosca-soft)" }}>
                <CategoryIcon slug={category.slug} icon={category.icon} />
              </span>
              <h3 className="text-[17px]">{category.name}</h3>
              <small>
                {category.short} · mulai {rupiah(category.startingPrice)}
              </small>
            </Link>
          </Reveal>
        </li>
      ))}
    </ul>
  );
}
