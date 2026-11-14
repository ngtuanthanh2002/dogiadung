"use client";

import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import { cartActions, cartTotals, useCart } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export function CartButton() {
  const { lines, ready } = useCart();
  const count = lines.reduce((n, l) => n + l.quantity, 0);

  return (
    <button
      type="button"
      onClick={() => cartActions.setOpen(true)}
      aria-label={`Giỏ hàng${ready ? ` (${count} sản phẩm)` : ""}`}
      className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink transition-colors hover:bg-sand"
    >
      <ShoppingBag className="h-[19px] w-[19px]" strokeWidth={1.6} aria-hidden />
      {ready && count > 0 && (
        <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function QuantityControl({
  value,
  onChange,
  max,
  label,
  size = "sm",
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-9" : "h-12";
  return (
    <div className={`inline-flex ${h} items-center rounded-full border border-line`} role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={value <= 1}
        className={`flex ${h} w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-30`}
        aria-label="Giảm số lượng"
      >
        <Minus className="h-3.5 w-3.5" aria-hidden />
      </button>
      <span className="w-8 text-center text-sm tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        className={`flex ${h} w-9 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-sand hover:text-ink disabled:opacity-30`}
        aria-label="Tăng số lượng"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
      </button>
    </div>
  );
}

export function CartDrawer() {
  const { lines, open } = useCart();
  const { subtotal, count } = cartTotals(lines, siteConfig.freeShippingThreshold, siteConfig.shippingFee);
  const remaining = Math.max(0, siteConfig.freeShippingThreshold - subtotal);

  return (
    <Dialog.Root open={open} onOpenChange={cartActions.setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/30 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col bg-ivory shadow-2xl outline-none data-[state=closed]:animate-slide-out-right data-[state=open]:animate-slide-in-right">
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <Dialog.Title className="font-serif text-xl">
              Giỏ hàng <span className="text-base text-muted">({count})</span>
            </Dialog.Title>
            <Dialog.Close className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-sand" aria-label="Đóng giỏ hàng">
              <X className="h-5 w-5" strokeWidth={1.6} aria-hidden />
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">Danh sách sản phẩm trong giỏ hàng</Dialog.Description>

          {lines.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
              <ShoppingBag className="h-10 w-10 text-muted" strokeWidth={1.2} aria-hidden />
              <p className="mt-4 font-serif text-xl">Giỏ hàng đang trống</p>
              <p className="mt-2 text-sm text-muted">Khám phá các sản phẩm của Đại Kiều và thêm vào giỏ hàng.</p>
              <Dialog.Close asChild>
                <Link href="/san-pham" className={buttonVariants({ className: "mt-8" })}>
                  Mua sắm ngay
                </Link>
              </Dialog.Close>
            </div>
          ) : (
            <>
              <p className="border-b border-line px-6 py-3 text-[13px] text-muted">
                {remaining > 0 ? (
                  <>
                    Mua thêm <span className="font-medium text-ink">{formatPrice(remaining)}</span> để được miễn phí giao hàng
                  </>
                ) : (
                  "Đơn hàng của bạn được miễn phí giao hàng"
                )}
              </p>
              <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
                {lines.map((line) => (
                  <li key={line.key} className="flex gap-4 py-5">
                    <Link
                      href={`/san-pham/${line.slug}`}
                      onClick={() => cartActions.setOpen(false)}
                      className="group/img relative h-24 w-20 shrink-0 overflow-hidden rounded-sm bg-sand"
                    >
                      <Image src={line.image} alt={line.name} fill sizes="80px" className="object-cover transition-transform duration-500 group-hover/img:scale-105" />
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/san-pham/${line.slug}`}
                          onClick={() => cartActions.setOpen(false)}
                          className="text-[15px] leading-snug text-ink transition-colors hover:text-brand-600"
                        >
                          {line.name}
                        </Link>
                        <button
                          type="button"
                          onClick={() => cartActions.remove(line.key)}
                          className="-m-1 shrink-0 rounded-full p-1 text-muted transition-colors hover:bg-sand hover:text-brand-600"
                          aria-label={`Xóa ${line.name}`}
                        >
                          <X className="h-4 w-4" aria-hidden />
                        </button>
                      </div>
                      {(line.color || line.size || line.unit) && (
                        <p className="mt-1 text-[13px] text-muted">{[line.color, line.size, line.unit && `${formatPrice(line.price)} / ${line.unit}`].filter(Boolean).join(" · ")}</p>
                      )}
                      <div className="mt-auto flex items-center justify-between pt-3">
                        <QuantityControl
                          value={line.quantity}
                          max={line.maxQuantity}
                          onChange={(v) => cartActions.setQuantity(line.key, v)}
                          label={`Số lượng ${line.name}`}
                        />
                        <p className="text-sm font-medium">{formatPrice(line.price * line.quantity)}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="border-t border-line px-6 py-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-sm text-muted">Tạm tính</span>
                  <span className="font-serif text-2xl">{formatPrice(subtotal)}</span>
                </div>
                <p className="mt-1 text-[13px] text-muted">Phí giao hàng được tính ở bước thanh toán · Thanh toán khi nhận hàng</p>
                <Dialog.Close asChild>
                  <Link href="/thanh-toan" className={buttonVariants({ size: "lg", className: "mt-5 w-full" })}>
                    Tiến hành thanh toán
                  </Link>
                </Dialog.Close>
                <Dialog.Close className="mt-3 w-full text-center text-sm text-muted underline-offset-4 hover:text-ink hover:underline">
                  Tiếp tục mua sắm
                </Dialog.Close>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
