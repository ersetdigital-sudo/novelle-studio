import Link from "next/link";
import { notFound } from "next/navigation";

import { CategoryEditor } from "@/components/admin/CategoryEditor";
import { defaultCategorySettings, hasAltVariant } from "@/lib/store/defaults";
import { getCategoryForEdit } from "@/lib/store/catalog";
import type { CategorySlug } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata = { title: "Edit Kategori", robots: { index: false, follow: false } };

export default async function AdminCategoryEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const known = defaultCategorySettings().find((item) => item.slug === slug);
  if (!known) notFound();

  const { setting, items } = await getCategoryForEdit(slug as CategorySlug);

  return (
    <>
      <header className="mb-5">
        <Link href="/admin/katalog" className="text-xs font-semibold text-tosca-dark hover:underline">
          ← Katalog
        </Link>
        <h1 className="mt-1 font-display text-2xl font-extrabold">{known.slug}</h1>
      </header>

      <CategoryEditor setting={setting} items={items} hasAlt={hasAltVariant(slug as CategorySlug)} />
    </>
  );
}
