import { treeSlugs } from "./categories";
import type { Category, Product } from "./types";

/**
 * Hàm xử lý thuần trên danh sách sản phẩm (sắp xếp, lọc, tìm kiếm) — không truy cập DB,
 * dùng được ở cả server và client. Dữ liệu lấy từ Neon nằm ở `@/lib/catalog`.
 */

export type SortKey = "moi-nhat" | "ban-chay" | "gia-tang" | "gia-giam";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "moi-nhat", label: "Mới nhất" },
  { value: "ban-chay", label: "Bán chạy" },
  { value: "gia-tang", label: "Giá tăng dần" },
  { value: "gia-giam", label: "Giá giảm dần" },
];

export function isSortKey(value: unknown): value is SortKey {
  return sortOptions.some((o) => o.value === value);
}

export function sortProducts(list: Product[], sort: SortKey = "moi-nhat") {
  const copy = [...list];
  switch (sort) {
    case "ban-chay":
      return copy.sort((a, b) => b.sold - a.sold);
    case "gia-tang":
      return copy.sort((a, b) => a.price - b.price);
    case "gia-giam":
      return copy.sort((a, b) => b.price - a.price);
    default:
      return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

/** Sản phẩm thuộc danh mục (kể cả danh mục con). */
export function filterByCategory(list: Product[], categories: Category[], slug: string) {
  const tree = treeSlugs(categories, slug);
  return list.filter((p) => tree.includes(p.categorySlug));
}

export function relatedProducts(list: Product[], product: Product, limit = 4) {
  const same = list.filter((p) => p.categorySlug === product.categorySlug && p.slug !== product.slug);
  const others = sortProducts(
    list.filter((p) => p.categorySlug !== product.categorySlug),
    "ban-chay",
  );
  return [...same, ...others].slice(0, limit);
}

/** Bỏ dấu tiếng Việt để tìm kiếm không phân biệt dấu. */
export function normalizeVietnamese(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d");
}

export function searchProducts(list: Product[], query: string) {
  const q = normalizeVietnamese(query.trim());
  if (!q) return list;
  return list.filter((p) => normalizeVietnamese(p.name).includes(q));
}
