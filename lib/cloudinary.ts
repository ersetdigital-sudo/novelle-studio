/**
 * Helper URL Cloudinary — boleh dipakai client & server.
 *
 * File ini sengaja TIDAK menyentuh CLOUDINARY_API_KEY / API_SECRET:
 * yang di sini hanya penyusun URL transformasi publik, jadi aman masuk bundle
 * browser. Proses tanda tangan (hapus gambar) ada di app/api/cloudinary/route.ts.
 */

const RES_HOST = /^https?:\/\/res\.cloudinary\.com\//i;
const UPLOAD_MARKER = "/upload/";

export interface ImageTransform {
  /** Lebar piksel. Kalau dihilangkan, Cloudinary memakai ukuran asli. */
  width?: number;
  height?: number;
  /**
   * `fill` = potong biar pas bidang (ada whitespace kebuang).
   * `fit`  = muat utuh tanpa potong — dipakai untuk QR supaya quiet zone aman.
   */
  crop?: "fill" | "fit";
  /**
   * Kualitas dikompres lagi saat pengiriman. Default `auto` (q_auto).
   * Set `none` untuk aset yang sudah dikompres saat unggahan oleh preset
   * `modigi` — kompresi ganda bisa merusak detail, dan pada QR kode itu
   * menurunkan keberhasilan scan.
   */
  quality?: "auto" | "none";
}

export function isCloudinaryUrl(url: string): boolean {
  return RES_HOST.test(url.trim());
}

/** Tambahkan parameter transformasi ke URL Cloudinary. URL lain dibiarkan apa adanya. */
export function optimizeCloudinaryUrl(
  url: string,
  transform: ImageTransform = {},
): string {
  const trimmed = url.trim();
  if (!isCloudinaryUrl(trimmed)) return trimmed;

  const index = trimmed.indexOf(UPLOAD_MARKER);
  if (index === -1) return trimmed;

  // Sudah ada transformasi tertanam di URL — jangan ditumpuk, tiap transformasi
  // ekstra tetap memotong kuota Cloudinary.
  const after = trimmed.slice(index + UPLOAD_MARKER.length);
  if (after.startsWith("f_auto/") || after.startsWith("f_auto,")) return trimmed;

  const parts: string[] = ["f_auto"];
  if ((transform.quality ?? "auto") === "auto") parts.push("q_auto");
  if (transform.crop) parts.push(transform.crop === "fill" ? "c_fill" : "c_fit");
  if (transform.width) parts.push(`w_${Math.max(1, Math.round(transform.width))}`);
  if (transform.height) parts.push(`h_${Math.max(1, Math.round(transform.height))}`);

  const head = trimmed.slice(0, index + UPLOAD_MARKER.length);
  return `${head}${parts.join(",")}/${after}`;
}

const isTransformSegment = (segment: string): boolean =>
  segment.length > 0 &&
  !segment.includes(".") &&
  /^(t_|[a-z]+_[^/]*)/.test(segment);

/**
 * Ambil public_id dari secure_url Cloudinary — dipakai untuk menghapus aset lama.
 * Contoh: `https://res.cloudinary.com/x/image/upload/f_auto,q_auto/v123/folder/abc.jpg`
 * → `folder/abc`.
 */
export function extractCloudinaryPublicId(url: string): string | null {
  const trimmed = url.trim();
  if (!isCloudinaryUrl(trimmed)) return null;

  const withoutQuery = trimmed.split(/[?#]/)[0] ?? "";
  const index = withoutQuery.indexOf(UPLOAD_MARKER);
  if (index === -1) return null;

  let rest = withoutQuery.slice(index + UPLOAD_MARKER.length);
  let segment = rest.split("/")[0] ?? "";
  while (segment && (isTransformSegment(segment) || /^v\d+$/.test(segment))) {
    rest = rest.slice(segment.length + 1);
    segment = rest.split("/")[0] ?? "";
  }

  // public_id di Cloudinary tanpa ekstensi file.
  const lastSlash = rest.lastIndexOf("/");
  const dot = rest.lastIndexOf(".");
  return dot > lastSlash ? rest.slice(0, dot) : rest || null;
}

/**
 * Pengaturan transformasi per keperluan.
 * `quality: "none"` karena preset unggahan sudah kompres — QR tidak boleh
 * dikompres dua kali, dan sisi pengirimannya cukup mengecilkan lebar saja.
 */
export const QR_TRANSFORM: ImageTransform = {
  crop: "fit",
  quality: "none",
  width: 600,
};

export const THUMB_TRANSFORM: ImageTransform = {
  crop: "fill",
  quality: "none",
  width: 320,
  height: 320,
};
