import { FloatingCS } from "@/components/layout/FloatingCS";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      {children}
      <Footer />
      <FloatingCS />
    </>
  );
}
