import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/** Khung chung của các trang cửa hàng (header, footer). Trang /admin không dùng layout này. */
export default function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}
