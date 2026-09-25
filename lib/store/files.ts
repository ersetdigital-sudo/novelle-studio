import { promises as fs } from "node:fs";
import path from "node:path";

/**
 * Penyimpanan cadangan berbasis file untuk mode tanpa Supabase.
 * Hanya untuk dev / self-host — filesystem Vercel read-only, jadi kalau
 * dipakai di produksi tanpa Supabase, penulisan akan gagal dan pesannya
 * ditampilkan apa adanya ke admin.
 */
const CONTENT_DIR = path.join(process.cwd(), "content");

async function ensureDir(): Promise<void> {
  await fs.mkdir(CONTENT_DIR, { recursive: true });
}

/** Baca JSON; return null kalau file belum ada / rusak. */
export async function readJsonFile<T>(fileName: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(path.join(CONTENT_DIR, fileName), "utf8");
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function writeJsonFile(
  fileName: string,
  data: unknown,
): Promise<void> {
  await ensureDir();
  await fs.writeFile(
    path.join(CONTENT_DIR, fileName),
    JSON.stringify(data, null, 2),
    "utf8",
  );
}

export async function removeJsonFile(fileName: string): Promise<void> {
  await fs.rm(path.join(CONTENT_DIR, fileName), { force: true });
}

export const CONTENT_FILES = {
  catalog: "catalog.json",
  content: "site.json",
  payments: "payments.json",
  orders: "orders.json",
} as const;
