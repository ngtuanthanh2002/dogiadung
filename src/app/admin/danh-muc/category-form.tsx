"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle } from "lucide-react";
import type { Category } from "@/data/types";
import { cn, slugify } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { inputClass, labelClass, textareaClass } from "@/components/admin/ui";
import { saveCategory, type CategoryFormState } from "./actions";

const initialState: CategoryFormState = {};

export function CategoryForm({ category, parents, hasChildren }: { category?: Category; parents: Category[]; hasChildren?: boolean }) {
  const editing = !!category;
  const [state, dispatch, pending] = useActionState(saveCategory, initialState);
  const errors = state.errors ?? {};
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);

  const err = (key: string) =>
    errors[key] ? (
      <p id={`${key}-error`} className="mt-1.5 text-[12px] text-brand-600">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => dispatch(fd));
      }}
      className="max-w-3xl space-y-6"
    >
      <input type="hidden" name="originalSlug" value={category?.slug ?? ""} />
      {state.message && (
        <p role="alert" className="rounded-r-lg border-l-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {state.message}
        </p>
      )}

      <section className="space-y-5 rounded-xl border border-line bg-white p-5 md:p-6">
        <div>
          <label htmlFor="name" className={labelClass}>
            Tên danh mục *
          </label>
          <input
            id="name"
            name="name"
            value={name}
            maxLength={100}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className={inputClass}
            aria-invalid={!!errors.name || undefined}
          />
          {err("name")}
        </div>

        <div>
          <label htmlFor="slug" className={labelClass}>
            Đường dẫn
          </label>
          <div className="flex items-center overflow-hidden rounded-lg border border-line bg-white focus-within:border-ink">
            <span className="hidden shrink-0 border-r border-line bg-sand/50 px-3 py-3 text-[13px] text-muted sm:block">/danh-muc/</span>
            <input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(e.target.value.toLowerCase());
              }}
              className="h-11 min-w-0 flex-1 bg-transparent px-3.5 text-[14px] outline-none"
              aria-invalid={!!errors.slug || undefined}
            />
          </div>
          {err("slug") ?? (editing && <p className="mt-1.5 text-[12px] text-muted">Đổi đường dẫn: sản phẩm trong danh mục tự cập nhật theo, nhưng link cũ sẽ không còn hoạt động.</p>)}
        </div>

        <div className="grid gap-5 sm:grid-cols-[1fr_140px]">
          <div>
            <label htmlFor="parent" className={labelClass}>
              Danh mục cha
            </label>
            <select
              id="parent"
              name="parent"
              defaultValue={category?.parent ?? ""}
              disabled={hasChildren}
              className={cn(inputClass, "cursor-pointer disabled:bg-sand/50 disabled:text-muted")}
            >
              <option value="">— Không có (danh mục cấp 1, hiện trên menu) —</option>
              {parents
                .filter((p) => p.slug !== category?.slug)
                .map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.name}
                  </option>
                ))}
            </select>
            {err("parent") ?? (hasChildren && <p className="mt-1.5 text-[12px] text-muted">Đang có danh mục con nên phải là danh mục cấp 1.</p>)}
          </div>
          <div>
            <label htmlFor="sortOrder" className={labelClass}>
              Thứ tự
            </label>
            <input id="sortOrder" name="sortOrder" type="number" defaultValue={category?.sortOrder ?? 0} className={inputClass} />
            <p className="mt-1.5 text-[12px] text-muted">Nhỏ đứng trước</p>
          </div>
        </div>

        <div>
          <label htmlFor="description" className={labelClass}>
            Mô tả
          </label>
          <textarea id="description" name="description" rows={3} maxLength={1000} defaultValue={category?.description} className={textareaClass} />
          <p className="mt-1.5 text-[12px] text-muted">Hiện trên trang danh mục và trong kết quả Google.</p>
        </div>

        <ImageUploader name="image" defaultValue={category?.image ? [category.image] : []} max={1} folder="categories" label="Ảnh danh mục" />
        {err("image")}
      </section>

      <div className="flex gap-3">
        <button type="submit" disabled={pending} className={buttonVariants({ size: "md" })}>
          {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
          {pending ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo danh mục"}
        </button>
        <Link href="/admin/danh-muc" className={buttonVariants({ variant: "ghost", size: "md" })}>
          Hủy
        </Link>
      </div>
    </form>
  );
}
