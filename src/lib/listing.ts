import { isSortKey, searchProducts, type SortKey } from "@/data/products";
import type { Product } from "@/data/types";
import { discountPercent, formatPrice } from "@/lib/utils";

/** Tham số lọc / sắp xếp trên URL của trang danh sách sản phẩm. */
export type ListingParams = {
  q?: string;
  sort?: SortKey;
  page?: number;
  min?: number;
  max?: number;
  sale?: boolean;
};

export const priceRanges: { label: string; min?: number; max?: number }[] = [
  { label: "Dưới 200.000₫", max: 200000 },
  { label: "200.000₫ – 500.000₫", min: 200000, max: 500000 },
  { label: "500.000₫ – 1.000.000₫", min: 500000, max: 1000000 },
  { label: "1.000.000₫ – 3.000.000₫", min: 1000000, max: 3000000 },
  { label: "Trên 3.000.000₫", min: 3000000 },
];

type RawParams = Record<string, string | string[] | undefined>;
const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
const toInt = (v: string | undefined) => {
  if (!v) return undefined;
  const n = Math.floor(Number(v.replace(/[^\d]/g, "")));
  return Number.isFinite(n) && n > 0 ? n : undefined;
};

export function parseListingParams(sp: RawParams): ListingParams {
  const sort = first(sp.sort);
  const page = toInt(first(sp.page));
  let min = toInt(first(sp.min));
  let max = toInt(first(sp.max));
  if (min && max && min > max) [min, max] = [max, min];
  return {
    q: first(sp.q)?.trim().slice(0, 100) || undefined,
    sort: isSortKey(sort) ? sort : undefined,
    page,
    min,
    max,
    sale: first(sp.sale) === "1",
  };
}

/** Tạo URL trang danh sách, bỏ các tham số mặc định để URL gọn (tốt cho SEO). */
export function buildListingHref(basePath: string, params: ListingParams) {
  const sp = new URLSearchParams();
  if (params.q) sp.set("q", params.q);
  if (params.min) sp.set("min", String(params.min));
  if (params.max) sp.set("max", String(params.max));
  if (params.sale) sp.set("sale", "1");
  if (params.sort && params.sort !== "moi-nhat") sp.set("sort", params.sort);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `${basePath}?${qs}` : basePath;
}

/** Áp dụng tìm kiếm + khoảng giá + giảm giá lên danh sách (chưa sắp xếp). */
export function applyFilters(list: Product[], params: ListingParams) {
  const searched = params.q ? searchProducts(list, params.q) : list;
  return searched.filter(
    (p) =>
      (!params.min || p.price >= params.min) &&
      (!params.max || p.price <= params.max) &&
      (!params.sale || discountPercent(p.price, p.originalPrice) > 0),
  );
}

export function priceLabel(min?: number, max?: number) {
  const preset = priceRanges.find((r) => r.min === min && r.max === max);
  if (preset) return preset.label;
  if (min && max) return `${formatPrice(min)} – ${formatPrice(max)}`;
  if (min) return `Từ ${formatPrice(min)}`;
  if (max) return `Đến ${formatPrice(max)}`;
  return "";
}
