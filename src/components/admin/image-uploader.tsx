"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, ImagePlus, LoaderCircle, X } from "lucide-react";
import { uploadImage } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const MAX_SIDE = 1600;

/**
 * Thu nhỏ ảnh trong trình duyệt trước khi tải lên (cạnh dài tối đa 1600px, WebP/JPEG ~85%)
 * → ảnh nhẹ, tiết kiệm dung lượng ImageKit gói Free và tránh giới hạn kích thước request.
 */
async function shrink(file: File): Promise<File> {
  if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.85));
    const out = blob?.type === "image/webp" ? blob : await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
    if (!out || out.size >= file.size) return file;
    return new File([out], out.type === "image/webp" ? "anh.webp" : "anh.jpg", { type: out.type });
  } catch {
    return file;
  }
}

/**
 * Quản lý danh sách ảnh: tải lên ImageKit, đổi thứ tự, xóa. Giá trị gửi theo form qua input ẩn `name` (JSON mảng URL).
 * `max = 1` cho ảnh đơn (ví dụ ảnh danh mục).
 */
export function ImageUploader({
  name,
  defaultValue,
  max = 10,
  folder = "products",
  label = "Ảnh sản phẩm",
}: {
  name: string;
  defaultValue: string[];
  max?: number;
  folder?: "products" | "categories";
  label?: string;
}) {
  const [images, setImages] = useState(defaultValue);
  const [uploading, setUploading] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setError(null);
    const list = Array.from(files).slice(0, Math.max(0, max - images.length));
    if (list.length === 0) {
      setError(`Tối đa ${max} ảnh.`);
      return;
    }
    setUploading((n) => n + list.length);
    for (const original of list) {
      try {
        const file = await shrink(original);
        const fd = new FormData();
        fd.append("file", file);
        fd.append("folder", folder);
        const result = await uploadImage(fd);
        if (result.ok) setImages((prev) => (max === 1 ? [result.url] : [...prev, result.url].slice(0, max)));
        else setError(result.error);
      } catch {
        setError("Tải ảnh thất bại, vui lòng thử lại.");
      } finally {
        setUploading((n) => n - 1);
      }
    }
    if (inputRef.current) inputRef.current.value = "";
  }

  const move = (from: number, to: number) =>
    setImages((prev) => {
      if (to < 0 || to >= prev.length) return prev;
      const next = [...prev];
      [next[from], next[to]] = [next[to], next[from]];
      return next;
    });

  return (
    <div>
      <input type="hidden" name={name} value={JSON.stringify(images)} />
      <div className="mb-2 flex items-baseline justify-between">
        <span className="text-[13px] font-medium text-ink-soft">{label}</span>
        {max > 1 && <span className="text-[12px] text-muted">Ảnh đầu tiên là ảnh đại diện · {images.length}/{max}</span>}
      </div>

      <ul className={cn("grid gap-3", max === 1 ? "grid-cols-1 sm:max-w-60" : "grid-cols-3 sm:grid-cols-4 lg:grid-cols-5")}>
        {images.map((src, i) => (
          <li key={src} className="group relative aspect-square overflow-hidden rounded-lg border border-line bg-sand">
            <Image src={src} alt={`Ảnh ${i + 1}`} fill sizes="160px" className="object-cover" />
            {i === 0 && max > 1 && (
              <span className="absolute left-1.5 top-1.5 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-medium text-ivory">Đại diện</span>
            )}
            <div className="absolute inset-x-1.5 bottom-1.5 flex justify-between opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              {max > 1 ? (
                <span className="flex gap-1">
                  <button type="button" onClick={() => move(i, i - 1)} disabled={i === 0} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm disabled:opacity-40" aria-label="Đưa lên trước">
                    <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                  </button>
                  <button type="button" onClick={() => move(i, i + 1)} disabled={i === images.length - 1} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-ink shadow-sm disabled:opacity-40" aria-label="Đưa ra sau">
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                  </button>
                </span>
              ) : (
                <span />
              )}
              <button type="button" onClick={() => setImages((prev) => prev.filter((x) => x !== src))} className="flex h-7 w-7 items-center justify-center rounded-full bg-white/90 text-brand-700 shadow-sm" aria-label="Bỏ ảnh này">
                <X className="h-3.5 w-3.5" aria-hidden />
              </button>
            </div>
          </li>
        ))}

        {Array.from({ length: uploading }).map((_, i) => (
          <li key={`up-${i}`} className="flex aspect-square items-center justify-center rounded-lg border border-line bg-sand/60">
            <LoaderCircle className="h-5 w-5 animate-spin text-muted" aria-label="Đang tải ảnh" />
          </li>
        ))}

        {images.length + uploading < max && (
          <li>
            <label className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-ink/25 bg-white text-center text-[12px] text-muted transition-colors hover:border-ink hover:text-ink">
              <ImagePlus className="h-5 w-5" strokeWidth={1.6} aria-hidden />
              {max === 1 && images.length === 0 ? "Chọn ảnh" : "Thêm ảnh"}
              <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                multiple={max > 1}
                className="sr-only"
                onChange={(e) => onFiles(e.target.files)}
              />
            </label>
          </li>
        )}
      </ul>
      {error && (
        <p role="alert" className="mt-2 text-[13px] text-brand-600">
          {error}
        </p>
      )}
    </div>
  );
}
