"use client";

import { useState } from "react";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { useSession } from "next-auth/react";
import { ChevronDown, Menu, Phone, UserRound, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { Logo } from "./logo";

type NavCategory = { slug: string; name: string; children: { slug: string; name: string }[] };

export function MobileMenu({ categories }: { categories: NavCategory[] }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const { data: session } = useSession();

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-ink hover:bg-sand lg:hidden"
          aria-label="Mở menu"
        >
          <Menu className="h-5 w-5" strokeWidth={1.6} aria-hidden />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 left-0 z-50 flex w-[88%] max-w-sm flex-col bg-ivory shadow-2xl outline-none data-[state=closed]:animate-slide-out-left data-[state=open]:animate-slide-in-left">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <span onClick={close}>
              <Logo />
            </span>
            <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-sand" aria-label="Đóng menu">
              <X className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Title className="sr-only">Menu</Dialog.Title>
          <Dialog.Description className="sr-only">Danh mục và liên kết của cửa hàng</Dialog.Description>

          <nav aria-label="Menu di động" className="flex-1 overflow-y-auto px-5 py-4">
            <Link href="/san-pham" onClick={close} className="block border-b border-line py-4 font-serif text-xl transition-colors hover:text-brand-600">
              Tất cả sản phẩm
            </Link>
            {categories.map((cat) => (
              <details key={cat.slug} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between py-4 font-serif text-xl transition-colors hover:text-brand-600 [&::-webkit-details-marker]:hidden">
                  {cat.name}
                  <ChevronDown className="h-4 w-4 text-muted transition-transform group-open:rotate-180" aria-hidden />
                </summary>
                <ul className="space-y-3 pb-5 pl-1">
                  <li>
                    <Link href={`/danh-muc/${cat.slug}`} onClick={close} className="text-[15px] font-medium text-ink">
                      Xem tất cả
                    </Link>
                  </li>
                  {cat.children.map((child) => (
                    <li key={child.slug}>
                      <Link href={`/danh-muc/${child.slug}`} onClick={close} className="text-[15px] text-ink-soft transition-colors hover:text-ink">
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            ))}
            <Link href="/gioi-thieu" onClick={close} className="block border-b border-line py-4 font-serif text-xl transition-colors hover:text-brand-600">
              Giới thiệu
            </Link>
            <Link href="/lien-he" onClick={close} className="block border-b border-line py-4 font-serif text-xl transition-colors hover:text-brand-600">
              Liên hệ
            </Link>
          </nav>

          <Link
            href={session?.user ? "/tai-khoan" : "/dang-nhap"}
            onClick={close}
            className="flex items-center gap-3 border-t border-line px-5 py-4 text-sm transition-colors hover:bg-sand/60"
          >
            <UserRound className="h-4 w-4 text-muted" strokeWidth={1.6} aria-hidden />
            {session?.user ? <span>Tài khoản · <span className="font-medium">{session.user.name}</span></span> : <span>Đăng nhập bằng Google</span>}
          </Link>
          <a href={siteConfig.contact.hotlineHref} className="flex items-center gap-3 border-t border-line px-5 py-5 text-sm transition-colors hover:bg-sand/60">
            <Phone className="h-4 w-4 text-muted" strokeWidth={1.6} aria-hidden />
            <span className="text-muted">Hotline</span>
            <span className="font-medium">{siteConfig.contact.hotline}</span>
          </a>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
