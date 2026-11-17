import type { Category } from "./types";

/**
 * Hàm thuần trên danh sách danh mục (lấy từ DB qua `getCategories()` trong `@/lib/catalog`).
 * Không truy cập DB — dùng được ở cả server lẫn client.
 */

export function topLevel(list: Category[]) {
  return list.filter((c) => !c.parent);
}

export function findCategory(list: Category[], slug: string) {
  return list.find((c) => c.slug === slug);
}

export function childrenOf(list: Category[], slug: string) {
  return list.filter((c) => c.parent === slug);
}

/** Danh mục cấp 1 chứa danh mục này (hoặc chính nó nếu đã là cấp 1). */
export function rootOf(list: Category[], slug: string) {
  const category = findCategory(list, slug);
  return category?.parent ? findCategory(list, category.parent) : category;
}

/** Tất cả slug thuộc danh mục (bao gồm chính nó và danh mục con). */
export function treeSlugs(list: Category[], slug: string) {
  return [slug, ...childrenOf(list, slug).map((c) => c.slug)];
}

/** Danh mục cấp 1 kèm danh mục con — dùng cho menu. */
export function categoryTree(list: Category[]) {
  return topLevel(list).map((c) => ({ ...c, children: childrenOf(list, c.slug) }));
}
