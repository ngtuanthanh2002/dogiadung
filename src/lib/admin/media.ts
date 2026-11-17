import "server-only";
import { db } from "@/lib/db";
import { deleteFromImageKit, imageKitConfigured, type UploadedImage } from "@/lib/imagekit";

/** Ghi nhận ảnh vừa tải lên ImageKit để sau này xóa được khi không còn dùng. */
export async function registerMedia(image: UploadedImage) {
  await db()`
    INSERT INTO media (file_id, url, file_path, size_bytes, width, height)
    VALUES (${image.fileId}, ${image.url}, ${image.filePath}, ${image.size}, ${image.width ?? null}, ${image.height ?? null})
    ON CONFLICT (file_id) DO NOTHING
  `;
}

/**
 * Xóa trên ImageKit những ảnh (trong danh sách `urls`) không còn sản phẩm / danh mục nào dùng.
 * Gọi sau khi lưu / xóa sản phẩm, danh mục — thường bọc trong after() để không làm chậm phản hồi.
 * Ảnh không do admin tải lên (ví dụ /images/... có sẵn) không nằm trong bảng media nên không bị đụng tới.
 */
export async function deleteUnusedImages(urls: string[]) {
  if (urls.length === 0 || !imageKitConfigured()) return;
  const rows = (await db()`
    SELECT m.file_id, m.url FROM media m
    WHERE m.url = ANY(${urls})
      AND NOT EXISTS (SELECT 1 FROM products p WHERE m.url = ANY(p.images))
      AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.image = m.url)
  `) as { file_id: string; url: string }[];

  for (const row of rows) {
    try {
      await deleteFromImageKit(row.file_id);
      await db()`DELETE FROM media WHERE file_id = ${row.file_id}`;
    } catch (error) {
      console.error("[media] Không xóa được ảnh:", row.url, error instanceof Error ? error.message : error);
    }
  }
}

/** Dọn ảnh đã tải lên nhưng không dùng tới (ví dụ tải xong rồi bỏ, không lưu sản phẩm) — cũ hơn 1 ngày. */
export async function deleteOrphanImages() {
  const rows = (await db()`
    SELECT m.url FROM media m
    WHERE m.created_at < now() - interval '1 day'
      AND NOT EXISTS (SELECT 1 FROM products p WHERE m.url = ANY(p.images))
      AND NOT EXISTS (SELECT 1 FROM categories c WHERE c.image = m.url)
  `) as { url: string }[];
  await deleteUnusedImages(rows.map((r) => r.url));
  return rows.length;
}
