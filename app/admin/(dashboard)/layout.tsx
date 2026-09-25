import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/admin/actions";
import { AdminMobileNav, AdminSidebar } from "@/components/admin/AdminSidebar";
import { isAuthEnabled, isAuthorized } from "@/lib/admin/auth";
import { getContentSnapshot } from "@/lib/store/content";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Panel Admin",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await isAuthorized())) redirect("/admin/login");

  const [{ content, error }, authEnabled] = [await getContentSnapshot(), isAuthEnabled()];

  return (
    <div
      className="min-h-screen bg-cream"
      style={{
        fontFamily:
          'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      }}
    >
      <div className="lg:flex">
        <AdminSidebar brandName={content.settings.name} authEnabled={authEnabled} />

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b-2 border-line bg-white/85 backdrop-blur-md">
            <div className="flex h-16 items-center gap-2 px-4 lg:px-8">
              <div className="mr-auto lg:hidden">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Panel Admin
                </p>
                <p className="font-display text-sm font-extrabold">{content.settings.name}</p>
              </div>

              <div className="ml-auto flex items-center gap-2">
                <Link href="/" target="_blank" className="btn btn-ghost px-4 py-2 text-xs">
                  Lihat Situs ↗
                </Link>

                {authEnabled ? (
                  <form action={logoutAction}>
                    <button type="submit" className="btn btn-ghost px-4 py-2 text-xs">
                      Keluar
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </header>

          <AdminMobileNav />

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-[1120px] space-y-5">
              {!authEnabled && (
                <div className="rounded-2xl border-2 border-orange-soft bg-orange-soft/60 px-4 py-3.5 text-xs text-orange-dark">
                  <b>Siapa pun bisa membuka halaman ini.</b> Isi ADMIN_PASSWORD di .env.local
                  sebelum menyambungkan Supabase supaya tidak ada yang bisa mengubah harga.
                </div>
              )}
              {error && (
                <div className="rounded-2xl border-2 border-rose-200 bg-rose-50 px-4 py-3.5 text-xs text-rose-700">
                  Data terbaru gagal dimuat ({error}) — yang tampil mungkin berasal dari cadangan.
                </div>
              )}
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
