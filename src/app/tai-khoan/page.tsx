import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ArrowRight, LogOut, UserRound } from "lucide-react";
import { auth, signOut } from "@/auth";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { GoogleIcon } from "@/components/auth/google-icon";

export const metadata: Metadata = pageMetadata({
  title: "Tài khoản của tôi",
  description: `Thông tin tài khoản ${siteConfig.name}.`,
  path: "/tai-khoan",
  noIndex: true,
});

const quickLinks = [
  { label: "Tiếp tục mua sắm", href: "/san-pham" },
  { label: "Giỏ hàng & thanh toán", href: "/thanh-toan" },
  { label: "Hướng dẫn mua hàng", href: "/chinh-sach/huong-dan-mua-hang" },
  { label: "Chính sách đổi trả", href: "/chinh-sach/chinh-sach-bao-hanh-doi-tra" },
  { label: "Liên hệ hỗ trợ", href: "/lien-he" },
];

async function logout() {
  "use server";
  await signOut({ redirectTo: "/" });
}

/** Đọc phiên đăng nhập (cookie) — phải nằm trong <Suspense> khi bật Cache Components. */
async function AccountDetails() {
  const session = await auth();
  const user = session?.user;
  if (!user) redirect("/dang-nhap?callbackUrl=/tai-khoan");

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-20">
      <section aria-labelledby="profile-heading">
        <div className="flex items-center gap-5">
          {user.image ? (
            <Image src={user.image} alt={user.name ?? ""} width={72} height={72} className="h-18 w-18 rounded-full object-cover ring-1 ring-line" />
          ) : (
            <span className="flex h-18 w-18 items-center justify-center rounded-full bg-sand">
              <UserRound className="h-8 w-8 text-muted" strokeWidth={1.4} aria-hidden />
            </span>
          )}
          <div>
            <p className="text-sm text-muted">Xin chào,</p>
            <h2 id="profile-heading" className="font-serif text-3xl">
              {user.name ?? "bạn"}
            </h2>
          </div>
        </div>

        <dl className="mt-10 divide-y divide-line border-y border-line text-[15px]">
          <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
            <dt className="text-muted">Họ và tên</dt>
            <dd>{user.name ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
            <dt className="text-muted">Email</dt>
            <dd className="break-all">{user.email ?? "—"}</dd>
          </div>
          <div className="grid grid-cols-[140px_1fr] gap-4 py-4">
            <dt className="text-muted">Đăng nhập bằng</dt>
            <dd className="flex items-center gap-2">
              <GoogleIcon className="h-4 w-4" /> Google
            </dd>
          </div>
        </dl>
        <p className="mt-4 text-[13px] text-muted">
          Họ tên và email sẽ được điền sẵn ở bước thanh toán. Đơn hàng vẫn được thanh toán khi nhận hàng (COD).
        </p>

        <form action={logout} className="mt-10">
          <button
            type="submit"
            className="group inline-flex h-11 cursor-pointer items-center gap-2 rounded-full border border-line px-6 text-sm text-ink-soft transition-colors hover:border-brand-600 hover:text-brand-600"
          >
            <LogOut className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" aria-hidden />
            Đăng xuất
          </button>
        </form>
      </section>

      <aside aria-labelledby="links-heading">
        <h2 id="links-heading" className="eyebrow">
          Lối tắt
        </h2>
        <ul className="mt-5 divide-y divide-line border-y border-line">
          {quickLinks.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="group flex items-center justify-between py-4 text-[15px] text-ink-soft transition-colors hover:text-ink">
                {l.label}
                <ArrowRight className="h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-1 group-hover:text-ink" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function AccountSkeleton() {
  return (
    <div aria-busy="true" className="max-w-xl">
      <div className="flex items-center gap-5">
        <div className="h-18 w-18 animate-pulse rounded-full bg-sand" />
        <div className="h-8 w-48 animate-pulse bg-sand" />
      </div>
      <div className="mt-10 h-40 animate-pulse bg-sand/60" />
    </div>
  );
}

export default function AccountPage() {
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: "Tài khoản" }]} />
      <h1 className="pb-12 pt-6 font-serif text-4xl md:pt-10 md:text-[56px]">Tài khoản của tôi</h1>
      <Suspense fallback={<AccountSkeleton />}>
        <AccountDetails />
      </Suspense>
    </div>
  );
}
