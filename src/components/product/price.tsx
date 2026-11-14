import { cn, discountPercent, formatPrice } from "@/lib/utils";

export function Price({
  price,
  originalPrice,
  unit,
  size = "md",
  className,
}: {
  price: number;
  originalPrice?: number;
  unit?: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const pct = discountPercent(price, originalPrice);
  return (
    <p className={cn("flex flex-wrap items-baseline gap-x-2.5 gap-y-1", className)}>
      <span className={cn(size === "lg" ? "font-serif text-[28px]" : "text-[15px]", pct > 0 ? "text-brand-600" : "text-ink")}>
        {formatPrice(price)}
        {unit && <span className={cn("text-muted", size === "lg" ? "ml-1 text-base" : "text-[13px]")}> / {unit}</span>}
      </span>
      {pct > 0 && originalPrice && (
        <>
          <span className={cn("text-muted line-through", size === "lg" ? "text-base" : "text-[13px]")}>
            <span className="sr-only">Giá gốc </span>
            {formatPrice(originalPrice)}
          </span>
          {size === "lg" && <span className="text-sm text-brand-600">−{pct}%</span>}
        </>
      )}
    </p>
  );
}
