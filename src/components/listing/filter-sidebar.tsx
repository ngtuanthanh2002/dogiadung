import Link from "next/link";
import { Check } from "lucide-react";
import { childrenOf, topLevel } from "@/data/categories";
import { filterByCategory } from "@/data/products";
import type { Category, Product } from "@/data/types";
import { applyFilters, buildListingHref, priceRanges, type ListingParams } from "@/lib/listing";
import { cn } from "@/lib/utils";

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line py-6 first:pt-0 last:border-0">
      <h3 className="mb-4 text-[13px] font-medium uppercase tracking-[0.14em] text-ink">{title}</h3>
      {children}
    </section>
  );
}

/** Ô vuông / tròn chỉ trạng thái chọn (thuần hiển thị, link mới là phần tương tác). */
function Indicator({ active, round = false }: { active: boolean; round?: boolean }) {
  return (
    <span
      className={cn(
        "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
        round ? "rounded-full" : "rounded-[3px]",
        active ? "border-ink bg-ink text-ivory" : "border-ink/30 bg-white group-hover:border-ink",
      )}
      aria-hidden
    >
      {active && (round ? <span className="h-1.5 w-1.5 rounded-full bg-ivory" /> : <Check className="h-3 w-3" strokeWidth={3} />)}
    </span>
  );
}

/**
 * Bộ lọc bên trái (kiểu sàn TMĐT, tối giản): danh mục, khoảng giá, giảm giá.
 * Mỗi lựa chọn là một link GET — hoạt động không cần JavaScript, URL có thể chia sẻ.
 */
export function FilterSidebar({
  products,
  categories,
  basePath,
  activeCategory,
  params,
  idPrefix,
}: {
  products: Product[];
  categories: Category[];
  basePath: string;
  activeCategory?: string;
  params: ListingParams;
  idPrefix: string;
}) {
  // Giữ các bộ lọc khác khi đổi danh mục / khoảng giá; luôn quay về trang 1
  const keep: ListingParams = { ...params, page: undefined };
  const count = (slug?: string) => applyFilters(slug ? filterByCategory(products, categories, slug) : products, { ...params, sort: undefined }).length;

  const catLink = (slug: string | undefined, label: string, level: 0 | 1) => {
    const href = buildListingHref(slug ? `/danh-muc/${slug}` : "/san-pham", keep);
    const active = (activeCategory ?? undefined) === slug;
    const n = count(slug);
    return (
      <Link
        href={href}
        aria-current={active ? "page" : undefined}
        className={cn(
          "group flex items-center justify-between gap-3 py-1.5 text-sm transition-colors",
          level === 1 && "pl-3.5",
          active ? "font-medium text-ink" : "text-ink-soft hover:text-ink",
          n === 0 && !active && "opacity-45",
        )}
      >
        <span className="flex items-center gap-2">
          {active && <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />}
          <span className="underline-offset-4 group-hover:underline">{label}</span>
        </span>
        <span className="text-[12px] tabular-nums text-muted">{n}</span>
      </Link>
    );
  };

  const priceActive = (min?: number, max?: number) => params.min === min && params.max === max;

  return (
    <div>
      <Group title="Danh mục">
        <ul className="space-y-0.5">
          <li>{catLink(undefined, "Tất cả sản phẩm", 0)}</li>
          {topLevel(categories).map((cat) => (
            <li key={cat.slug} className="pt-2">
              {catLink(cat.slug, cat.name, 0)}
              <ul className="mt-0.5 border-l border-line">
                {childrenOf(categories, cat.slug).map((child) => (
                  <li key={child.slug}>{catLink(child.slug, child.name, 1)}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Khoảng giá">
        <ul className="space-y-1">
          <li>
            <Link
              href={buildListingHref(basePath, { ...keep, min: undefined, max: undefined })}
              className="group flex items-center gap-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
            >
              <Indicator round active={!params.min && !params.max} />
              Tất cả mức giá
            </Link>
          </li>
          {priceRanges.map((r) => (
            <li key={r.label}>
              <Link
                href={buildListingHref(basePath, { ...keep, min: r.min, max: r.max })}
                aria-current={priceActive(r.min, r.max) ? "true" : undefined}
                className="group flex items-center gap-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
              >
                <Indicator round active={priceActive(r.min, r.max)} />
                {r.label}
              </Link>
            </li>
          ))}
        </ul>
        <form action={basePath} method="get" className="mt-4">
          {params.q && <input type="hidden" name="q" value={params.q} />}
          {params.sale && <input type="hidden" name="sale" value="1" />}
          {params.sort && <input type="hidden" name="sort" value={params.sort} />}
          <div className="flex items-center gap-2">
            <label htmlFor={`${idPrefix}-min`} className="sr-only">
              Giá từ
            </label>
            <input
              id={`${idPrefix}-min`}
              name="min"
              inputMode="numeric"
              placeholder="Từ ₫"
              defaultValue={params.min ?? ""}
              className="h-10 w-full min-w-0 rounded-full border border-line bg-white px-4 text-[13px] outline-none transition-colors placeholder:text-muted/70 hover:border-ink/40 focus:border-ink"
            />
            <span className="text-muted" aria-hidden>
              –
            </span>
            <label htmlFor={`${idPrefix}-max`} className="sr-only">
              Giá đến
            </label>
            <input
              id={`${idPrefix}-max`}
              name="max"
              inputMode="numeric"
              placeholder="Đến ₫"
              defaultValue={params.max ?? ""}
              className="h-10 w-full min-w-0 rounded-full border border-line bg-white px-4 text-[13px] outline-none transition-colors placeholder:text-muted/70 hover:border-ink/40 focus:border-ink"
            />
          </div>
          <button
            type="submit"
            className="mt-3 h-10 w-full cursor-pointer rounded-full bg-ink text-[13px] font-medium tracking-wide text-ivory transition-colors hover:bg-brand-600 active:scale-[0.99]"
          >
            Áp dụng
          </button>
        </form>
      </Group>

      <Group title="Ưu đãi">
        <Link
          href={buildListingHref(basePath, { ...keep, sale: !params.sale })}
          aria-current={params.sale ? "true" : undefined}
          className="group flex items-center gap-3 py-1 text-sm text-ink-soft transition-colors hover:text-ink"
        >
          <Indicator active={!!params.sale} />
          Đang giảm giá
        </Link>
      </Group>
    </div>
  );
}
