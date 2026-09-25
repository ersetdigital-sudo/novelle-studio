import { isSupabaseConfigured, supabaseFetch } from "@/lib/store/config";
import { CONTENT_FILES, readJsonFile, writeJsonFile } from "@/lib/store/files";
import { DEFAULT_CONTENT } from "@/lib/store/defaults";
import type { SiteContent } from "@/lib/types";

/** Tag cache halaman publik; di-invalidasi setiap kali konten disimpan. */
export const CONTENT_TAG = "novelle-content";
const CONTENT_ID = "main";

export interface ContentSnapshot {
  content: SiteContent;
  /** Pesan kalau data terbaru gagal dimuat (UI menampilkan peringatan). */
  error: string | null;
}

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

/**
 * Gabung rekursif: objek digabung, array diganti utuh.
 * Ini yang membuat satu form bisa mengirim satu bagian saja
 * (mis. { promos: {...} }) tanpa menghapus bagian lain.
 */
export function deepMerge<T>(base: T, patch: unknown): T {
  if (!isPlainObject(patch)) return patch as T;
  if (!isPlainObject(base)) return patch as T;
  const result: Record<string, unknown> = { ...base };
  for (const [key, value] of Object.entries(patch)) {
    result[key] = deepMerge(result[key], value);
  }
  return result as T;
}

/** Key level atas yang boleh ditulis dari dashboard. */
export const CONTENT_KEYS = new Set(Object.keys(DEFAULT_CONTENT));

export async function getContentSnapshot(): Promise<ContentSnapshot> {
  try {
    const stored = isSupabaseConfigured()
      ? await readFromSupabase()
      : await readJsonFile<Partial<SiteContent>>(CONTENT_FILES.content);
    return {
      content: stored ? deepMerge(DEFAULT_CONTENT, stored) : DEFAULT_CONTENT,
      error: null,
    };
  } catch (error) {
    return {
      content: DEFAULT_CONTENT,
      error: error instanceof Error ? error.message : "Gagal memuat konten.",
    };
  }
}

async function readFromSupabase(): Promise<Partial<SiteContent> | null> {
  const rows = await supabaseFetch<Array<{ data: Partial<SiteContent> }>>(
    `site_content?id=eq.${CONTENT_ID}&select=data`,
  );
  return rows[0]?.data ?? null;
}

export async function saveSiteContent(content: SiteContent): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch(`site_content?on_conflict=id`, {
      method: "POST",
      prefer: "resolution=merge-duplicates,return=minimal",
      body: JSON.stringify([
        { id: CONTENT_ID, data: content, updated_at: new Date().toISOString() },
      ]),
    });
    return;
  }
  await writeJsonFile(CONTENT_FILES.content, content);
}

/** Kembalikan konten ke isi awal. */
export async function resetSiteContent(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabaseFetch(`site_content?id=eq.${CONTENT_ID}`, { method: "DELETE" });
    return;
  }
  await writeJsonFile(CONTENT_FILES.content, DEFAULT_CONTENT);
}
