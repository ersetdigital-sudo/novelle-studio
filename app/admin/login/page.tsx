import { LoginForm } from "@/components/admin/LoginForm";
import { isAuthEnabled } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="min-h-[70vh] px-4 pb-16">
      <LoginForm />
      {!isAuthEnabled() && (
        <p className="mx-auto mt-4 max-w-sm text-center text-xs text-muted">
          ADMIN_PASSWORD belum diisi, jadi login dinonaktifkan — dashboard terbuka untuk semua
          orang selama masa development.
        </p>
      )}
    </main>
  );
}
