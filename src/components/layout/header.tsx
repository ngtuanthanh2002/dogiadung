import Link from "next/link";
import { Phone } from "lucide-react";
import { siteConfig } from "@/config/site";
import { categories, getChildren, topCategories } from "@/data/categories";
import { formatPrice } from "@/lib/utils";
import { CartButton, CartDrawer } from "@/components/cart/cart-drawer";
import { AccountButton } from "@/components/auth/account-button";
import { DesktopNav } from "./desktop-nav";
import { HeaderSearch } from "./header-search";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

const mobileLinks = [
  { label: "Tất cả", href: "/san-pham" },
  ...topCategories.map((c) => ({ label: c.name, href: `/danh-muc/${c.slug}` })),
  { label: "Giới thiệu", href: "/gioi-thieu" },
  { label: "Liên hệ", href: "/lien-he" },
];

export function Header() {
  const navCategories = topCategories.map((c) => ({
    slug: c.slug,
    name: c.name,
    children: getChildren(c.slug).map((child) => ({ slug: child.slug, name: child.name })),
  }));
  const searchCategories = categories.filter((c) => c.parent).map((c) => ({ slug: c.slug, name: c.name }));

  return (
    <>
      <div className="bg-ink text-ivory/85">
        <p className="container-page py-2 text-center text-[12px] tracking-wide">
          Thanh toán khi nhận hàng
          <span className="mx-3 text-ivory/30" aria-hidden>
            |
          </span>
          Miễn phí giao hàng cho đơn từ {formatPrice(siteConfig.freeShippingThreshold)}
          <span className="hidden sm:inline">
            <span className="mx-3 text-ivory/30" aria-hidden>
              |
            </span>
            Đổi trả trong 7 ngày
          </span>
        </p>
      </div>

      {/* Hàng 1 (dính khi cuộn): logo — thanh tìm kiếm — giỏ hàng */}
      <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur-md">
        <div className="container-page flex h-16 items-center gap-4 lg:h-20 lg:gap-10">
          <div className="flex shrink-0 items-center gap-1 lg:w-60 xl:w-72">
            <MobileMenu categories={navCategories} />
            <Logo />
          </div>

          <HeaderSearch className="mx-auto hidden max-w-2xl md:block" categories={searchCategories} />

          <div className="ml-auto flex shrink-0 items-center justify-end gap-1 md:ml-0 lg:w-60 lg:gap-1.5 xl:w-72">
            <a
              href={siteConfig.contact.hotlineHref}
              title="Gọi hotline"
              className="mr-1 hidden h-10 items-center gap-2 whitespace-nowrap rounded-full px-2 text-sm text-ink transition-colors hover:bg-sand xl:flex"
            >
              <Phone className="h-4 w-4 text-muted" strokeWidth={1.6} aria-hidden />
              {siteConfig.contact.hotline}
            </a>
            <AccountButton />
            <CartButton />
          </div>
        </div>
        <div className="container-page pb-3 md:hidden">
          <HeaderSearch categories={searchCategories} placeholder="Bạn cần tìm gì?" />
        </div>
      </header>

      {/* Hàng 2: menu nằm dưới thanh tìm kiếm */}
      <div className="relative z-30 hidden border-b border-line bg-ivory lg:block">
        <DesktopNav />
      </div>
      <nav aria-label="Danh mục" className="border-b border-line bg-ivory lg:hidden">
        <ul className="scrollbar-none container-page flex gap-6 overflow-x-auto py-3 text-[13px]">
          {mobileLinks.map((l) => (
            <li key={l.href} className="shrink-0">
              <Link href={l.href} className="text-ink-soft transition-colors hover:text-brand-600">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <CartDrawer />
    </>
  );
}
