"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ProductColor } from "@/data/types";
import { cartActions } from "@/lib/cart-store";
import { cn } from "@/lib/utils";
import { QuantityControl } from "@/components/cart/cart-drawer";
import { buttonVariants } from "@/components/ui/button";

type Props = {
  /** Mã sản phẩm — giỏ hàng chỉ lưu mã này, thông tin còn lại lấy từ DB khi hiển thị giỏ. */
  id: string;
  unit?: string;
  stock: number;
  colors?: ProductColor[];
  sizes?: string[];
};

/** Chọn màu / kích cỡ / số lượng, thêm vào giỏ hoặc mua ngay (chuyển tới thanh toán). */
export function PurchasePanel({ id, unit, stock, colors, sizes }: Props) {
  const router = useRouter();
  const [color, setColor] = useState(colors?.[0]?.name);
  const [size, setSize] = useState<string | undefined>(sizes && sizes.length === 1 ? sizes[0] : undefined);
  const [qty, setQty] = useState(1);
  const [needSize, setNeedSize] = useState(false);

  function addToCart(openDrawer: boolean) {
    if (stock <= 0) return false;
    if (sizes?.length && !size) {
      setNeedSize(true);
      return false;
    }
    cartActions.add({ id, color, size, quantity: qty }, { openDrawer });
    return true;
  }

  return (
    <div className="space-y-7">
      {colors && colors.length > 0 && (
        <fieldset>
          <legend className="text-[13px] text-muted">
            Màu sắc: <span className="text-ink">{color}</span>
          </legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {colors.map((c) => (
              <label key={c.name} className="cursor-pointer" title={c.name}>
                <input type="radio" name="color" value={c.name} checked={color === c.name} onChange={() => setColor(c.name)} className="peer sr-only" />
                <span
                  className="block h-9 w-9 rounded-full border border-black/10 ring-offset-2 ring-offset-ivory transition duration-300 hover:scale-110 peer-checked:ring-1 peer-checked:ring-ink peer-focus-visible:ring-1 peer-focus-visible:ring-ink"
                  style={{ backgroundColor: c.hex }}
                />
                <span className="sr-only">{c.name}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {sizes && sizes.length > 0 && (
        <fieldset>
          <legend className="text-[13px] text-muted">
            Kích cỡ{size ? <>: <span className="text-ink">{size}</span></> : ""}
          </legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {sizes.map((s) => (
              <label key={s} className="cursor-pointer">
                <input
                  type="radio"
                  name="size"
                  value={s}
                  checked={size === s}
                  onChange={() => {
                    setSize(s);
                    setNeedSize(false);
                  }}
                  className="peer sr-only"
                />
                <span className="flex h-10 min-w-12 items-center justify-center rounded-full border border-line px-4 text-sm text-ink-soft transition peer-checked:border-ink peer-checked:bg-ink peer-checked:text-ivory peer-focus-visible:border-ink hover:border-ink hover:text-ink">
                  {s}
                </span>
              </label>
            ))}
          </div>
          {needSize && (
            <p role="alert" className="mt-2 text-[13px] text-brand-600">
              Vui lòng chọn kích cỡ
            </p>
          )}
        </fieldset>
      )}

      <div>
        <p className="text-[13px] text-muted" id="qty-label">
          Số lượng{unit ? ` (${unit})` : ""}
        </p>
        <div className="mt-3 flex items-center gap-4">
          <QuantityControl value={qty} onChange={(v) => setQty(Math.min(stock, Math.max(1, v)))} max={stock} label="Số lượng" size="md" />
          <span className="text-[13px] text-muted">{stock > 0 ? `Còn ${stock} sản phẩm` : "Tạm hết hàng"}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button type="button" disabled={stock <= 0} onClick={() => addToCart(true)} className={buttonVariants({ variant: "outline", size: "lg", className: "w-full sm:flex-1" })}>
          Thêm vào giỏ hàng
        </button>
        <button
          type="button"
          disabled={stock <= 0}
          onClick={() => {
            if (addToCart(false)) router.push("/thanh-toan");
          }}
          className={cn(buttonVariants({ size: "lg", className: "w-full sm:flex-1" }))}
        >
          Mua ngay
        </button>
      </div>
    </div>
  );
}
