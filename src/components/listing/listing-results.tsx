import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { filterByCategory, sortOptions, sortProducts } from "@/data/products";
import { applyFilters, buildListingHref, parseListingParams, priceLabel } from "@/lib/listing";
import { getAllProducts, getCategories } from "@/lib/catalog";
import { cn } from "@/lib/utils";
import { ProductGrid } from "@/components/product/product-card";
import { buttonVariants } from "@/components/ui/button";
import { FilterSidebar } from "./filter-sidebar";
import { SortSelect } from "./sort-select";

const PAGE_SIZE = 20;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

/**
 * Bố cục danh sách kiểu sàn: bộ lọc bên trái, sản phẩm bên phải.
 * Phụ thuộc searchParams nên render tại request time — luôn đặt trong <Suspense>.
 */
export async function ListingResults({
  searchParams,
  basePath,
  categorySlug,
}: {
  searchParams: SearchParams;
  basePath: string;
  categorySlug?: string;
}) {
  const [rawParams, products, categories] = await Promise.all([searchParams, getAllProducts(), getCategories()]);
  const params = parseListingParams(rawParams);
  const sort = params.sort ?? "moi-nhat";

  const filtered = sortProducts(
    applyFilters(categorySlug ? filterByCategory(products, categories, categorySlug) : products, params),
    sort,
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(params.page ?? 1, totalPages);
  const items = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Các bộ lọc đang áp dụng (chip có nút xóa)
  const chips = [
    params.q && { label: `“${params.q}”`, href: buildListingHref(basePath, { ...params, q: undefined, page: undefined }) },
    (params.min || params.max) && {
      label: priceLabel(params.min, params.max),
      href: buildListingHref(basePath, { ...params, min: undefined, max: undefined, page: undefined }),
    },
    params.sale && { label: "Đang giảm giá", href: buildListingHref(basePath, { ...params, sale: false, page: undefined }) },
  ].filter((c): c is { label: string; href: string } => !!c);
  const activeCount = chips.length;

  const sortHrefs = sortOptions.map((o) => ({ ...o, href: buildListingHref(basePath, { ...params, sort: o.value, page: undefined }) }));

  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
      {/* Bộ lọc — mobile: thu gọn */}
      <details className="group border-y border-line lg:hidden">
        <summary className="flex cursor-pointer list-none items-center justify-between py-4 text-sm transition-colors hover:text-brand-600 [&::-webkit-details-marker]:hidden">
          <span className="flex items-center gap-2 font-medium">
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.6} aria-hidden />
            Bộ lọc{activeCount > 0 && <span className="text-muted"> ({activeCount})</span>}
          </span>
          <span className="text-[13px] text-muted group-open:hidden">Mở</span>
          <span className="hidden text-[13px] text-muted group-open:inline">Đóng</span>
        </summary>
        <div className="pb-6 pt-2">
          <FilterSidebar products={products} categories={categories} basePath={basePath} activeCategory={categorySlug} params={params} idPrefix="m" />
        </div>
      </details>

      {/* Bộ lọc — desktop: cột trái */}
      <aside
        className="scrollbar-none hidden lg:sticky lg:top-28 lg:block lg:max-h-[calc(100vh-8rem)] lg:self-start lg:overflow-y-auto lg:pr-2"
        aria-label="Bộ lọc sản phẩm"
      >
        <FilterSidebar products={products} categories={categories} basePath={basePath} activeCategory={categorySlug} params={params} idPrefix="d" />
      </aside>

      <div className="min-w-0">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 border-b border-line pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <p className="mr-2 text-[13px] text-muted">
              <span className="text-ink">{filtered.length}</span> sản phẩm
            </p>
            {chips.map((chip) => (
              <Link
                key={chip.label}
                href={chip.href}
                aria-label={`Bỏ lọc ${chip.label}`}
                className="group inline-flex h-8 items-center gap-1.5 rounded-full bg-sand pl-3.5 pr-2.5 text-[13px] text-ink transition-colors hover:bg-ink hover:text-ivory"
              >
                {chip.label}
                <X className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100" aria-hidden />
              </Link>
            ))}
            {activeCount > 1 && (
              <Link href={basePath} className="ml-1 text-[13px] text-muted underline underline-offset-4 transition-colors hover:text-brand-600">
                Xóa tất cả
              </Link>
            )}
          </div>
          <SortSelect value={sort} options={sortHrefs} />
        </div>

        {items.length > 0 ? (
          <>
            <ProductGrid products={items} eagerCount={3} className="lg:grid-cols-3 xl:grid-cols-4" />
            {totalPages > 1 && (
              <nav aria-label="Phân trang" className="mt-16 flex justify-center gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={buildListingHref(basePath, { ...params, page: p })}
                    aria-current={p === page ? "page" : undefined}
                    className={cn(
                      "flex h-11 w-11 items-center justify-center rounded-full text-sm transition-colors",
                      p === page ? "bg-ink text-ivory" : "text-ink-soft hover:bg-sand hover:text-ink",
                    )}
                  >
                    {p}
                  </Link>
                ))}
              </nav>
            )}
          </>
        ) : (
          <div className="py-20 text-center">
            <p className="font-serif text-2xl">Không có sản phẩm phù hợp</p>
            <p className="mt-3 text-sm text-muted">Hãy thử bỏ bớt bộ lọc hoặc tìm với từ khóa khác.</p>
            <Link href={basePath} className={buttonVariants({ variant: "outline", className: "mt-8" })}>
              Xóa bộ lọc
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function ListingResultsSkeleton() {
  return (
    <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12" aria-busy="true" aria-label="Đang tải sản phẩm">
      <div className="hidden space-y-3 lg:block">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-4 animate-pulse bg-sand" style={{ width: `${60 + ((i * 17) % 35)}%` }} />
        ))}
      </div>
      <div>
        <div className="mb-8 h-[61px] border-b border-line" />
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:gap-x-6 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <li key={i}>
              <div className="aspect-[4/5] animate-pulse bg-sand" />
              <div className="mt-4 h-3 w-1/3 animate-pulse bg-sand" />
              <div className="mt-2 h-4 w-3/4 animate-pulse bg-sand" />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
