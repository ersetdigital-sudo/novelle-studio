import { catalog as codeCatalog, categoryOrder } from "@/data/catalog";
import { isSupabaseConfigured, supabaseFetch } from "@/lib/store/config";
import { CONTENT_FILES, readJsonFile, writeJsonFile } from "@/lib/store/files";
import { defaultCategoryItems, defaultCategorySettings } from "@/lib/store/defaults";
import { getContentSnapshot, saveSiteContent } from "@/lib/store/content";
import type {
  CategoryField,
  CategoryItemRecord,
  CategorySetting,
  CategorySlug,
  CustomCategory,
  CustomCategoryItem,
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
  slug: string;
  name: string;
  short: string;
  icon: string;
  adminFee: number;
  isActive: boolean;
  isCustom: boolean;
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

/* ------------------------------------------------------------------ */
/* Kategori custom (dibuat dari dashboard, disimpan di site_content)   */
/* ------------------------------------------------------------------ */

export const DEFAULT_CUSTOM_TINT = "#D8F5F0";
export const DEFAULT_CUSTOM_ICON = "box";

export async function getCustomCategories(): Promise<CustomCategory[]> {
  const { content } = await getContentSnapshot();
  return content.customCategories ?? [];
}

export function customSetting(def: CustomCategory): CategorySetting {
  return {
    slug: def.slug,
    adminFee: def.admin,
    nomLabel: def.nomLabel,
    providerLabel: null,
    providers: null,
    fieldLabel: def.field.label,
    fieldPlaceholder: def.field.placeholder,
    fieldHint: def.field.hint,
    fieldMinLength: def.field.minLength,
    altProvider: null,
    isActive: def.isActive,
  };
}

function customItemRecords(def: CustomCategory): CategoryItemRecord[] {
  return def.items.map((item, index) => ({
    id: `${def.slug}-custom-${index}`,
    categorySlug: def.slug,
    variant: "main" as const,
    label: item.label,
    note: item.note,
    price: item.price,
    sortOrder: index,
    isActive: item.isActive,
  }));
}

function resolveCustom(
  def: CustomCategory,
  includeInactiveItems: boolean,
): ResolvedCategory {
  const setting = customSetting(def);
  const items = customItemRecords(def)
    .filter((item) => includeInactiveItems || item.isActive)
    .sort(byOrder);
  return {
    slug: def.slug,
    name: def.name,
    short: def.short,
    tint: def.tint,
    icon: def.icon,
    admin: def.admin,
    nomLabel: def.nomLabel,
    field: def.field,
    items: items.map(toNominal),
    isActive: def.isActive,
    settings: setting,
  };
}

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
    const customDefs = await getCustomCategories();
    const settingBySlug = new Map(raw.settings.map((item) => [item.slug, item]));
    const defaults = defaultCategorySettings();
    const defaultItems = defaultCategoryItems();

    const codeCategories = categoryOrder
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

    const categories = [
      ...codeCategories,
      ...customDefs.map((def) => resolveCustom(def, includeInactiveItems)),
    ].filter((category) => includeInactiveCategories || category.isActive);

    return { categories, error: null };
  } catch (error) {
    // Kalau Supabase bermasalah, situs tetap tampil memakai default dari kode.
    const fallback: ResolvedCategory[] = defaultCategorySettings().map((setting) => {
      const base = codeCatalog[setting.slug as CategorySlug];
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
  const { categories } = await getCatalogSnapshot();
  return categories.find((category) => category.slug === slug);
}

/** Data mentah untuk editor dashboard (termasuk nominal yang disembunyikan). */
export async function getCategoryForEdit(
  slug: string,
): Promise<{ setting: CategorySetting; items: CategoryItemRecord[] }> {
  if (isCategorySlug(slug)) {
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

  const custom = (await getCustomCategories()).find((item) => item.slug === slug);
  if (!custom) throw new Error("Kategori tidak ditemukan.");
  return { setting: customSetting(custom), items: customItemRecords(custom) };
}

/** Ringkasan semua kategori untuk halaman daftar di dashboard. */
export async function getCategoryOverview(): Promise<{
  overview: CategoryOverview[];
  error: string | null;
}> {
  try {
    const raw = await loadRaw();
    const customDefs = await getCustomCategories();
    const settingsBySlug = new Map(raw.settings.map((item) => [item.slug, item]));
    const defaults = defaultCategorySettings();
    const defaultItems = defaultCategoryItems();

    const codeOverview = categoryOrder.map((slug) => {
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
        icon: slug,
        adminFee: setting.adminFee,
        isActive: setting.isActive,
        isCustom: false,
        itemCount: mainItems.length,
        activeItemCount: activePrices.length,
        startingPrice: activePrices.length ? Math.min(...activePrices) : 0,
        hasAltVariant: items.some((item) => item.variant === "alt"),
      } satisfies CategoryOverview;
    });

    const customOverview = customDefs.map((def) => {
      const activePrices = def.items
        .filter((item) => item.isActive)
        .map((item) => item.price);
      return {
        slug: def.slug,
        name: def.name,
        short: def.short,
        icon: def.icon,
        adminFee: def.admin,
        isActive: def.isActive,
        isCustom: true,
        itemCount: def.items.length,
        activeItemCount: activePrices.length,
        startingPrice: activePrices.length ? Math.min(...activePrices) : 0,
        hasAltVariant: false,
      } satisfies CategoryOverview;
    });

    return { overview: [...codeOverview, ...customOverview], error: null };
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

/* ------------------------------------------------------------------ */
/* Kategori custom — CRUD di site_content                              */
/* ------------------------------------------------------------------ */

export interface CustomCategoryIdentity {
  name: string;
  short: string;
  tint: string;
  icon: string;
  fieldType?: "tel" | "text";
}

export async function createCustomCategory(def: CustomCategory): Promise<void> {
  const { content } = await getContentSnapshot();
  await saveSiteContent({
    ...content,
    customCategories: [...(content.customCategories ?? []), def],
  });
}

export async function updateCustomCategory(
  slug: string,
  setting: CategorySetting,
  items: CategoryItemRecord[],
  identity?: CustomCategoryIdentity,
): Promise<boolean> {
  const { content } = await getContentSnapshot();
  const list = content.customCategories ?? [];
  const index = list.findIndex((item) => item.slug === slug);
  if (index === -1) return false;
  const current = list[index]!;

  const cleanItems: CustomCategoryItem[] = items
    .filter((item) => item.variant === "main" && item.label.trim().length > 0)
    .map((item) => ({
      label: item.label,
      note: item.note,
      price: item.price,
      isActive: item.isActive,
    }));

  const next: CustomCategory = {
    ...current,
    admin: setting.adminFee,
    nomLabel: setting.nomLabel,
    field: {
      label: setting.fieldLabel,
      placeholder: setting.fieldPlaceholder,
      type: identity?.fieldType ?? current.field.type,
      hint: setting.fieldHint,
      minLength: setting.fieldMinLength,
    },
    isActive: setting.isActive,
    items: cleanItems,
    ...(identity
      ? { name: identity.name, short: identity.short, tint: identity.tint, icon: identity.icon }
      : {}),
  };

  await saveSiteContent({
    ...content,
    customCategories: list.map((item, i) => (i === index ? next : item)),
  });
  return true;
}

export async function deleteCustomCategory(slug: string): Promise<boolean> {
  const { content } = await getContentSnapshot();
  const list = content.customCategories ?? [];
  if (!list.some((item) => item.slug === slug)) return false;
  await saveSiteContent({
    ...content,
    customCategories: list.filter((item) => item.slug !== slug),
  });
  return true;
}
