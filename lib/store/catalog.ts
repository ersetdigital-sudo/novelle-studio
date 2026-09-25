import { catalog as codeCatalog, categoryOrder } from "@/data/catalog";
import { isSupabaseConfigured, supabaseFetch } from "@/lib/store/config";
import { CONTENT_FILES, readJsonFile, writeJsonFile } from "@/lib/store/files";
import { defaultCategoryItems, defaultCategorySettings } from "@/lib/store/defaults";
import type {
  CategoryItemRecord,
  CategorySetting,
  CategorySlug,
  NominalItem,
  ResolvedCategory,
} from "@/lib/types";

export const CATALOG_TAG = "novelle-catalog";

interface CatalogFile {
  settings: CategorySetting[];
  items: CategoryItemRecord[];
}

export interface CatalogSnapshot {
  categories: ResolvedCategory[];
  error: string | null;
}

/** Ringkasan untuk daftar kategori di dashboard. */
export interface CategoryOverview {
  slug: CategorySlug;
  name: string;
  short: string;
  adminFee: number;
  isActive: boolean;
  itemCount: number;
  activeItemCount: number;
  startingPrice: number;
  hasAltVariant: boolean;
}

/* ------------------------------------------------------------------ */
/* Baca                                                                */
/* ------------------------------------------------------------------ */

async function loadRaw(): Promise<{ settings: CategorySetting[]; items: CategoryItemRecord[] }> {
  if (isSupabaseConfigured()) {
    const [settings, items] = await Promise.all([
      supabaseFetch<CategorySettingRow[]>(
        "category_settings?select=slug,admin_fee,nom_label,provider_label,providers,field_label,field_placeholder,field_hint,field_min_length,alt_provider,is_active",
      ),
      supabaseFetch<CategoryItemRow[]>(
        "category_items?select=category_slug,variant,label,note,price,sort_order,is_active&order=sort_order.asc",
      ),
    ]);
    return {
      settings: settings.map(mapSettingRow).filter((s): s is CategorySetting => s !== null),
      items: items.map(mapItemRow).filter((i): i is CategoryItemRecord => i !== null),
    };
  }

  const stored = await readJsonFile<CatalogFile>(CONTENT_FILES.catalog);
  return {
    settings: stored?.settings ?? [],
    items: stored?.items ?? [],
  };
}

interface CategorySettingRow {
  slug: string;
  admin_fee: number;
  nom_label: string | null;
  provider_label: string | null;
  providers: string[] | null;
  field_label: string | null;
  field_placeholder: string | null;
  field_hint: string | null;
  field_min_length: number | null;
  alt_provider: string | null;
  is_active: boolean;
}

interface CategoryItemRow {
  category_slug: string;
  variant: "main" | "alt";
  label: string;
  note: string | null;
  price: number;
  sort_order: number;
  is_active: boolean;
}

const isCategorySlug = (value: string): value is CategorySlug =>
  Object.prototype.hasOwnProperty.call(codeCatalog, value);

function mapSettingRow(row: CategorySettingRow): CategorySetting | null {
  if (!isCategorySlug(row.slug)) return null;
  const base = defaultCategorySettings().find((item) => item.slug === row.slug);
  if (!base) return null;
  return {
    slug: row.slug,
    adminFee: row.admin_fee ?? base.adminFee,
    nomLabel: row.nom_label ?? base.nomLabel,
    providerLabel: row.provider_label ?? base.providerLabel,
    providers: row.providers ?? base.providers,
    fieldLabel: row.field_label ?? base.fieldLabel,
    fieldPlaceholder: row.field_placeholder ?? base.fieldPlaceholder,
    fieldHint: row.field_hint ?? base.fieldHint,
    fieldMinLength: row.field_min_length ?? base.fieldMinLength,
    altProvider: row.alt_provider ?? base.altProvider,
    isActive: row.is_active ?? true,
  };
}

function mapItemRow(row: CategoryItemRow): CategoryItemRecord | null {
  if (!isCategorySlug(row.category_slug)) return null;
  return {
    id: `${row.category_slug}-${row.variant}-${row.sort_order}-${row.label}`,
    categorySlug: row.category_slug,
    variant: row.variant,
    label: row.label,
    note: row.note ?? "",
    price: row.price,
    sortOrder: row.sort_order,
    isActive: row.is_active,
  };
}

const toNominal = (item: CategoryItemRecord): NominalItem => ({
  nama: item.label,
  keterangan: item.note,
  harga: item.price,
});

const byOrder = (a: CategoryItemRecord, b: CategoryItemRecord) =>
  a.sortOrder - b.sortOrder;

/**
 * Gabungkan default dari kode dengan override dashboard.
 * `includeInactiveItems` dipakai dashboard; halaman publik selalu false.
 */
export async function getCatalogSnapshot(
  options: { includeInactiveItems?: boolean; includeInactiveCategories?: boolean } = {},
): Promise<CatalogSnapshot> {
  const { includeInactiveItems = false, includeInactiveCategories = false } = options;

  try {
    const raw = await loadRaw();
    const settingBySlug = new Map(raw.settings.map((item) => [item.slug, item]));
    const defaults = defaultCategorySettings();
    const defaultItems = defaultCategoryItems();

    const categories = categoryOrder
      .map((slug) => {
        const base = codeCatalog[slug];
        const setting = settingBySlug.get(slug) ?? defaults.find((s) => s.slug === slug)!;
        const stored = raw.items.filter((item) => item.categorySlug === slug);

        const pickItems = (variant: "main" | "alt"): CategoryItemRecord[] => {
          const fromStore = stored.filter((item) => item.variant === variant);
          const source = fromStore.length
            ? fromStore
            : defaultItems.filter(
                (item) => item.categorySlug === slug && item.variant === variant,
              );
          return source
            .filter((item) => includeInactiveItems || item.isActive)
            .sort(byOrder);
        };

        const mainItems = pickItems("main");
        const altItems = pickItems("alt");

        const resolved: ResolvedCategory = {
          ...base,
          admin: setting.adminFee,
          nomLabel: setting.nomLabel,
          providers: setting.providers?.length
            ? { label: setting.providerLabel ?? "Pilih Layanan", list: setting.providers }
            : undefined,
          field: {
            label: setting.fieldLabel,
            placeholder: setting.fieldPlaceholder,
            type: base.field.type,
            hint: setting.fieldHint,
            minLength: setting.fieldMinLength,
          },
          altProvider: setting.altProvider ?? undefined,
          items: mainItems.map(toNominal),
          altItems: altItems.length ? altItems.map(toNominal) : undefined,
          isActive: setting.isActive,
          settings: setting,
        };
        return resolved;
      })
      .filter((category) => includeInactiveCategories || category.isActive);

    return { categories, error: null };
  } catch (error) {
    // Kalau Supabase bermasalah, situs tetap tampil memakai default dari kode.
    const fallback: ResolvedCategory[] = defaultCategorySettings().map((setting) => {
      const base = codeCatalog[setting.slug];
      const items = defaultCategoryItems()
        .filter((item) => item.categorySlug === setting.slug && item.variant === "main")
        .sort(byOrder);
      const alt = defaultCategoryItems()
        .filter((item) => item.categorySlug === setting.slug && item.variant === "alt")
        .sort(byOrder);
      return {
        ...base,
        items: items.map(toNominal),
        altItems: alt.length ? alt.map(toNominal) : undefined,
        isActive: true,
        settings: setting,
      };
    });
    return {
      categories: fallback,
      error: error instanceof Error ? error.message : "Gagal memuat katalog.",
    };
  }
}

/** Kategori publik (hanya yang aktif). */
export async function getActiveCategories(): Promise<ResolvedCategory[]> {
  const { categories } = await getCatalogSnapshot();
  return categories;
}

/** Satu kategori untuk halaman publik; undefined kalau disembunyikan admin. */
export async function getCategoryBySlug(
  slug: string,
): Promise<ResolvedCategory | undefined> {
  if (!isCategorySlug(slug)) return undefined;
  const { categories } = await getCatalogSnapshot();
  return categories.find((category) => category.slug === slug);
}

/** Data mentah untuk editor dashboard (termasuk nominal yang disembunyikan). */
export async function getCategoryForEdit(
  slug: CategorySlug,
): Promise<{ setting: CategorySetting; items: CategoryItemRecord[] }> {
  const raw = await loadRaw();
  const fallbackSetting =
    defaultCategorySettings().find((item) => item.slug === slug) ??
    defaultCategorySettings()[0]!;
  const setting = raw.settings.find((item) => item.slug === slug) ?? fallbackSetting;
  const stored = raw.items.filter((item) => item.categorySlug === slug);
  const items = stored.length
    ? stored
    : defaultCategoryItems().filter((item) => item.categorySlug === slug);
  return { setting, items: [...items].sort(byOrder) };
}

/** Ringkasan semua kategori untuk halaman daftar di dashboard. */
export async function getCategoryOverview(): Promise<{
  overview: CategoryOverview[];
  error: string | null;
}> {
  try {
    const raw = await loadRaw();
    const settingsBySlug = new Map(raw.settings.map((item) => [item.slug, item]));
    const defaults = defaultCategorySettings();
    const defaultItems = defaultCategoryItems();

    const overview = categoryOrder.map((slug) => {
      const base = codeCatalog[slug];
      const setting = settingsBySlug.get(slug) ?? defaults.find((s) => s.slug === slug)!;
      const stored = raw.items.filter((item) => item.categorySlug === slug);
      const items = stored.length
        ? stored
        : defaultItems.filter((item) => item.categorySlug === slug);
      const mainItems = items.filter((item) => item.variant === "main");
      const activePrices = mainItems
        .filter((item) => item.isActive)
        .map((item) => item.price);

      return {
        slug,
        name: base.name,
        short: base.short,
        adminFee: setting.adminFee,
        isActive: setting.isActive,
        itemCount: mainItems.length,
        activeItemCount: activePrices.length,
        startingPrice: activePrices.length ? Math.min(...activePrices) : 0,
        hasAltVariant: items.some((item) => item.variant === "alt"),
      } satisfies CategoryOverview;
    });

    return { overview, error: null };
  } catch (error) {
    return {
      overview: [],
      error: error instanceof Error ? error.message : "Gagal memuat katalog.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Tulis                                                               */
/* ------------------------------------------------------------------ */

/** Simpan pengaturan + seluruh nominal satu kategori (ganti utuh). */
export async function saveCategory(
  setting: CategorySetting,
  items: CategoryItemRecord[],
): Promise<void> {
  const cleanItems = items
    .filter((item) => item.label.trim().length > 0)
    .map((item, index) => ({ ...item, sortOrder: index }));

  if (isSupabaseConfigured()) {
    await supabaseFetch(`category_settings?on_conflict=slug`, {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify([
        {
          slug: setting.slug,
          admin_fee: setting.adminFee,
          nom_label: setting.nomLabel,
          provider_label: setting.providerLabel,
          providers: setting.providers,
          field_label: setting.fieldLabel,
          field_placeholder: setting.fieldPlaceholder,
          field_hint: setting.fieldHint,
          field_min_length: setting.fieldMinLength,
          alt_provider: setting.altProvider,
          is_active: setting.isActive,
          updated_at: new Date().toISOString(),
        },
      ]),
    });

    await supabaseFetch(`category_items?category_slug=eq.${setting.slug}`, {
      method: "DELETE",
      prefer: "return=minimal",
    });

    if (cleanItems.length) {
      await supabaseFetch("category_items", {
        method: "POST",
        prefer: "return=minimal",
        body: JSON.stringify(
          cleanItems.map((item) => ({
            category_slug: item.categorySlug,
            variant: item.variant,
            label: item.label,
            note: item.note,
            price: item.price,
            sort_order: item.sortOrder,
            is_active: item.isActive,
          })),
        ),
      });
    }
    return;
  }

  const stored = await readJsonFile<CatalogFile>(CONTENT_FILES.catalog);
  const settings = (stored?.settings ?? []).filter(
    (item) => item.slug !== setting.slug,
  );
  const otherItems = (stored?.items ?? []).filter(
    (item) => item.categorySlug !== setting.slug,
  );
  await writeJsonFile(CONTENT_FILES.catalog, {
    settings: [...settings, setting],
    items: [...otherItems, ...cleanItems],
  } satisfies CatalogFile);
}

/** Kembalikan seluruh katalog ke nominal bawaan. */
export async function resetCatalog(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch("category_items?id=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    await supabaseFetch("category_settings?slug=not.is.null", {
      method: "DELETE",
      prefer: "return=minimal",
    });
    return;
  }
  await writeJsonFile(CONTENT_FILES.catalog, {
    settings: [],
    items: [],
  } satisfies CatalogFile);
}
