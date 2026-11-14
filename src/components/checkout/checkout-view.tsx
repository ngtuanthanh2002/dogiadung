"use client";

import { startTransition, useActionState, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Banknote, Check, ShoppingBag, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { provinces } from "@/data/provinces";
import { cartActions, cartTotals, useCart } from "@/lib/cart-store";
import { cn, formatPrice } from "@/lib/utils";
import { placeOrder, type OrderField, type OrderState } from "@/app/thanh-toan/actions";
import { QuantityControl } from "@/components/cart/cart-drawer";
import { buttonVariants } from "@/components/ui/button";

const inputClass =
  "h-12 w-full rounded-none border-0 border-b border-line bg-transparent px-0 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-ink aria-[invalid=true]:border-brand-600";

function Field({
  name,
  label,
  error,
  className,
  children,
}: {
  name: string;
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-[13px] text-muted">
        {label}
      </label>
      {children}
      {error && (
        <p id={`${name}-error`} className="mt-1.5 text-[13px] text-brand-600">
          {error}
        </p>
      )}
    </div>
  );
}

const initialState: OrderState = { status: "idle" };

export function CheckoutView() {
  const { lines, ready } = useCart();
  const [state, dispatch, pending] = useActionState(placeOrder, initialState);
  const [otherReceiver, setOtherReceiver] = useState(false);
  // Đã đăng nhập Google: điền sẵn họ tên và email
  const { data: session } = useSession();
  const profileKey = session?.user?.email ?? "guest";
  const totals = cartTotals(lines, siteConfig.freeShippingThreshold, siteConfig.shippingFee);
  const errors: Partial<Record<OrderField, string>> = state.status === "error" ? state.errors : {};

  useEffect(() => {
    if (state.status === "success") {
      cartActions.clear();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [state.status]);

  const invalid = (field: OrderField) =>
    errors[field] ? { "aria-invalid": true as const, "aria-describedby": `${field}-error` } : {};

  // ───── Đặt hàng thành công ─────
  if (state.status === "success") {
    return (
      <div className="mx-auto max-w-xl py-16 text-center">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-ink text-ivory">
          <Check className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        </span>
        <h2 className="mt-8 font-serif text-4xl">Cảm ơn bạn đã đặt hàng</h2>
        <p className="mt-4 leading-relaxed text-ink-soft">
          Đơn hàng <span className="font-medium text-ink">{state.orderCode}</span> gồm {state.itemCount} sản phẩm, tổng{" "}
          <span className="font-medium text-ink">{formatPrice(state.total)}</span>. Nhân viên Đại Kiều sẽ gọi đến số{" "}
          <span className="font-medium text-ink">{state.phone}</span> để xác nhận trước khi giao hàng.
        </p>
        <p className="mt-3 text-sm text-muted">Bạn thanh toán bằng tiền mặt khi nhận hàng.</p>
        <Link href="/san-pham" className={buttonVariants({ className: "mt-10" })}>
          Tiếp tục mua sắm
        </Link>
      </div>
    );
  }

  if (!ready) {
    return <div className="h-96" aria-busy="true" />;
  }

  // ───── Giỏ hàng trống ─────
  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-md py-20 text-center">
        <ShoppingBag className="mx-auto h-10 w-10 text-muted" strokeWidth={1.2} aria-hidden />
        <h2 className="mt-6 font-serif text-3xl">Giỏ hàng đang trống</h2>
        <p className="mt-3 text-muted">Hãy chọn sản phẩm bạn yêu thích trước khi thanh toán.</p>
        <Link href="/san-pham" className={buttonVariants({ className: "mt-10" })}>
          Mua sắm ngay
        </Link>
      </div>
    );
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        startTransition(() => dispatch(formData));
      }}
      className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-20"
    >
      <input
        type="hidden"
        name="cart"
        value={JSON.stringify(lines.map((l) => ({ slug: l.slug, quantity: l.quantity, color: l.color, size: l.size })))}
      />

      <div className="space-y-14">
        {state.status === "error" && (
          <p role="alert" className="border-l-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {state.message}
          </p>
        )}

        <section aria-labelledby="receiver-heading">
          <h2 id="receiver-heading" className="font-serif text-2xl">
            Thông tin nhận hàng
          </h2>
          <div className="mt-8 grid gap-x-8 gap-y-7 md:grid-cols-2">
            <Field name="fullName" label="Họ và tên *" error={errors.fullName}>
              <input key={`name-${profileKey}`} id="fullName" name="fullName" autoComplete="name" defaultValue={session?.user?.name ?? ""} required className={inputClass} {...invalid("fullName")} />
            </Field>
            <Field name="phone" label="Số điện thoại *" error={errors.phone}>
              <input id="phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required className={inputClass} {...invalid("phone")} />
            </Field>
            <Field name="email" label="Địa chỉ email *" error={errors.email} className="md:col-span-2">
              <input key={`email-${profileKey}`} id="email" name="email" type="email" autoComplete="email" defaultValue={session?.user?.email ?? ""} required className={inputClass} {...invalid("email")} />
            </Field>
            <Field name="province" label="Tỉnh / Thành phố *" error={errors.province}>
              <select id="province" name="province" required defaultValue="" className={cn(inputClass, "cursor-pointer")} {...invalid("province")}>
                <option value="" disabled>
                  Chọn tỉnh / thành phố
                </option>
                {provinces.map((p) => (
                  <option key={p}>{p}</option>
                ))}
              </select>
            </Field>
            <Field name="ward" label="Phường / Xã *" error={errors.ward}>
              <input id="ward" name="ward" required className={inputClass} {...invalid("ward")} />
            </Field>
            <Field name="address" label="Địa chỉ cụ thể *" error={errors.address} className="md:col-span-2">
              <input
                id="address"
                name="address"
                autoComplete="street-address"
                placeholder="Số nhà, tên đường, tòa nhà…"
                required
                className={inputClass}
                {...invalid("address")}
              />
            </Field>
          </div>

          <label className="mt-8 flex w-fit cursor-pointer items-center gap-3 text-sm text-ink-soft">
            <input
              type="checkbox"
              name="otherReceiver"
              checked={otherReceiver}
              onChange={(e) => setOtherReceiver(e.target.checked)}
              className="h-4 w-4 accent-ink"
            />
            Người khác nhận hàng
          </label>
          {otherReceiver && (
            <div className="mt-6 grid gap-x-8 gap-y-7 md:grid-cols-2">
              <Field name="receiverName" label="Tên người nhận *" error={errors.receiverName}>
                <input id="receiverName" name="receiverName" required className={inputClass} {...invalid("receiverName")} />
              </Field>
              <Field name="receiverPhone" label="Số điện thoại người nhận *" error={errors.receiverPhone}>
                <input id="receiverPhone" name="receiverPhone" type="tel" inputMode="tel" required className={inputClass} {...invalid("receiverPhone")} />
              </Field>
            </div>
          )}
        </section>

        <section aria-labelledby="note-heading">
          <h2 id="note-heading" className="font-serif text-2xl">
            Thông tin bổ sung
          </h2>
          <label htmlFor="note" className="sr-only">
            Ghi chú đơn hàng
          </label>
          <textarea
            id="note"
            name="note"
            rows={3}
            maxLength={500}
            placeholder="Ghi chú đơn hàng (tùy chọn), ví dụ: thời gian hoặc địa điểm giao hàng chi tiết hơn."
            className="mt-6 w-full resize-none border-0 border-b border-line bg-transparent px-0 py-2 text-[15px] outline-none placeholder:text-muted/70 focus:border-ink"
          />
        </section>

        <section aria-labelledby="payment-heading">
          <h2 id="payment-heading" className="font-serif text-2xl">
            Phương thức thanh toán
          </h2>
          <div className="mt-6 flex items-start gap-4 border border-ink px-5 py-5">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-ink" />
            </span>
            <div className="flex-1">
              <p className="flex items-center gap-2 font-medium">
                <Banknote className="h-[18px] w-[18px]" strokeWidth={1.5} aria-hidden />
                Thanh toán khi nhận hàng (COD)
              </p>
              <p className="mt-1.5 text-sm text-muted">
                Bạn kiểm tra hàng rồi thanh toán tiền mặt cho nhân viên giao hàng. Không cần trả trước.
              </p>
            </div>
          </div>
          <input type="hidden" name="paymentMethod" value="cod" />
        </section>
      </div>

      {/* ───── Tóm tắt đơn hàng ───── */}
      <aside className="lg:sticky lg:top-28 lg:self-start" aria-labelledby="summary-heading">
        <div className="bg-sand/70 p-6 md:p-8">
          <h2 id="summary-heading" className="font-serif text-2xl">
            Đơn hàng <span className="text-lg text-muted">({totals.count})</span>
          </h2>
          {errors.cart && <p className="mt-3 text-sm text-brand-600">{errors.cart}</p>}
          <ul className="mt-6 divide-y divide-line">
            {lines.map((line) => (
              <li key={line.key} className="flex gap-4 py-5 first:pt-0">
                <span className="relative h-20 w-16 shrink-0 overflow-hidden bg-sand-dark">
                  <Image src={line.image} alt={line.name} fill sizes="64px" className="object-cover" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-snug">{line.name}</p>
                    <button type="button" onClick={() => cartActions.remove(line.key)} className="-m-1 rounded-full p-1 text-muted transition-colors hover:bg-sand-dark hover:text-brand-600" aria-label={`Xóa ${line.name}`}>
                      <X className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                  {(line.color || line.size || line.unit) && (
                    <p className="mt-0.5 text-[12px] text-muted">{[line.color, line.size, line.unit && `${formatPrice(line.price)} / ${line.unit}`].filter(Boolean).join(" · ")}</p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2">
                    <QuantityControl
                      value={line.quantity}
                      max={line.maxQuantity}
                      onChange={(v) => cartActions.setQuantity(line.key, v)}
                      label={`Số lượng ${line.name}`}
                    />
                    <span className="text-sm">{formatPrice(line.price * line.quantity)}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <dl className="mt-2 space-y-3 border-t border-line pt-6 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Tạm tính</dt>
              <dd>{formatPrice(totals.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Phí giao hàng</dt>
              <dd>{totals.shipping === 0 ? "Miễn phí" : formatPrice(totals.shipping)}</dd>
            </div>
            <div className="flex items-baseline justify-between border-t border-line pt-4">
              <dt className="font-medium">Tổng thanh toán</dt>
              <dd className="font-serif text-[28px]">{formatPrice(totals.total)}</dd>
            </div>
          </dl>

          <label className="mt-6 flex cursor-pointer items-start gap-3 text-[13px] leading-relaxed text-ink-soft">
            <input type="checkbox" name="agree" required className="mt-0.5 h-4 w-4 shrink-0 accent-ink" {...invalid("agree")} />
            <span>
              Tôi đã đọc và đồng ý với{" "}
              <Link href="/chinh-sach/dieu-khoan-su-dung" target="_blank" className="underline underline-offset-2 hover:text-ink">
                điều khoản và điều kiện
              </Link>{" "}
              của website.
            </span>
          </label>
          {errors.agree && (
            <p id="agree-error" className="mt-1.5 text-[13px] text-brand-600">
              {errors.agree}
            </p>
          )}

          <button type="submit" disabled={pending} className={buttonVariants({ size: "lg", className: "mt-7 w-full" })}>
            {pending ? "Đang đặt hàng…" : "Đặt hàng"}
          </button>
        </div>
      </aside>
    </form>
  );
}
