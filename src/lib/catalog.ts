import "server-only";
import { cacheLife, cacheTag } from "next/cache";
import { filterByCategory, relatedProducts } from "@/data/products";
import type { Category, Product, ProductColor } from "@/data/types";
import { db } from "@/lib/db";

/**
 * Dữ liệu cho CỬA HÀNG (đã cache). Trang admin đọc thẳng DB qua `@/lib/admin/queries`.
 *
 * Cửa hàng nhỏ (vài trăm sản phẩm) nên tải toàn bộ một lần rồi lọc trong bộ nhớ:
 * hầu hết lượt xem không chạm DB → Neon được "ngủ", tiết kiệm giờ compute gói Free.
 * Sau khi admin sửa dữ liệu, Server Action gọi `updateTag(...)` để cửa hàng cập nhật ngay.
 */
export const PRODUCTS_TAG = "products";
export const CATEGORIES_TAG = "categories";

export type ProductRow = {
  id: string;
  slug: string;
  name: string;
  category_slug: string;
  category_name?: string | null;
  price: number;
  original_price: number | null;
  unit: string | null;
  sold: number;
  stock: number;
  images: string[];
  short_description: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  colors: ProductColor[];
  sizes: string[];
  featured: boolean;
  published: boolean;
  created_at: Date | string;
  updated_at: Date | string;
};

const iso = (v: Date | string) => (v instanceof Date ? v.toISOString() : String(v));

export function toProduct(row: ProductRow): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    categorySlug: row.category_slug,
    categoryName: row.category_name ?? undefined,
    price: row.price,
    originalPrice: row.original_price ?? undefined,
    unit: row.unit ?? undefined,
    sold: row.sold,
    stock: row.stock,
    images: row.images,
    shortDescription: row.short_description,
    highlights: row.highlights,
    specs: row.specs,
    colors: row.colors.length > 0 ? row.colors : undefined,
    sizes: row.sizes.length > 0 ? row.sizes : undefined,
    featured: row.featured,
    published: row.published,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

export type CategoryRow = {
  slug: string;
  name: string;
  description: string;
  image: string;
  parent_slug: string | null;
  sort_order: number;
};

export function toCategory(row: CategoryRow): Category {
  return {
    slug: row.slug,
    name: row.name,
    description: row.description,
    image: row.image,
    parent: row.parent_slug ?? undefined,
    sortOrder: row.sort_order,
  };
}

/** Tất cả danh mục, sắp theo thứ tự hiển thị. */
export async function getCategories(): Promise<Category[]> {
  "use cache";
  cacheTag(CATEGORIES_TAG);
  cacheLife("hours");

  const rows = (await db()`
    SELECT slug, name, description, image, parent_slug, sort_order
    FROM categories
    ORDER BY sort_order, name
  `) as CategoryRow[];
  return rows.map(toCategory);
}

/** Toàn bộ sản phẩm ĐANG BÁN (published), kèm tên danh mục. */
export async function getAllProducts(): Promise<Product[]> {
  "use cache";
  cacheTag(PRODUCTS_TAG, CATEGORIES_TAG);
  cacheLife("hours");

  const rows = (await db()`
    SELECT p.id, p.slug, p.name, p.category_slug, c.name AS category_name, p.price, p.original_price, p.unit,
           p.sold, p.stock, p.images, p.short_description, p.highlights, p.specs, p.colors, p.sizes,
           p.featured, p.published, p.created_at, p.updated_at
    FROM products p
    LEFT JOIN categories c ON c.slug = p.category_slug
    WHERE p.published
    ORDER BY p.created_at DESC
  `) as ProductRow[];
  return rows.map(toProduct);
}

export async function getProduct(slug: string) {
  return (await getAllProducts()).find((p) => p.slug === slug);
}

export async function getProductsByIds(ids: string[]) {
  const wanted = new Set(ids);
  return (await getAllProducts()).filter((p) => wanted.has(p.id));
}

export async function getProductsInCategory(slug: string) {
  const [products, categories] = await Promise.all([getAllProducts(), getCategories()]);
  return filterByCategory(products, categories, slug);
}

export async function getRelatedProducts(product: Product, limit = 4) {
  return relatedProducts(await getAllProducts(), product, limit);
}
