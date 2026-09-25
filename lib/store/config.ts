/**
 * Konfigurasi penyimpanan.
 *
 * Dua mode:
 * 1. Supabase terkonfigurasi (SUPABASE_URL + service key) → data di Postgres.
 * 2. Belum terkonfigurasi → fallback ke file JSON di content/ supaya
 *    `npm run dev` dan build tetap jalan tanpa backend.
 *
 * Key Supabase memakai service/secret key yang melewati RLS, jadi file ini
 * hanya boleh diimpor dari server (server action / route handler / page RSC).
 */

const url = process.env.SUPABASE_URL?.replace(/\/$/, "") ?? "";
const key =
  process.env.SUPABASE_SERVICE_ROLE_KEY ??
  process.env.SUPABASE_SECRET_KEY ??
  "";

export function isSupabaseConfigured(): boolean {
  return Boolean(url && key);
}

function requireConfig(): { url: string; key: string } {
  if (!isSupabaseConfigured()) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi SUPABASE_URL dan SUPABASE_SERVICE_ROLE_KEY di .env.local.",
    );
  }
  return { url, key };
}

/**
 * Panggil PostgREST. `path` contoh: "orders?select=*&order=created_at.desc".
 * Selalu no-store supaya data admin tidak pernah basi.
 */
export async function supabaseFetch<T = unknown>(
  path: string,
  init: RequestInit & { prefer?: string } = {},
): Promise<T> {
  const config = requireConfig();
  const { prefer, headers, ...rest } = init;

  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      Prefer: prefer ?? "return=representation",
      ...headers,
    },
  });

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(
      `Supabase ${response.status} pada "${path}": ${detail.slice(0, 300)}`,
    );
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : null) as T;
}
