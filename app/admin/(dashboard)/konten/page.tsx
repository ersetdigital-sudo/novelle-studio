import { ContentEditor } from "@/components/admin/ContentEditor";
import { getContentSnapshot } from "@/lib/store/content";

export const metadata = { title: "Konten Situs", robots: { index: false, follow: false } };

export default async function AdminContentPage() {
  const { content, error } = await getContentSnapshot();

  return (
    <>
      <header className="mb-5">
        <h1 className="font-display text-2xl font-extrabold">Konten Situs</h1>
        <p className="mt-1 text-sm text-muted">
          Semua teks di halaman publik. Tiap kartu disimpan terpisah — menyimpan Hero tidak
          mengubah FAQ.
        </p>
      </header>

      {error && (
        <p className="mb-4 rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3 text-xs text-rose-700">
          {error}
        </p>
      )}

      <ContentEditor content={content} />
    </>
  );
}
