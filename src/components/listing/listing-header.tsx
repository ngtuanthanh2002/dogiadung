import Link from "next/link";
import { Breadcrumbs, type Crumb } from "@/components/ui/breadcrumbs";
import { cn } from "@/lib/utils";

export type ChipLink = { label: string; href: string; active?: boolean };

/** Đầu trang danh sách: breadcrumb, tiêu đề, mô tả và các danh mục con dạng "chip". */
export function ListingHeader({
  title,
  description,
  breadcrumbs,
  chips,
}: {
  title: string;
  description: string;
  breadcrumbs: Crumb[];
  chips?: ChipLink[];
}) {
  return (
    <header className="container-page">
      <Breadcrumbs items={breadcrumbs} />
      <div className="pb-8 pt-2 md:pb-10 md:pt-4">
        <h1 className="font-serif text-[34px] leading-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">{description}</p>
        {chips && chips.length > 0 && (
          <nav aria-label="Danh mục con" className="mt-8">
            <ul className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 lg:mx-0 lg:flex-wrap lg:px-0">
              {chips.map((chip) => (
                <li key={chip.href} className="shrink-0">
                  <Link
                    href={chip.href}
                    aria-current={chip.active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-10 items-center rounded-full border px-5 text-[13px] transition-colors",
                      chip.active ? "border-ink bg-ink text-ivory" : "border-line text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {chip.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}
