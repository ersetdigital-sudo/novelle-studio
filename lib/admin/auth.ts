import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "novelle_admin";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** Batas percobaan login supaya password tidak bisa di-brute force. */
const MAX_ATTEMPTS = 5;
const ATTEMPT_WINDOW_MS = 10 * 60 * 1000;

/**
 * Login aktif begitu ADMIN_PASSWORD diisi. Selama kosong, /admin terbuka
 * (praktis untuk dev) dan dashboard menampilkan peringatan.
 */
export const isAuthEnabled = (): boolean => Boolean(process.env.ADMIN_PASSWORD);

/**
 * Kunci HMAC. Tidak ada nilai cadangan hardcoded: kalau auth aktif tapi
 * rahasianya hilang, lebih baik gagal keras daripada memakai kunci yang bisa ditebak.
 */
function secret(): string {
  const configured = process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD;
  if (!configured) {
    throw new Error(
      "ADMIN_PASSWORD (atau ADMIN_SESSION_SECRET) belum diatur — sesi admin tidak bisa ditandatangani.",
    );
  }
  return configured;
}

/** Panjang digest selalu sama, jadi perbandingan tidak bocor lewat timing. */
function digest(value: string): Buffer {
  return createHmac("sha256", secret()).update(value).digest();
}

function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(digest(a), digest(b));
}

function createSessionToken(): string {
  const issuedAt = Date.now().toString();
  const signature = createHmac("sha256", secret()).update(issuedAt).digest("hex");
  return `${issuedAt}.${signature}`;
}

function verifySessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [issuedAt, signature] = token.split(".");
  if (!issuedAt || !signature) return false;
  if (!safeEqual(signature, createHmac("sha256", secret()).update(issuedAt).digest("hex"))) {
    return false;
  }
  const age = Date.now() - Number(issuedAt);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_SECONDS * 1000;
}

export async function isAuthorized(): Promise<boolean> {
  if (!isAuthEnabled()) return true;
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return verifySessionToken(token);
}

export async function startSession(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  if (!safeEqual(password, expected)) return false;

  const store = await cookies();
  store.set(COOKIE_NAME, createSessionToken(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function endSession(): Promise<void> {
  (await cookies()).delete(COOKIE_NAME);
}

/* ------------------------------------------------------------------ */
/* Rate limit login (per instance; cukup untuk memblokir brute force)   */
/* ------------------------------------------------------------------ */

const attempts = new Map<string, { count: number; firstAt: number }>();

export function isRateLimited(key: string): boolean {
  const entry = attempts.get(key);
  if (!entry) return false;
  if (Date.now() - entry.firstAt > ATTEMPT_WINDOW_MS) {
    attempts.delete(key);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

export function recordFailedAttempt(key: string): void {
  const entry = attempts.get(key);
  if (!entry || Date.now() - entry.firstAt > ATTEMPT_WINDOW_MS) {
    attempts.set(key, { count: 1, firstAt: Date.now() });
    return;
  }
  entry.count += 1;
}

export function clearAttempts(key: string): void {
  attempts.delete(key);
}

export const RATE_LIMIT_MAX_ATTEMPTS = MAX_ATTEMPTS;
