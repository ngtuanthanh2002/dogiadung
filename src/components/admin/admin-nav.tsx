"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderTree, LayoutDashboard, Package, ReceiptText, Users } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Tổng quan", icon: LayoutDashboard, exact: true },
  { href: "/admin/don-hang", label: "Đơn hàng", icon: ReceiptText },
  { href: "/admin/san-pham", label: "Sản phẩm", icon: Package },
  { href: "/admin/danh-muc", label: "Danh mục", icon: FolderTree },
  { href: "/admin/khach-hang", label: "Khách hàng", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  return <NavList pathname={pathname} />;
}

/** Bản hiển thị trước khi biết đường dẫn hiện tại (dùng làm fallback của Suspense). */
export function NavList({ pathname }: { pathname?: string }) {
  return (
    <nav aria-label="Menu quản trị">
      <ul className="scrollbar-none flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {items.map(({ href, label, icon: Icon, exact }) => {
          const active = !!pathname && (exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));
          return (
            <li key={href} className="shrink-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-10 items-center gap-3 rounded-lg px-3 text-[14px] transition-colors",
                  active ? "bg-ink text-ivory" : "text-ink-soft hover:bg-sand hover:text-ink",
                )}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={1.6} aria-hidden />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
