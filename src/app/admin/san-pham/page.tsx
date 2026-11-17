import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Eye, EyeOff, Pencil, Plus, Search, Star } from "lucide-react";
import { normalizeVietnamese } from "@/data/products";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminCategories, listAdminProducts, LOW_STOCK, PAGE_SIZE } from "@/lib/admin/queries";
import { cn, formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, inputClass, Notice, PageHeader, Pagination, pageParam, param, Pill } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/form-controls";
import { toggleProductPublished } from "./actions";

export const metadata: Metadata = { title: "Sản phẩm" };

const views = [
  { value: "", label: "Tất cả" },
  { value: "dang-ban", label: "Đang bán" },
  { value: "an", label: "Đang ẩn" },
  { value: "het-hang", label: "Hết / sắp hết" },
] as const;

export default async function AdminProductsPage({ searchParams }: PageProps<"/admin/san-pham">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp.q)?.trim().slice(0, 100) ?? "";
  const cat = param(sp.cat) ?? "";
  const view = param(sp.view) ?? "";
  const page = pageParam(sp.page);

  const [products, categories] = await Promise.all([listAdminProducts(), listAdminCategories()]);
  const catTree = cat ? [cat, ...categories.filter((c) => c.parent === cat).map((c) => c.slug)] : [];
  const nq = normalizeVietnamese(q);

  const filtered = products.filter(
    (p) =>
      (!nq || normalizeVietnamese(p.name).includes(nq) || p.id.toLowerCase().includes(nq)) &&
      (!cat || catTree.includes(p.categorySlug)) &&
      (view !== "dang-ban" || p.published) &&
      (view !== "an" || !p.published) &&
      (view !== "het-hang" || p.stock <= LOW_STOCK),
  );
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const items = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const href = (over: Partial<{ q: string; cat: string; view: string; page: number }>) => {
    const s = new URLSearchParams();
    const v = { q, cat, view, page: 1, ...over };
    if (v.q) s.set("q", v.q);
    if (v.cat) s.set("cat", v.cat);
    if (v.view) s.set("view", v.view);
    if (v.page > 1) s.set("page", String(v.page));
    return s.size ? `/admin/san-pham?${s}` : "/admin/san-pham";
  };

  return (
    <>
      <PageHeader
        title="Sản phẩm"
        description={`${products.length} sản phẩm · ${products.filter((p) => p.published).length} đang bán`}
        actions={
          <Link href="/admin/san-pham/moi" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" aria-hidden /> Thêm sản phẩm
          </Link>
        }
      />
      {param(sp.deleted) && <Notice>Đã xóa sản phẩm.</Notice>}

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <nav aria-label="Lọc sản phẩm" className="flex flex-wrap gap-1">
          {views.map((v) => (
            <Link
              key={v.value}
              href={href({ view: v.value })}
              aria-current={view === v.value ? "page" : undefined}
              className={cn(
                "flex h-9 items-center rounded-full px-3.5 text-[13px] transition-colors",
                view === v.value ? "bg-ink text-ivory" : "bg-white text-ink-soft ring-1 ring-line hover:text-ink",
              )}
            >
              {v.label}
            </Link>
          ))}
        </nav>
        <form action="/admin/san-pham" method="get" className="ml-auto flex w-full flex-wrap gap-2 sm:w-auto" role="search">
          {view && <input type="hidden" name="view" value={view} />}
          <label htmlFor="cat" className="sr-only">
            Danh mục
          </label>
          <select id="cat" name="cat" defaultValue={cat} className={cn(inputClass, "h-9 w-full cursor-pointer sm:w-48")}>
            <option value="">Mọi danh mục</option>
            {categories.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.parent ? `— ${c.name}` : c.name}
              </option>
            ))}
          </select>
          <div className="relative flex-1 sm:w-64 sm:flex-none">
            <label htmlFor="product-q" className="sr-only">
              Tìm sản phẩm
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
            <input id="product-q" name="q" defaultValue={q} placeholder="Tên hoặc mã sản phẩm" className={cn(inputClass, "h-9 pl-9")} />
          </div>
          <button type="submit" className={buttonVariants({ variant: "outline", size: "sm", className: "h-9" })}>
            Lọc
          </button>
        </form>
      </div>

      {items.length === 0 ? (
        <EmptyState
          title={products.length === 0 ? "Chưa có sản phẩm" : "Không có sản phẩm phù hợp"}
          description={products.length === 0 ? "Bắt đầu bằng việc thêm sản phẩm đầu tiên." : "Thử bỏ bớt bộ lọc."}
          action={
            products.length === 0 && (
              <Link href="/admin/san-pham/moi" className={buttonVariants({ size: "sm" })}>
                <Plus className="h-4 w-4" aria-hidden /> Thêm sản phẩm
              </Link>
            )
          }
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[14px]">
              <thead className="border-b border-line bg-sand/40 text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Sản phẩm</th>
                  <th className="px-5 py-3 font-medium">Danh mục</th>
                  <th className="px-5 py-3 text-right font-medium">Giá</th>
                  <th className="px-5 py-3 text-right font-medium">Kho</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 text-right font-medium">
                    <span className="sr-only">Thao tác</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {items.map((p) => (
                  <tr key={p.id} className={cn("transition-colors hover:bg-sand/30", !p.published && "bg-sand/20")}>
                    <td className="px-5 py-3">
                      <Link href={`/admin/san-pham/${encodeURIComponent(p.id)}`} className="group flex items-center gap-3">
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md bg-sand">
                          <Image src={p.images[0] || PLACEHOLDER_IMAGE} alt="" fill sizes="48px" className="object-cover" />
                        </span>
                        <span className="min-w-0">
                          <span className="flex items-center gap-1.5 font-medium text-ink group-hover:text-brand-600">
                            <span className="line-clamp-1">{p.name}</span>
                            {p.featured && <Star className="h-3.5 w-3.5 shrink-0 fill-amber-400 text-amber-400" aria-label="Nổi bật" />}
                          </span>
                          <span className="block text-[12px] text-muted">{p.id}</span>
                        </span>
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-ink-soft">{p.categoryName ?? p.categorySlug}</td>
                    <td className="px-5 py-3 text-right tabular-nums">
                      {formatPrice(p.price)}
                      {p.unit && <span className="text-[12px] text-muted"> /{p.unit}</span>}
                      {p.originalPrice && <p className="text-[12px] text-muted line-through">{formatPrice(p.originalPrice)}</p>}
                    </td>
                    <td className={cn("px-5 py-3 text-right tabular-nums", p.stock === 0 ? "text-brand-600" : p.stock <= LOW_STOCK && "text-amber-700")}>
                      {p.stock}
                      <p className="text-[12px] text-muted">đã bán {p.sold}</p>
                    </td>
                    <td className="px-5 py-3">{p.published ? <Pill tone="success">Đang bán</Pill> : <Pill>Đang ẩn</Pill>}</td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <form action={toggleProductPublished}>
                          <input type="hidden" name="id" value={p.id} />
                          <SubmitButton variant="ghost" pendingText="…" className="h-9 px-3">
                            {p.published ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
                            <span className="sr-only sm:not-sr-only">{p.published ? "Ẩn" : "Hiện"}</span>
                          </SubmitButton>
                        </form>
                        <Link href={`/admin/san-pham/${encodeURIComponent(p.id)}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "h-9 px-3" })}>
                          <Pencil className="h-4 w-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Sửa</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="mt-4 text-[13px] text-muted">{filtered.length} sản phẩm</p>
      <Pagination page={current} pages={pages} href={(p) => href({ page: p })} />
    </>
  );
}
