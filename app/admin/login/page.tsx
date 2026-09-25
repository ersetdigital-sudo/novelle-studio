import { LoginForm } from "@/components/admin/LoginForm";
import { LoginShell } from "@/components/admin/LoginShell";
import { isAuthEnabled } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Masuk Admin",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-cream px-4 py-10 sm:px-6">
      <LoginShell>
        <LoginForm />
      </LoginShell>
      {!isAuthEnabled() && (
        <p className="mx-auto mt-6 max-w-[420px] text-center text-xs text-muted">
          ADMIN_PASSWORD belum diisi, jadi login dinonaktifkan — dashboard terbuka untuk semua
          orang selama masa development.
        </p>
      )}
    </main>
  );
}
