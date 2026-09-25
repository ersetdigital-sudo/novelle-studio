"use server";

import { revalidatePath, revalidateTag, updateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  clearAttempts,
  endSession,
  isAuthorized,
  isRateLimited,
  RATE_LIMIT_MAX_ATTEMPTS,
  recordFailedAttempt,
  startSession,
} from "@/lib/admin/auth";
import { CATALOG_TAG, resetCatalog, saveCategory } from "@/lib/store/catalog";
import { defaultCategorySettings } from "@/lib/store/defaults";
import { CONTENT_KEYS, CONTENT_TAG, deepMerge, getContentSnapshot, resetSiteContent, saveSiteContent } from "@/lib/store/content";
import { PAYMENTS_TAG, isPaymentMethodReady, resetPaymentMethods, savePaymentMethods } from "@/lib/store/payments";
import { ORDERS_TAG, isOrderStatus, resetOrders, updateOrderStatus } from "@/lib/store/orders";
import type {
  ActionResult,
  CategoryItemRecord,
  CategorySetting,
  PaymentMethod,
  PaymentType,
  SiteContent,
} from "@/lib/types";

/* ------------------------------------------------------------------ */
/* Util                                                                */
/* ------------------------------------------------------------------ */

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const text = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value : fallback;

const num = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const int = (value: unknown, fallback = 0): number => Math.max(0, Math.round(num(value, fallback)));

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string").map((item) => item.trim()).filter(Boolean)
    : [];

async function guard(): Promise<ActionResult | null> {
  if (!(await isAuthorized())) {
    return { ok: false, message: "Sesi tidak sah. Silakan login ulang." };
  }
  return null;
}

/** Segarkan seluruh halaman publik (konten + katalog + metode pembayaran). */
function refreshPublic(options: { catalog?: boolean; content?: boolean; payments?: boolean }) {
  // updateTag: read-your-own-writes di dalam server action (admin langsung melihat hasilnya).
  if (options.catalog) updateTag(CATALOG_TAG);
  if (options.content) updateTag(CONTENT_TAG);
  if (options.payments) updateTag(PAYMENTS_TAG);
  revalidatePath("/", "layout");
}

/* ------------------------------------------------------------------ */
/* Autentikasi                                                         */
/* ------------------------------------------------------------------ */

async function clientKey(): Promise<string> {
  const store = await headers();
  return (
    store.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    store.get("x-real-ip") ??
    "local"
  );
}

export async function loginAction(
  _previous: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const key = await clientKey();

  if (isRateLimited(key)) {
    return {
      ok: false,
      message: `Terlalu banyak percobaan. Coba lagi dalam beberapa menit (maksimal ${RATE_LIMIT_MAX_ATTEMPTS} kali).`,
    };
  }

  const password = String(formData.get("password") ?? "");
  const success = await startSession(password);

  if (!success) {
    recordFailedAttempt(key);
    return { ok: false, message: "Password salah." };
  }

  clearAttempts(key);
  redirect("/admin");
  // redirect() melempar NEXT_REDIRECT, tapi TS tetap minta return value.
  return { ok: true, message: "Berhasil masuk." };
}

export async function logoutAction(): Promise<void> {
  await endSession();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Katalog                                                             */
/* ------------------------------------------------------------------ */

function normalizeSetting(raw: unknown, base: CategorySetting): CategorySetting {
  const value = isPlainObject(raw) ? raw : {};
  return {
    slug: base.slug,
    adminFee: int(value.adminFee, base.adminFee),
    nomLabel: text(value.nomLabel, base.nomLabel).trim() || base.nomLabel,
    providerLabel:
      value.providerLabel === null
        ? null
        : text(value.providerLabel, base.providerLabel ?? "").trim() || null,
    providers:
      value.providers === null ? null : asStringArray(value.providers).length ? asStringArray(value.providers) : base.providers,
    fieldLabel: text(value.fieldLabel, base.fieldLabel).trim() || base.fieldLabel,
    fieldPlaceholder: text(value.fieldPlaceholder, base.fieldPlaceholder),
    fieldHint: text(value.fieldHint, base.fieldHint),
    fieldMinLength: Math.max(1, int(value.fieldMinLength, base.fieldMinLength)),
    altProvider:
      value.altProvider === null ? null : text(value.altProvider, base.altProvider ?? "").trim() || null,
    isActive: value.isActive !== false,
  };
}

function normalizeItem(
  raw: unknown,
  slug: CategorySetting["slug"],
  index: number,
): CategoryItemRecord | null {
  if (!isPlainObject(raw)) return null;
  const label = text(raw.label).trim();
  if (!label) return null;
  return {
    id: text(raw.id) || `${slug}-${text(raw.variant, "main")}-${index}`,
    categorySlug: slug,
    variant: raw.variant === "alt" ? "alt" : "main",
    label,
    note: text(raw.note),
    price: int(raw.price),
    sortOrder: index,
    isActive: raw.isActive !== false,
  };
}

export async function saveCategoryAction(input: {
  setting: unknown;
  items: unknown;
}): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  const requestedSlug = (isPlainObject(input.setting) ? text(input.setting.slug) : "") as CategorySetting["slug"];
  const base = defaultCategorySettings().find((item) => item.slug === requestedSlug);
  if (!base) return { ok: false, message: "Kategori tidak dikenal." };

  const setting = normalizeSetting(input.setting, base);
  const items = (Array.isArray(input.items) ? input.items : [])
    .map((item, index) => normalizeItem(item, setting.slug, index))
    .filter((item): item is CategoryItemRecord => item !== null);

  try {
    await saveCategory(setting, items);
    refreshPublic({ catalog: true });
    revalidatePath("/admin/katalog");
    revalidatePath(`/admin/katalog/${setting.slug}`);
    return { ok: true, message: "Kategori tersimpan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan kategori.",
    };
  }
}

export async function resetCatalogAction(): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await resetCatalog();
    refreshPublic({ catalog: true });
    return { ok: true, message: "Katalog dikembalikan ke nominal bawaan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal mengembalikan katalog.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Konten                                                              */
/* ------------------------------------------------------------------ */

export async function saveContentSectionAction(
  section: string,
  patch: unknown,
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!CONTENT_KEYS.has(section)) {
    return { ok: false, message: `Bagian "${section}" tidak dikenal.` };
  }
  if (!isPlainObject(patch)) {
    return { ok: false, message: "Data yang dikirim tidak valid." };
  }

  try {
    const { content } = await getContentSnapshot();
    const next = deepMerge(content, { [section]: patch }) as SiteContent;
    await saveSiteContent(next);
    refreshPublic({ content: true });
    revalidatePath("/admin/konten");
    return { ok: true, message: "Perubahan tersimpan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan perubahan.",
    };
  }
}

export async function resetContentAction(): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await resetSiteContent();
    refreshPublic({ content: true });
    return { ok: true, message: "Konten dikembalikan ke isi awal." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal mengembalikan konten.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Metode pembayaran                                                   */
/* ------------------------------------------------------------------ */

function normalizePaymentMethod(raw: unknown, index: number): PaymentMethod | null {
  if (!isPlainObject(raw)) return null;
  const name = text(raw.name).trim();
  if (!name) return null;
  const type: PaymentType = raw.type === "transfer" ? "transfer" : "qris";
  return {
    id: text(raw.id) || crypto.randomUUID(),
    name,
    type,
    accountLabel: text(raw.accountLabel).trim() || (type === "qris" ? "QRIS" : "Nomor Tujuan"),
    accountNumber: text(raw.accountNumber).trim(),
    accountName: text(raw.accountName).trim(),
    qrImage: text(raw.qrImage).trim(),
    instructions: asStringArray(raw.instructions),
    isActive: raw.isActive !== false,
    sortOrder: index,
  };
}

export async function savePaymentMethodsAction(
  methods: unknown,
): Promise<ActionResult & { autoDisabled?: string[] }> {
  const denied = await guard();
  if (denied) return denied;

  if (!Array.isArray(methods)) {
    return { ok: false, message: "Data metode pembayaran tidak valid." };
  }

  const normalized = methods
    .map((method, index) => normalizePaymentMethod(method, index))
    .filter((method): method is PaymentMethod => method !== null);

  // Metode aktif yang datanya belum lengkap dinonaktifkan otomatis, bukan diblokir,
  // supaya admin tetap bisa menyimpan progres tanpa mengisi semuanya dulu.
  const autoDisabled: string[] = [];
  const prepared = normalized.map((method) => {
    if (method.isActive && !isPaymentMethodReady(method)) {
      autoDisabled.push(method.name);
      return { ...method, isActive: false };
    }
    return method;
  });

  try {
    await savePaymentMethods(prepared);
    refreshPublic({ payments: true });
    revalidatePath("/admin/pembayaran");
    return {
      ok: true,
      message: autoDisabled.length
        ? `Tersimpan. Dinonaktifkan otomatis karena datanya belum lengkap: ${autoDisabled.join(", ")}.`
        : "Metode pembayaran tersimpan.",
      autoDisabled,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menyimpan metode pembayaran.",
    };
  }
}

export async function resetPaymentMethodsAction(): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await resetPaymentMethods();
    refreshPublic({ payments: true });
    return { ok: true, message: "Metode pembayaran dikembalikan ke bawaan." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal mengembalikan metode pembayaran.",
    };
  }
}

/* ------------------------------------------------------------------ */
/* Pesanan                                                             */
/* ------------------------------------------------------------------ */

export async function setOrderStatusAction(
  invoice: string,
  status: string,
  token?: string,
): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;

  if (!isOrderStatus(status)) {
    return { ok: false, message: "Status tidak dikenal." };
  }

  try {
    const result = await updateOrderStatus(invoice, status, token?.trim() || undefined);
    updateTag(ORDERS_TAG);
    revalidatePath("/admin/pesanan");
    revalidatePath("/admin");
    return result;
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal memperbarui status.",
    };
  }
}

export async function resetOrdersAction(): Promise<ActionResult> {
  const denied = await guard();
  if (denied) return denied;
  try {
    await resetOrders();
    updateTag(ORDERS_TAG);
    revalidatePath("/admin/pesanan");
    return { ok: true, message: "Seluruh pesanan dihapus." };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Gagal menghapus pesanan.",
    };
  }
}
