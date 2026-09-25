import { createHash } from "node:crypto";

import { NextResponse } from "next/server";

import { isAuthorized } from "@/lib/admin/auth";

/**
 * Hapus aset Cloudinary lama saat gambar diganti / dihapus dari dashboard.
 *
 * Endpoint destroy Cloudinary mewajibkan signature, jadi CLOUDINARY_API_SECRET
 * hanya hidup di file ini (server). Client cukup memanggil DELETE dengan
 * public_id — tidak pernah menerima secret.
 */

const CLOUD =
  process.env.CLOUDINARY_CLOUD_NAME ?? process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ?? "";
const API_KEY = process.env.CLOUDINARY_API_KEY ?? "";
const API_SECRET = process.env.CLOUDINARY_API_SECRET ?? "";

/** Cloudinary: parameter diurutkan alfa, digabung, lalu di-sha1 bersama secret. */
function signatureOf(params: Record<string, string>): string {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");
  return createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

/** public_id dari Cloudinary: path folder + nama, tanpa ekstensi. */
const isSafePublicId = (value: unknown): value is string =>
  typeof value === "string" &&
  value.length > 0 &&
  value.length <= 512 &&
  // Tanpa karakter kontrol / traversal yang tidak mungkin muncul di public_id.
  !/[\u0000-\u001f\\/]/.test(value);

export async function DELETE(request: Request): Promise<NextResponse> {
  if (!(await isAuthorized())) {
    return NextResponse.json({ message: "Sesi tidak sah. Silakan login ulang." }, { status: 401 });
  }

  if (!CLOUD || !API_KEY || !API_SECRET) {
    return NextResponse.json(
      { message: "Cloudinary belum dikonfigurasi di server." },
      { status: 501 },
    );
  }

  const payload = (await request.json().catch(() => null)) as { public_id?: unknown } | null;
  if (!payload || !isSafePublicId(payload.public_id)) {
    return NextResponse.json(
      { message: "public_id tidak valid." },
      { status: 400 },
    );
  }

  const params = {
    public_id: payload.public_id,
    timestamp: Math.floor(Date.now() / 1000).toString(),
  };

  const body = new URLSearchParams({
    ...params,
    api_key: API_KEY,
    signature: signatureOf(params),
  });

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD}/image/destroy`,
      { method: "POST", body },
    );
    const data = (await response.json().catch(() => ({}))) as { result?: string };

    // "not found" bukan kegagalan: gambar lama sudah tidak ada.
    if (!response.ok && data.result !== "not found") {
      return NextResponse.json(
        { message: `Cloudinary menolak (${response.status}).` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true, result: data.result ?? "ok" });
  } catch {
    return NextResponse.json(
      { message: "Gagal menghubungi Cloudinary." },
      { status: 502 },
    );
  }
}
