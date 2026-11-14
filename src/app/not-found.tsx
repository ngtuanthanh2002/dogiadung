import Link from "next/link";
import type { Metadata } from "next";
import { topCategories } from "@/data/categories";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
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
  );
}
