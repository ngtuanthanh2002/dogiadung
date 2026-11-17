import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import type { Category } from "@/data/types";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

const linkClass =
  "relative flex h-full items-center gap-1 text-[14px] tracking-wide text-ink-soft transition-colors hover:text-ink after:absolute after:inset-x-0 after:bottom-3 after:h-px after:origin-left after:scale-x-0 after:bg-ink after:transition-transform after:duration-300 hover:after:scale-x-100";

/** Menu desktop (hàng dưới thanh tìm kiếm) — danh mục có bảng thả xuống thuần CSS (hover / focus). */
export function DesktopNav({ tree }: { tree: (Category & { children: Category[] })[] }) {
  return (
    <nav aria-label="Menu chính" className="container-page h-12">
      <ul className="flex h-full items-center justify-center gap-10">
        <li className="h-full">
          <Link href="/san-pham" className={linkClass}>
            Sản phẩm
          </Link>
        </li>
        {tree.map((cat) => {
          const children = cat.children;
          return (
            <li key={cat.slug} className="group h-full">
              <Link href={`/danh-muc/${cat.slug}`} className={linkClass} aria-haspopup="true">
                {cat.name}
                <ChevronDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180" aria-hidden />
              </Link>
              <div className="invisible absolute inset-x-0 top-full border-t border-line bg-ivory opacity-0 shadow-[0_24px_40px_-24px_rgb(0_0_0/0.18)] transition-all duration-300 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                <div className="container-page grid grid-cols-[1fr_1fr_1.3fr] gap-12 py-10">
                  <div>
                    <p className="eyebrow">{cat.name}</p>
                    <ul className="mt-5 space-y-3">
                      {children.map((child) => (
                        <li key={child.slug}>
                          <Link href={`/danh-muc/${child.slug}`} className="font-serif text-lg text-ink transition-colors hover:text-brand-600">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-between">
                    <p className="text-sm leading-relaxed text-muted">{cat.description}</p>
                    <Link
                      href={`/danh-muc/${cat.slug}`}
                      className="group/link mt-6 inline-flex items-center gap-2 text-sm font-medium text-ink"
                    >
                      Xem tất cả {cat.name.toLowerCase()}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover/link:translate-x-1" aria-hidden />
                    </Link>
                  </div>
                  <Link href={`/danh-muc/${cat.slug}`} className="relative block aspect-[16/10] overflow-hidden rounded-sm bg-sand" tabIndex={-1}>
                    <Image src={cat.image || PLACEHOLDER_IMAGE} alt={cat.name} fill sizes="480px" className="object-cover" />
                  </Link>
                </div>
              </div>
            </li>
          );
        })}
        <li className="h-full">
          <Link href="/gioi-thieu" className={linkClass}>
            Giới thiệu
          </Link>
        </li>
        <li className="h-full">
          <Link href="/lien-he" className={linkClass}>
            Liên hệ
          </Link>
        </li>
      </ul>
    </nav>
  );
}
