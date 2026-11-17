"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteUnusedImages } from "@/lib/admin/media";
import { CATEGORIES_TAG, PRODUCTS_TAG } from "@/lib/catalog";
import { db } from "@/lib/db";
import { slugify } from "@/lib/utils";

export type CategoryFormState = { message?: string; errors?: Partial<Record<string, string>> };

const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const str = (fd: FormData, key: string, max = 200) => String(fd.get(key) ?? "").trim().slice(0, max);
const validImage = (s: string) => s === "" || /^https:\/\/[^\s"'<>]+$/.test(s) || /^\/images\/[\w\-./]+$/.test(s);

/**
 * Tạo / sửa danh mục. Danh mục có 2 cấp: danh mục cha (cấp 1) và danh mục con.
 * Đổi đường dẫn (slug) sẽ tự cập nhật theo ở sản phẩm và danh mục con (ON UPDATE CASCADE).
 */
export async function saveCategory(_prev: CategoryFormState, formData: FormData): Promise<CategoryFormState> {
  await requireAdmin();
  const errors: Record<string, string> = {};

  const originalSlug = str(formData, "originalSlug", 100);
  const name = str(formData, "name", 100);
  const slug = str(formData, "slug", 100) || slugify(name);
  const parent = str(formData, "parent", 100) || null;
  const description = str(formData, "description", 1000);
  let images: string[] = [];
  try {
    images = JSON.parse(String(formData.get("image") ?? "[]"));
  } catch {}
  const image = typeof images[0] === "string" ? images[0] : "";
  const sortOrder = Math.max(-9999, Math.min(9999, Math.floor(Number(formData.get("sortOrder")) || 0)));

  if (!name) errors.name = "Vui lòng nhập tên danh mục";
  if (!SLUG_RE.test(slug)) errors.slug = "Đường dẫn chỉ gồm chữ thường không dấu, số và dấu -";
  else if (slug === "moi") errors.slug = "Đường dẫn “moi” được dành riêng, hãy chọn tên khác";
  if (!validImage(image)) errors.image = "Ảnh không hợp lệ";

  const sql = db();
  if (parent) {
    const [p] = await sql`SELECT parent_slug FROM categories WHERE slug = ${parent}`;
    if (!p) errors.parent = "Danh mục cha không tồn tại";
    else if (p.parent_slug) errors.parent = "Chỉ chọn được danh mục cấp 1 làm danh mục cha";
    else if (parent === originalSlug) errors.parent = "Không thể chọn chính nó làm danh mục cha";
  }
  if (originalSlug && parent) {
    const [{ n }] = await sql`SELECT count(*)::int AS n FROM categories WHERE parent_slug = ${originalSlug}`;
    if (n > 0) errors.parent = "Danh mục này đang có danh mục con nên phải là danh mục cấp 1";
  }
  if (Object.keys(errors).length > 0) return { message: "Vui lòng kiểm tra lại các trường được đánh dấu.", errors };

  let oldImage = "";
  try {
    if (!originalSlug) {
      await sql`
        INSERT INTO categories (slug, name, description, image, parent_slug, sort_order)
        VALUES (${slug}, ${name}, ${description}, ${image}, ${parent}, ${sortOrder})
      `;
    } else {
      const [before] = await sql`SELECT image FROM categories WHERE slug = ${originalSlug}`;
      if (!before) return { message: "Danh mục không còn tồn tại." };
      oldImage = before.image;
      await sql`
        UPDATE categories SET slug = ${slug}, name = ${name}, description = ${description}, image = ${image},
               parent_slug = ${parent}, sort_order = ${sortOrder}, updated_at = now()
        WHERE slug = ${originalSlug}
      `;
    }
  } catch (error) {
    const err = error as { code?: string; message?: string };
    if (err.code === "23505") return { errors: { slug: "Đường dẫn đã được danh mục khác dùng" }, message: "Đường dẫn bị trùng." };
    console.error("[admin] Lưu danh mục lỗi:", err.message ?? error);
    return { message: "Không lưu được danh mục. Vui lòng thử lại." };
  }

  if (oldImage && oldImage !== image) after(() => deleteUnusedImages([oldImage]));
  updateTag(CATEGORIES_TAG);
  updateTag(PRODUCTS_TAG);
  redirect(`/admin/danh-muc?saved=${encodeURIComponent(slug)}`);
}

/** Chỉ xóa được danh mục trống (không còn sản phẩm và danh mục con). */
export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const slug = String(formData.get("slug") ?? "");
  const sql = db();
  const [{ products, children }] = await sql`
    SELECT (SELECT count(*)::int FROM products WHERE category_slug = ${slug}) AS products,
           (SELECT count(*)::int FROM categories WHERE parent_slug = ${slug}) AS children
  `;
  if (products > 0 || children > 0) {
    redirect(`/admin/danh-muc?error=${encodeURIComponent("Danh mục còn sản phẩm hoặc danh mục con — hãy chuyển / xóa chúng trước.")}`);
  }
  const rows = (await sql`DELETE FROM categories WHERE slug = ${slug} RETURNING image`) as { image: string }[];
  if (rows[0]?.image) after(() => deleteUnusedImages([rows[0].image]));
  updateTag(CATEGORIES_TAG);
  redirect("/admin/danh-muc?deleted=1");
}
