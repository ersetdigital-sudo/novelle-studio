/** Format angka rupiah tanpa desimal, contoh: 12500 -> "Rp12.500". */
export function rupiah(value: number): string {
  return "Rp" + value.toLocaleString("id-ID");
}

/** Format tanggal + jam ala Indonesia, contoh: "24 Sep 2026, 15.04". */
export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** Format tanggal lengkap, contoh: "Kamis, 24 September 2026 pukul 15.04 WIB". */
export function formatFullDateTime(iso: string): string {
  const date = new Date(iso);
  return (
    date.toLocaleString("id-ID", { dateStyle: "full", timeStyle: "short" }) +
    " WIB"
  );
}

/** Ambil jam saja, contoh: "15.04". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
