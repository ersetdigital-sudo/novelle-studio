import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryEditor } from "@/components/admin/CategoryEditor";
import { Badge } from "@/components/admin/fields";
import { catalog } from "@/data/catalog";
import { defaultCategorySettings, hasAltVariant } from "@/lib/store/defaults";
import { getCategoryForEdit, getCustomCategories } from "@/lib/store/catalog";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Kategori", robots: { index: false, follow: false } };

export default async function AdminCategoryEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ baru?: string }>;
}) {
  const { slug } = await params;
  const { baru } = await searchParams;

  const codeBase = defaultCategorySettings().find((item) => item.slug === slug);
  const custom = codeBase
    ? null
    : (await getCustomCategories()).find((item) => item.slug === slug);
  if (!codeBase && !custom) notFound();

  const { setting, items } = await getCategoryForEdit(slug);
  const name = codeBase
    ? catalog[(codeBase.slug as CategorySlug)].name
    : custom!.name;

  return (
    <>
      <header className="mb-5">
        <Link href="/admin/katalog" className="text-xs font-semibold text-tosca-dark hover:underline">
          ← Katalog
        </Link>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <h1 className="font-display text-2xl font-extrabold">{name}</h1>
          {custom && <Badge tone="neutral">custom</Badge>}
        </div>
        <p className="mt-0.5 text-xs text-muted">/produk/{slug}</p>
      </header>

      {baru && (
        <p className="mb-4 rounded-2xl border-2 border-tosca bg-tosca-soft px-4 py-3 text-xs font-semibold text-tosca-dark">
          Kategori berhasil dibuat. Tambahkan nominal di bawah supaya langsung bisa dibeli.
        </p>
      )}

      <CategoryEditor
        setting={setting}
        items={items}
        hasAlt={hasAltVariant(slug)}
        identity={
          custom
            ? {
                name: custom.name,
                short: custom.short,
                tint: custom.tint,
                icon: custom.icon,
                fieldType: custom.field.type,
              }
            : undefined
        }
      />
    </>
  );
}
