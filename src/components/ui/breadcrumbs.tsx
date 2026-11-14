import Link from "next/link";
import { absoluteUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";
import { JsonLd } from "./json-ld";

export type Crumb = { label: string; href?: string };

/** Breadcrumb hiển thị + BreadcrumbList JSON-LD cho Google. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  const all: Crumb[] = [{ label: "Trang chủ", href: "/" }, ...items];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };

  return (
    <nav aria-label="Breadcrumb" className={cn("py-6 text-[13px]", className)}>
      <JsonLd data={jsonLd} />
      <ol className="flex flex-wrap items-center gap-2 text-muted">
        {all.map((item, index) => {
          const isLast = index === all.length - 1;
          return (
            <li key={`${item.label}-${index}`} className="flex items-center gap-2">
              {index > 0 && (
                <span className="text-muted/50" aria-hidden>
                  /
                </span>
              )}
              {item.href && !isLast ? (
                <Link href={item.href} className="transition-colors hover:text-ink">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={isLast ? "page" : undefined} className="line-clamp-1 text-ink">
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
