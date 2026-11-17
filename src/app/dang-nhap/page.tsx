import { Suspense } from "react";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { getAdminSession } from "@/auth";
import { siteConfig } from "@/config/site";
import { LogoMark } from "@/components/layout/logo";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = {
  title: "Đăng nhập quản trị",
  description: `Đăng nhập khu vực quản trị ${siteConfig.name}.`,
  robots: { index: false, follow: false },
};

/** Đã đăng nhập (ví dụ phiên "ghi nhớ" còn hạn) → vào thẳng trang quản trị. */
async function RedirectIfSignedIn() {
  if (await getAdminSession()) redirect("/admin");
  return null;
}

/** Trang đăng nhập độc lập — không dùng header / footer của cửa hàng. */
export default function LoginPage() {
  return (
    <main id="main-content" className="flex min-h-screen flex-1 flex-col items-center justify-center bg-[#f6f4f0] px-4 py-12">
      <Suspense fallback={null}>
        <RedirectIfSignedIn />
      </Suspense>

      <div className="w-full max-w-[400px]">
        <div className="rounded-2xl border border-line bg-white px-6 py-8 shadow-[0_24px_48px_-28px_rgb(28_26_23/0.25)] sm:px-9 sm:py-10">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <span className="font-serif text-[22px] font-medium tracking-tight text-ink">{siteConfig.name}</span>
          </div>

          <h1 className="mt-8 font-serif text-[28px] leading-tight text-ink">Đăng nhập quản trị</h1>
          <p className="mt-2 flex items-center gap-1.5 text-[13px] text-muted">
            <ShieldCheck className="h-4 w-4 shrink-0" strokeWidth={1.7} aria-hidden />
            Chức năng chỉ dành cho nhà quản trị
          </p>

          <div className="mt-7">
            <Suspense fallback={<div className="h-[300px] animate-pulse rounded-lg bg-sand/50" />}>
              <LoginPanel />
            </Suspense>
          </div>
        </div>

        <Link href="/" className="mx-auto mt-6 flex w-fit items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          Quay lại cửa hàng
        </Link>
      </div>
    </main>
  );
}
