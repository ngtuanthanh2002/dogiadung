import { Suspense } from "react";
import type { Metadata } from "next";
import { Banknote, PackageCheck, Zap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LogoMark } from "@/components/layout/logo";
import { LoginPanel } from "@/components/auth/login-panel";

export const metadata: Metadata = pageMetadata({
  title: "Đăng nhập",
  description: `Đăng nhập ${siteConfig.name} bằng tài khoản Google.`,
  path: "/dang-nhap",
  noIndex: true,
});

const perks = [
  { icon: Zap, text: "Tự điền họ tên, email khi thanh toán" },
  { icon: PackageCheck, text: "Quản lý thông tin tài khoản dễ dàng" },
  { icon: Banknote, text: "Vẫn thanh toán khi nhận hàng như thường" },
];

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-16 md:py-24">
      <div className="w-full max-w-md">
        <div className="text-center">
          <LogoMark className="mx-auto h-12 w-12" />
          <h1 className="mt-6 font-serif text-4xl">Đăng nhập</h1>
          <p className="mt-3 text-muted">Chỉ một bước với tài khoản Google của bạn.</p>
        </div>

        <div className="mt-10 border border-line bg-white/60 p-6 md:p-8">
          <Suspense fallback={<div className="h-14 animate-pulse rounded-full bg-sand" />}>
            <LoginPanel />
          </Suspense>
        </div>

        <ul className="mt-10 space-y-3">
          {perks.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-ink-soft">
              <Icon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
