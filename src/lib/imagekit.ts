import "server-only";

/**
 * ImageKit — lưu & phân phối ảnh sản phẩm / danh mục.
 * Biến môi trường: IMAGEKIT_PRIVATE_KEY, IMAGEKIT_URL_ENDPOINT (xem docs/setup.md).
 * Private key CHỈ dùng ở server — không bao giờ gửi xuống trình duyệt.
 */

const UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";
const FILES_URL = "https://api.imagekit.io/v1/files";

export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

function env(name: "IMAGEKIT_PRIVATE_KEY" | "IMAGEKIT_URL_ENDPOINT") {
  const value = process.env[name];
  if (!value) throw new Error(`Thiếu biến môi trường ${name} — xem docs/setup.md`);
  return value;
}

function authHeader() {
  return `Basic ${Buffer.from(`${env("IMAGEKIT_PRIVATE_KEY")}:`).toString("base64")}`;
}

export function imageKitConfigured() {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY && process.env.IMAGEKIT_URL_ENDPOINT);
}

export type UploadedImage = {
  fileId: string;
  url: string;
  filePath: string;
  size: number;
  width?: number;
  height?: number;
};

/** Tải một ảnh lên ImageKit (thư mục /webbanhang/<folder>), tên file được làm duy nhất tự động. */
export async function uploadToImageKit(file: Blob, fileName: string, folder: "products" | "categories") {
  const form = new FormData();
  form.append("file", file, fileName);
  form.append("fileName", fileName);
  form.append("folder", `/webbanhang/${folder}`);
  form.append("useUniqueFileName", "true");

  const res = await fetch(UPLOAD_URL, { method: "POST", headers: { Authorization: authHeader() }, body: form });
  const data = (await res.json().catch(() => ({}))) as Partial<UploadedImage> & { message?: string };
  if (!res.ok || !data.fileId || !data.url) {
    throw new Error(`ImageKit từ chối tải ảnh (HTTP ${res.status}): ${data.message ?? "không rõ lý do"}`);
  }
  return {
    fileId: data.fileId,
    url: data.url,
    filePath: data.filePath ?? "",
    size: data.size ?? file.size,
    width: data.width,
    height: data.height,
  } satisfies UploadedImage;
}

/** Xóa file trên ImageKit. File không còn tồn tại (404) coi như đã xóa. */
export async function deleteFromImageKit(fileId: string) {
  const res = await fetch(`${FILES_URL}/${encodeURIComponent(fileId)}`, {
    method: "DELETE",
    headers: { Authorization: authHeader() },
  });
  if (!res.ok && res.status !== 404) {
    throw new Error(`ImageKit không xóa được file ${fileId} (HTTP ${res.status})`);
  }
}
