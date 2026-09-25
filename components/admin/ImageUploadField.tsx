"use client";

import { useEffect, useRef, useState } from "react";

import { inputClass, labelClass } from "@/components/admin/fields";
import {
  extractCloudinaryPublicId,
  isCloudinaryUrl,
  optimizeCloudinaryUrl,
  THUMB_TRANSFORM,
} from "@/lib/cloudinary";

const MAX_SIZE_MB = 2;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];
const ACCEPT_LABEL = "PNG, JPG, atau WebP";

const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

/**
 * Hapus aset Cloudinary lama di latar belakang. Gagal di sini tidak boleh
 * membatalkan simpan — gambar yatim tidak merusak apa pun, cuma makan storage.
 */
async function removeHostedImage(url: string): Promise<void> {
  const publicId = extractCloudinaryPublicId(url);
  if (!publicId) return;
  try {
    await fetch("/api/cloudinary", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ public_id: publicId }),
    });
  } catch {
    /* sengaja diabaikan */
  }
}

/**
 * Unggah gambar langsung browser → Cloudinary (unsigned preset).
 * File tidak lewat server. Kalau Cloudinary belum diisi, admin tetap bisa
 * menempel URL gambar manual.
 *
 * Saat gambar diganti, aset Cloudinary lama ikut dihapus supaya storage
 * tidak menumpuk.
 */
export function ImageUploadField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  /** Pratinjau file terpilih — tampil sebelum unggahan selesai. */
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (pendingPreview) URL.revokeObjectURL(pendingPreview);
    },
    [pendingPreview],
  );

  function clearPendingPreview(): void {
    setPendingPreview((current) => {
      if (current) URL.revokeObjectURL(current);
      return null;
    });
  }

  async function upload(file: File): Promise<void> {
    setError("");

    if (!ACCEPTED.includes(file.type)) {
      setError(`Format harus ${ACCEPT_LABEL}.`);
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`Ukuran maksimal ${MAX_SIZE_MB} MB (file ini ${(
        file.size /
        1024 /
        1024
      ).toFixed(1)} MB).`);
      return;
    }

    // Pratinjau segera muncul, sebelum Cloudinary merespons.
    clearPendingPreview();
    setPendingPreview(URL.createObjectURL(file));
    setBusy(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("upload_preset", uploadPreset!);

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        { method: "POST", body },
      );
      if (!response.ok) {
        throw new Error("Cloudinary menolak file ini.");
      }
      const data = (await response.json()) as { secure_url?: string };
      if (!data.secure_url) throw new Error("URL gambar tidak diterima.");

      const previous = value;
      clearPendingPreview();
      onChange(data.secure_url);

      if (previous && previous !== data.secure_url && isCloudinaryUrl(previous)) {
        void removeHostedImage(previous);
      }
    } catch (cause) {
      clearPendingPreview();
      setError(cause instanceof Error ? cause.message : "Upload gagal.");
    } finally {
      setBusy(false);
    }
  }

  async function clear(): Promise<void> {
    const previous = value;
    setError("");
    clearPendingPreview();
    onChange("");
    if (isCloudinaryUrl(previous)) void removeHostedImage(previous);
  }

  const previewSrc = pendingPreview ?? (value ? optimizeCloudinaryUrl(value, THUMB_TRANSFORM) : "");

  return (
    <div>
      <span className={labelClass}>{label}</span>
      <div className="flex flex-wrap items-center gap-3">
        {previewSrc ? (
          <span className="relative block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewSrc}
              alt="Pratinjau gambar terpilih"
              loading="lazy"
              className="h-16 w-16 rounded-xl border-2 border-line object-cover"
            />
            {busy && (
              <span className="absolute inset-0 grid place-items-center rounded-xl bg-ink/70 text-[9px] font-bold text-white">
                unggah…
              </span>
            )}
          </span>
        ) : (
          <span className="grid h-16 w-16 place-items-center rounded-xl border-2 border-dashed border-line text-[10px] text-muted">
            kosong
          </span>
        )}

        {isCloudinaryConfigured ? (
          <>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED.join(",")}
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void upload(file);
                event.target.value = "";
              }}
            />
            <button
              type="button"
              className="btn btn-ghost px-4 py-2 text-xs"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? "Mengunggah…" : value ? "Ganti gambar" : "Pilih gambar"}
            </button>
            {value && !busy && (
              <button
                type="button"
                className="text-xs font-semibold text-rose-600 hover:underline"
                onClick={() => void clear()}
              >
                Hapus
              </button>
            )}
          </>
        ) : (
          <span className="text-[11px] text-muted">
            Cloudinary belum dikonfigurasi — tempel URL gambar manual di bawah.
          </span>
        )}
      </div>

      <input
        className={`${inputClass} mt-2 text-xs`}
        value={value}
        placeholder="https://…"
        onChange={(event) => {
          clearPendingPreview();
          onChange(event.target.value);
        }}
      />
      {(error || hint) && (
        <span className={`mt-1 block text-[11px] ${error ? "text-rose-600" : "text-muted"}`}>
          {error || hint}
        </span>
      )}
      {!error && isCloudinaryConfigured && (
        <span className="mt-1 block text-[11px] text-muted">
          Maksimal {MAX_SIZE_MB} MB · {ACCEPT_LABEL} · otomatis dikompres saat ditampilkan.
        </span>
      )}
    </div>
  );
}
