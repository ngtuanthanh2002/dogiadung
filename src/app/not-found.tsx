import Link from "next/link";
import type { Metadata } from "next";
import { topLevel } from "@/data/categories";
import { getCategories } from "@/lib/catalog";
import { buttonVariants } from "@/components/ui/button";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: true },
};

/** Trang 404 nằm ngoài layout cửa hàng nên tự gắn header / footer. */
export default async function NotFound() {
  const topCategories = topLevel(await getCategories().catch(() => []));
  return (
    <>
      <Header />
      <main id="main-content" className="flex-1">
        <div className="container-page flex flex-col items-center py-28 text-center md:py-40">
          <p className="eyebrow">Lỗi 404</p>
          <h1 className="mt-5 font-serif text-4xl md:text-6xl">Không tìm thấy trang</h1>
          <p className="mt-5 max-w-md text-muted">Trang bạn tìm có thể đã được đổi tên hoặc không còn tồn tại.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Link href="/" className={buttonVariants()}>
              Về trang chủ
            </Link>
            <Link href="/san-pham" className={buttonVariants({ variant: "outline" })}>
              Xem sản phẩm
            </Link>
          </div>
          <ul className="mt-14 flex flex-wrap justify-center gap-x-8 gap-y-3">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/danh-muc/${c.slug}`} className="font-serif text-lg text-ink-soft hover:text-ink">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <Footer />
    </>
  );
}
