"use client";

import { startTransition, useActionState, useState } from "react";
import Link from "next/link";
import { LoaderCircle, Plus, X } from "lucide-react";
import type { Category, Product } from "@/data/types";
import { cn, slugify } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ImageUploader } from "@/components/admin/image-uploader";
import { inputClass, labelClass, textareaClass } from "@/components/admin/ui";
import { saveProduct, type ProductFormState } from "./actions";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-line bg-white p-5 md:p-6">
      <h2 className="text-[15px] font-medium text-ink">{title}</h2>
      {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      <div className="mt-5 space-y-5">{children}</div>
    </section>
  );
}

function Field({ name, label, hint, error, children }: { name: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${name}-error`} className="mt-1.5 text-[12px] text-brand-600">
          {error}
        </p>
      ) : (
        hint && <p className="mt-1.5 text-[12px] text-muted">{hint}</p>
      )}
    </div>
  );
}

const vnd = (n?: number) => (n === undefined ? "" : n.toLocaleString("vi-VN"));

/** Gõ "1290000" → hiển thị "1.290.000" */
function MoneyInput({ name, defaultValue, invalid, placeholder }: { name: string; defaultValue?: number; invalid?: boolean; placeholder?: string }) {
  const [value, setValue] = useState(vnd(defaultValue));
  return (
    <div className="relative">
      <input
        id={name}
        name={name}
        inputMode="numeric"
        value={value}
        placeholder={placeholder}
        onChange={(e) => {
          const digits = e.target.value.replace(/[^\d]/g, "").slice(0, 10);
          setValue(digits ? Number(digits).toLocaleString("vi-VN") : "");
        }}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${name}-error` : undefined}
        className={cn(inputClass, "pr-9")}
      />
      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[13px] text-muted">₫</span>
    </div>
  );
}

const initialState: ProductFormState = {};

export function ProductForm({ product, categories, suggestedId }: { product?: Product; categories: Category[]; suggestedId: string }) {
  const editing = !!product;
  const [state, dispatch, pending] = useActionState(saveProduct, initialState);
  const errors = state.errors ?? {};

  const [name, setName] = useState(product?.name ?? "");
  const [slug, setSlug] = useState(product?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(editing);
  const [specs, setSpecs] = useState(product?.specs.length ? product.specs : [{ label: "", value: "" }]);
  const [colors, setColors] = useState(product?.colors ?? []);

  const tops = categories.filter((c) => !c.parent);
  const invalid = (key: string) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${key}-error` } : {});

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Không dùng <form action> để React không xóa trắng form khi có lỗi
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(() => dispatch(fd));
      }}
    >
      <input type="hidden" name="mode" value={editing ? "edit" : "create"} />
      <input type="hidden" name="specs" value={JSON.stringify(specs)} />
      <input type="hidden" name="colors" value={JSON.stringify(colors)} />

      {state.message && (
        <p role="alert" className="mb-6 rounded-r-lg border-l-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {state.message}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Section title="Thông tin cơ bản">
            <Field name="name" label="Tên sản phẩm *" error={errors.name}>
              <input
                id="name"
                name="name"
                value={name}
                maxLength={200}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!slugTouched) setSlug(slugify(e.target.value));
                }}
                placeholder="Ví dụ: Nồi gang tráng men 24cm"
                className={inputClass}
                {...invalid("name")}
              />
            </Field>
            <Field
              name="slug"
              label="Đường dẫn"
              error={errors.slug}
              hint={editing ? "Đổi đường dẫn sẽ làm link cũ (đã chia sẻ, Google) không còn hoạt động." : "Tự tạo từ tên sản phẩm, có thể sửa."}
            >
              <div className="flex items-center overflow-hidden rounded-lg border border-line bg-white focus-within:border-ink">
                <span className="hidden shrink-0 border-r border-line bg-sand/50 px-3 py-3 text-[13px] text-muted sm:block">/san-pham/</span>
                <input
                  id="slug"
                  name="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(e.target.value.toLowerCase());
                  }}
                  className="h-11 min-w-0 flex-1 bg-transparent px-3.5 text-[14px] outline-none"
                  {...invalid("slug")}
                />
              </div>
            </Field>
            <Field name="shortDescription" label="Mô tả ngắn" hint="Hiện ở đầu trang sản phẩm và trong kết quả Google.">
              <textarea id="shortDescription" name="shortDescription" rows={4} maxLength={2000} defaultValue={product?.shortDescription} className={textareaClass} />
            </Field>
          </Section>

          <Section title="Hình ảnh" description="Kéo thả không cần thiết — bấm “Thêm ảnh”, chọn nhiều ảnh cùng lúc. Ảnh được tự thu nhỏ trước khi tải lên.">
            <ImageUploader name="images" defaultValue={product?.images.filter((s) => !!s) ?? []} />
            {errors.images && (
              <p id="images-error" className="text-[12px] text-brand-600">
                {errors.images}
              </p>
            )}
          </Section>

          <Section title="Chi tiết">
            <Field name="highlights" label="Đặc điểm nổi bật" hint="Mỗi dòng một ý.">
              <textarea
                id="highlights"
                name="highlights"
                rows={4}
                defaultValue={product?.highlights.join("\n")}
                placeholder={"Gang đúc nguyên khối\nDùng được cho bếp từ"}
                className={textareaClass}
              />
            </Field>

            <div>
              <p className={labelClass}>Thông số kỹ thuật</p>
              <ul className="space-y-2">
                {specs.map((s, i) => (
                  <li key={i} className="flex gap-2">
                    <input
                      aria-label={`Tên thông số ${i + 1}`}
                      value={s.label}
                      onChange={(e) => setSpecs((prev) => prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                      placeholder="Chất liệu"
                      className={cn(inputClass, "w-2/5")}
                    />
                    <input
                      aria-label={`Giá trị thông số ${i + 1}`}
                      value={s.value}
                      onChange={(e) => setSpecs((prev) => prev.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                      placeholder="Gang đúc phủ men sứ"
                      className={cn(inputClass, "flex-1")}
                    />
                    <button
                      type="button"
                      onClick={() => setSpecs((prev) => prev.filter((_, j) => j !== i))}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-sand hover:text-brand-700"
                      aria-label="Xóa dòng"
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setSpecs((prev) => [...prev, { label: "", value: "" }])} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
                <Plus className="h-4 w-4" aria-hidden /> Thêm thông số
              </button>
            </div>
          </Section>

          <Section title="Biến thể" description="Khách chọn màu / kích cỡ khi mua. Để trống nếu sản phẩm không có lựa chọn.">
            <div>
              <p className={labelClass}>Màu sắc</p>
              {colors.length > 0 && (
                <ul className="space-y-2">
                  {colors.map((c, i) => (
                    <li key={i} className="flex gap-2">
                      <input
                        type="color"
                        aria-label={`Mã màu ${i + 1}`}
                        value={/^#[0-9a-f]{6}$/i.test(c.hex) ? c.hex : "#cccccc"}
                        onChange={(e) => setColors((prev) => prev.map((x, j) => (j === i ? { ...x, hex: e.target.value } : x)))}
                        className="h-11 w-14 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-1"
                      />
                      <input
                        aria-label={`Tên màu ${i + 1}`}
                        value={c.name}
                        onChange={(e) => setColors((prev) => prev.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                        placeholder="Kem"
                        className={cn(inputClass, "flex-1")}
                      />
                      <button
                        type="button"
                        onClick={() => setColors((prev) => prev.filter((_, j) => j !== i))}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-sand hover:text-brand-700"
                        aria-label="Xóa màu"
                      >
                        <X className="h-4 w-4" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={() => setColors((prev) => [...prev, { name: "", hex: "#cccccc" }])} className="mt-2 inline-flex items-center gap-1.5 text-[13px] font-medium text-ink-soft hover:text-ink">
                <Plus className="h-4 w-4" aria-hidden /> Thêm màu
              </button>
              {errors.colors && <p className="mt-1.5 text-[12px] text-brand-600">{errors.colors}</p>}
            </div>
            <Field name="sizes" label="Kích cỡ" hint="Cách nhau bằng dấu phẩy, ví dụ: S, M, L, XL">
              <input id="sizes" name="sizes" defaultValue={product?.sizes?.join(", ")} placeholder="S, M, L, XL" className={inputClass} />
            </Field>
          </Section>
        </div>

        <div className="space-y-6 xl:sticky xl:top-8 xl:self-start">
          <Section title="Hiển thị">
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="published" defaultChecked={product?.published ?? true} className="mt-0.5 h-4 w-4 accent-ink" />
              <span>
                <span className="block text-[14px] text-ink">Đang bán</span>
                <span className="block text-[12px] text-muted">Bỏ chọn để ẩn khỏi cửa hàng (vẫn giữ dữ liệu).</span>
              </span>
            </label>
            <label className="flex cursor-pointer items-start gap-3">
              <input type="checkbox" name="featured" defaultChecked={product?.featured ?? false} className="mt-0.5 h-4 w-4 accent-ink" />
              <span>
                <span className="block text-[14px] text-ink">Sản phẩm nổi bật</span>
                <span className="block text-[12px] text-muted">Hiện ở mục “Sản phẩm nổi bật” trên trang chủ.</span>
              </span>
            </label>
          </Section>

          <Section title="Danh mục & mã">
            <Field name="categorySlug" label="Danh mục *" error={errors.categorySlug}>
              <select id="categorySlug" name="categorySlug" defaultValue={product?.categorySlug ?? ""} className={cn(inputClass, "cursor-pointer")} {...invalid("categorySlug")}>
                <option value="" disabled>
                  Chọn danh mục
                </option>
                {tops.map((top) => (
                  <optgroup key={top.slug} label={top.name}>
                    <option value={top.slug}>{top.name} (chung)</option>
                    {categories
                      .filter((c) => c.parent === top.slug)
                      .map((c) => (
                        <option key={c.slug} value={c.slug}>
                          {c.name}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
            </Field>
            <Field name="id" label="Mã sản phẩm (SKU) *" error={errors.id} hint={editing ? "Không đổi được sau khi tạo." : "Tự tạo sẵn, có thể đổi (ví dụ GD101)."}>
              <input
                id="id"
                name="id"
                defaultValue={product?.id ?? suggestedId}
                readOnly={editing}
                className={cn(inputClass, "uppercase", editing && "bg-sand/50 text-muted")}
                {...invalid("id")}
              />
            </Field>
          </Section>

          <Section title="Giá & kho">
            <Field name="price" label="Giá bán *" error={errors.price}>
              <MoneyInput name="price" defaultValue={product?.price} invalid={!!errors.price} placeholder="0" />
            </Field>
            <Field name="originalPrice" label="Giá gốc (trước giảm)" error={errors.originalPrice} hint="Để trống nếu không giảm giá.">
              <MoneyInput name="originalPrice" defaultValue={product?.originalPrice} invalid={!!errors.originalPrice} />
            </Field>
            <Field name="unit" label="Đơn vị bán" hint="Ví dụ: mét (vải). Để trống = cái / sản phẩm.">
              <input id="unit" name="unit" defaultValue={product?.unit} maxLength={20} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field name="stock" label="Tồn kho">
                <input id="stock" name="stock" inputMode="numeric" defaultValue={product?.stock ?? 0} className={inputClass} />
              </Field>
              <Field name="sold" label="Đã bán">
                <input id="sold" name="sold" inputMode="numeric" defaultValue={product?.sold ?? 0} className={inputClass} />
              </Field>
            </div>
            <p className="text-[12px] text-muted">Tồn kho tự trừ khi khách đặt hàng và tự cộng lại khi bạn hủy đơn.</p>
          </Section>

          <div className="flex gap-3">
            <button type="submit" disabled={pending} className={buttonVariants({ size: "md", className: "flex-1" })}>
              {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
              {pending ? "Đang lưu…" : editing ? "Lưu thay đổi" : "Tạo sản phẩm"}
            </button>
            <Link href="/admin/san-pham" className={buttonVariants({ variant: "ghost", size: "md" })}>
              Hủy
            </Link>
          </div>
        </div>
      </div>
    </form>
  );
}
