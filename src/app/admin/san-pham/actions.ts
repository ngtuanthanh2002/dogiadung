"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import type { ProductColor } from "@/data/types";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteUnusedImages } from "@/lib/admin/media";
import { PRODUCTS_TAG } from "@/lib/catalog";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export type ProductFormState = { message?: string; errors?: Partial<Record<string, string>> };

const ID_RE = /^[A-Za-z0-9_-]{1,40}$/;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const str = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
/** "1.290.000" → 1290000; rỗng → null */
const int = (fd: FormData, key: string) => {
  const digits = String(fd.get(key) ?? "").replace(/[^\d]/g, "");
  return digits ? Math.min(Number(digits), 2_000_000_000) : null;
};
function json<T>(fd: FormData, key: string, fallback: T): T {
  try {
    return JSON.parse(String(fd.get(key) ?? "")) as T;
  } catch {
    return fallback;
  }
}

/** Ảnh hợp lệ: URL https (ImageKit…) hoặc ảnh có sẵn trong /images của website. */
const validImage = (s: unknown): s is string =>
  typeof s === "string" && s.length < 500 && (/^https:\/\/[^\s"'<>]+$/.test(s) || /^\/images\/[\w\-./]+$/.test(s));

export async function saveProduct(_prev: ProductFormState, formData: FormData): Promise<ProductFormState> {
  await requireAdmin();
  const errors: Record<string, string> = {};

  const mode = formData.get("mode") === "edit" ? "edit" : "create";
  const id = str(formData, "id", 40).toUpperCase();
  const name = str(formData, "name", 200);
  const slug = str(formData, "slug", 100) || slugify(name);
  const categorySlug = str(formData, "categorySlug", 100);
  const price = int(formData, "price");
  const originalPrice = int(formData, "originalPrice");
  const unit = str(formData, "unit", 20) || null;
  const stock = int(formData, "stock") ?? 0;
  const sold = int(formData, "sold") ?? 0;
  const shortDescription = str(formData, "shortDescription", 2000);
  const highlights = String(formData.get("highlights") ?? "")
    .split("\n")
    .map((s) => s.trim().slice(0, 200))
    .filter(Boolean)
    .slice(0, 12);
  const sizes = [...new Set(str(formData, "sizes", 300).split(",").map((s) => s.trim().slice(0, 20)).filter(Boolean))].slice(0, 20);
  const images = json<unknown[]>(formData, "images", []).filter(validImage).slice(0, 10);
  const specs = json<{ label?: unknown; value?: unknown }[]>(formData, "specs", [])
    .map((s) => ({ label: String(s?.label ?? "").trim().slice(0, 60), value: String(s?.value ?? "").trim().slice(0, 200) }))
    .filter((s) => s.label && s.value)
    .slice(0, 20);
  const colors: ProductColor[] = json<{ name?: unknown; hex?: unknown }[]>(formData, "colors", [])
    .map((c) => ({ name: String(c?.name ?? "").trim().slice(0, 40), hex: String(c?.hex ?? "").trim() }))
    .filter((c) => c.name)
    .slice(0, 20);
  const featured = formData.get("featured") === "on";
  const published = formData.get("published") === "on";

  if (!ID_RE.test(id)) errors.id = "Mã chỉ gồm chữ, số, dấu - hoặc _ (tối đa 40 ký tự)";
  if (!name) errors.name = "Vui lòng nhập tên sản phẩm";
  if (!SLUG_RE.test(slug)) errors.slug = "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu -";
  if (!categorySlug) errors.categorySlug = "Vui lòng chọn danh mục";
  if (price === null) errors.price = "Vui lòng nhập giá bán";
  if (originalPrice !== null && price !== null && originalPrice <= price) errors.originalPrice = "Giá gốc phải lớn hơn giá bán (để trống nếu không giảm giá)";
  if (colors.some((c) => !HEX_RE.test(c.hex))) errors.colors = "Mã màu phải có dạng #RRGGBB";
  if (published && images.length === 0) errors.images = "Cần ít nhất 1 ảnh để hiển thị sản phẩm trên cửa hàng";

  if (Object.keys(errors).length > 0) return { message: "Vui lòng kiểm tra lại các trường được đánh dấu.", errors };

  const values = {
    slug,
    name,
    categorySlug,
    price: price!,
    originalPrice,
    unit,
    stock,
    sold,
    images,
    shortDescription,
    highlights,
    specs: JSON.stringify(specs),
    colors: JSON.stringify(colors),
    sizes,
    featured,
    published,
  };

  const sql = db();
  let removedImages: string[] = [];
  try {
    if (mode === "create") {
      await sql`
        INSERT INTO products (id, slug, name, category_slug, price, original_price, unit, stock, sold, images,
                              short_description, highlights, specs, colors, sizes, featured, published)
        VALUES (${id}, ${values.slug}, ${values.name}, ${values.categorySlug}, ${values.price}, ${values.originalPrice},
                ${values.unit}, ${values.stock}, ${values.sold}, ${values.images}, ${values.shortDescription},
                ${values.highlights}, ${values.specs}::jsonb, ${values.colors}::jsonb, ${values.sizes},
                ${values.featured}, ${values.published})
      `;
    } else {
      const [before] = (await sql`SELECT images FROM products WHERE id = ${id}`) as { images: string[] }[];
      if (!before) return { message: "Sản phẩm không còn tồn tại." };
      const rows = await sql`
        UPDATE products SET
          slug = ${values.slug}, name = ${values.name}, category_slug = ${values.categorySlug}, price = ${values.price},
          original_price = ${values.originalPrice}, unit = ${values.unit}, stock = ${values.stock}, sold = ${values.sold},
          images = ${values.images}, short_description = ${values.shortDescription}, highlights = ${values.highlights},
          specs = ${values.specs}::jsonb, colors = ${values.colors}::jsonb, sizes = ${values.sizes},
          featured = ${values.featured}, published = ${values.published}, updated_at = now()
        WHERE id = ${id}
        RETURNING id
      `;
      if (rows.length === 0) return { message: "Sản phẩm không còn tồn tại." };
      removedImages = before.images.filter((url) => !images.includes(url));
    }
  } catch (error) {
    const err = error as { code?: string; constraint?: string; message?: string };
    if (err.code === "23505" && err.constraint === "products_pkey") return { errors: { id: "Mã sản phẩm đã tồn tại" }, message: "Mã sản phẩm bị trùng." };
    if (err.code === "23505") return { errors: { slug: "Đường dẫn đã được sản phẩm khác dùng" }, message: "Đường dẫn bị trùng." };
    if (err.code === "23503") return { errors: { categorySlug: "Danh mục không tồn tại" }, message: "Danh mục không hợp lệ." };
    console.error("[admin] Lưu sản phẩm lỗi:", err.message ?? error);
    return { message: "Không lưu được sản phẩm. Vui lòng thử lại." };
  }

  if (removedImages.length > 0) after(() => deleteUnusedImages(removedImages));
  updateTag(PRODUCTS_TAG);
  redirect(`/admin/san-pham/${encodeURIComponent(id)}?saved=1`);
}

export async function deleteProduct(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const rows = (await db()`DELETE FROM products WHERE id = ${id} RETURNING images`) as { images: string[] }[];
  const images = rows[0]?.images ?? [];
  if (images.length > 0) after(() => deleteUnusedImages(images));
  updateTag(PRODUCTS_TAG);
  redirect("/admin/san-pham?deleted=1");
}

/** Ẩn / hiện sản phẩm trên cửa hàng (không xóa dữ liệu). */
export async function toggleProductPublished(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  await db()`UPDATE products SET published = NOT published, updated_at = now() WHERE id = ${id}`;
  updateTag(PRODUCTS_TAG);
  revalidatePath("/admin/san-pham");
}
