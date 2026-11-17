import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { ExternalLink, LogOut, ShieldCheck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/layout/logo";
import { AdminNav, NavList } from "@/components/admin/admin-nav";
import { logout } from "./actions";

export const metadata: Metadata = {
  title: { default: "Quản trị", template: `%s · Quản trị ${siteConfig.name}` },
  robots: { index: false, follow: false },
};

function ContentSkeleton() {
  return (
    <div aria-busy="true" aria-label="Đang tải">
      <div className="h-9 w-56 animate-pulse rounded-lg bg-sand" />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-sand/70" />
        ))}
      </div>
      <div className="mt-6 h-72 animate-pulse rounded-xl bg-sand/50" />
    </div>
  );
}

/**
 * Khung trang quản trị (không dùng header/footer của cửa hàng).
 * Việc kiểm tra quyền nằm ở từng trang (requireAdmin) vì layout không chạy lại khi chuyển trang.
 */
export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-screen bg-[#f6f4f0] lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <aside className="border-b border-line bg-ivory lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between gap-3 px-5 py-4 lg:block lg:px-6 lg:py-7">
          <Logo />
          <p className="flex items-center gap-1.5 text-[12px] text-muted lg:mt-3">
            <ShieldCheck className="h-3.5 w-3.5" strokeWidth={1.8} aria-hidden />
            Chỉ dành cho nhà quản trị
          </p>
        </div>
        <div className="px-3 pb-3 lg:flex-1 lg:px-4 lg:pb-0">
          <Suspense fallback={<NavList />}>
            <AdminNav />
          </Suspense>
        </div>
        <div className="hidden border-t border-line p-4 lg:block">
          <Link
            href="/"
            target="_blank"
            className="flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] text-ink-soft transition-colors hover:bg-sand hover:text-ink"
          >
            <ExternalLink className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
            Xem cửa hàng
          </Link>
          <form action={logout}>
            <button
              type="submit"
              className="flex h-10 w-full cursor-pointer items-center gap-3 rounded-lg px-3 text-[14px] text-ink-soft transition-colors hover:bg-brand-50 hover:text-brand-700"
            >
              <LogOut className="h-[18px] w-[18px]" strokeWidth={1.6} aria-hidden />
              Đăng xuất
            </button>
          </form>
        </div>
      </aside>

      <main id="main-content" className="min-w-0 px-5 py-8 md:px-8 lg:px-10 lg:py-10">
        <Suspense fallback={<ContentSkeleton />}>{children}</Suspense>
        {/* Mobile: thao tác tài khoản ở cuối trang */}
        <div className="mt-12 flex gap-2 border-t border-line pt-6 lg:hidden">
          <Link href="/" target="_blank" className="flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-ink-soft hover:bg-sand">
            <ExternalLink className="h-4 w-4" aria-hidden /> Xem cửa hàng
          </Link>
          <form action={logout}>
            <button type="submit" className="flex h-10 cursor-pointer items-center gap-2 rounded-lg px-3 text-sm text-ink-soft hover:bg-brand-50 hover:text-brand-700">
              <LogOut className="h-4 w-4" aria-hidden /> Đăng xuất
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
