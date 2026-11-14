import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const vndFormatter = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
  maximumFractionDigits: 0,
});

/** 1290000 -> "1.290.000 ₫" */
export function formatPrice(value: number) {
  return vndFormatter.format(value);
}

/** 1290000 -> "1,3tr" ; 12500 -> "12,5k" — dùng cho các nhãn nhỏ */
export function formatCompact(value: number) {
  if (value >= 1000) {
    return `${(value / 1000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })}k`;
  }
  return value.toLocaleString("vi-VN");
}

export function discountPercent(price: number, originalPrice?: number) {
  if (!originalPrice || originalPrice <= price) return 0;
  return Math.round(((originalPrice - price) / originalPrice) * 100);
}

const dateFormatter = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export function formatDate(iso: string) {
  return dateFormatter.format(new Date(iso));
}

/** Cắt chuỗi theo ranh giới từ, thêm "…" — dùng cho meta description. */
export function truncate(text: string, max = 155) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const atWord = cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:–-]+$/, "");
  return `${atWord}…`;
}
