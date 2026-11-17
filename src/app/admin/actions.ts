"use server";

import { signOut } from "@/auth";
import { requireAdmin } from "@/lib/admin/auth";
import { deleteOrphanImages, registerMedia } from "@/lib/admin/media";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, imageKitConfigured, uploadToImageKit } from "@/lib/imagekit";

export type UploadResult = { ok: true; url: string } | { ok: false; error: string };

/** Tải 1 ảnh lên ImageKit. Trình duyệt đã thu nhỏ ảnh trước khi gửi (xem image-uploader.tsx). */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireAdmin();
  if (!imageKitConfigured()) {
    return { ok: false, error: "Chưa cấu hình ImageKit (IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT)." };
  }

  const file = formData.get("file");
  const folder = formData.get("folder") === "categories" ? "categories" : "products";
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "Chưa chọn ảnh." };
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return { ok: false, error: "Chỉ nhận ảnh JPG, PNG, WebP hoặc AVIF." };
  }
  if (file.size > MAX_IMAGE_BYTES) return { ok: false, error: "Ảnh lớn hơn 4 MB." };

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  try {
    const uploaded = await uploadToImageKit(file, `anh.${ext}`, folder);
    await registerMedia(uploaded);
    return { ok: true, url: uploaded.url };
  } catch (error) {
    console.error("[upload]", error instanceof Error ? error.message : error);
    return { ok: false, error: "Tải ảnh thất bại. Kiểm tra cấu hình ImageKit rồi thử lại." };
  }
}

/** Xóa trên ImageKit các ảnh đã tải lên nhưng không sản phẩm / danh mục nào dùng (cũ hơn 1 ngày). */
export async function cleanupImages(): Promise<void> {
  await requireAdmin();
  await deleteOrphanImages();
}

export async function logout() {
  await signOut({ redirectTo: "/dang-nhap" });
}
