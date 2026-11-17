"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { CartProduct } from "@/data/types";

/**
 * Giỏ hàng phía trình duyệt, lưu trong localStorage.
 * Chỉ lưu MÃ sản phẩm (id) + lựa chọn của khách; tên, ảnh, giá, tồn kho được lấy mới từ
 * /api/cart mỗi khi hiển thị giỏ — nên giá luôn đúng theo DB. Khi đặt hàng, server tính lại tổng tiền.
 */
export type CartItem = {
  key: string;
  id: string;
  quantity: number;
  color?: string;
  size?: string;
};

/** Một dòng giỏ hàng đã ghép với dữ liệu sản phẩm mới nhất. */
export type CartLine = CartItem & {
  product: CartProduct;
  /** Số lượng thực tế dùng để tính tiền (đã giới hạn theo tồn kho). */
  quantity: number;
  maxQuantity: number;
  outOfStock: boolean;
};

type CartState = { items: CartItem[]; open: boolean; ready: boolean };

const STORAGE_KEY = "phungo-cart-v1";
const LEGACY_KEYS = ["daikieu-cart-v1", "daikieu-cart-v2"];
const MAX_LINES = 50;
const SERVER_STATE: CartState = { items: [], open: false, ready: false };

let state: CartState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

/** Dữ liệu trong localStorage có thể bị sửa tay — chỉ giữ những dòng hợp lệ. */
function sanitize(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is CartItem => !!v && typeof v.id === "string" && v.id.length > 0 && v.id.length <= 40)
    .slice(0, MAX_LINES)
    .map((v) => ({
      id: v.id,
      color: typeof v.color === "string" ? v.color : undefined,
      size: typeof v.size === "string" ? v.size : undefined,
      quantity: Math.max(1, Math.min(999, Math.floor(Number(v.quantity)) || 1)),
      key: lineKey(v.id, typeof v.color === "string" ? v.color : undefined, typeof v.size === "string" ? v.size : undefined),
    }));
}

function save() {
  try {
    // Không lưu `key` — tính lại được từ id/màu/size
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state.items.map(({ id, quantity, color, size }) => ({ id, quantity, color, size }))),
    );
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư) — giỏ hàng vẫn hoạt động trong phiên.
  }
}

function read(raw: string | null) {
  try {
    return sanitize(raw ? JSON.parse(raw) : []);
  } catch {
    return [];
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let items: CartItem[] = [];
  try {
    items = read(localStorage.getItem(STORAGE_KEY));
    LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {
    items = [];
  }
  state = { items, open: false, ready: true };
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    state = { ...state, items: read(e.newValue) };
    emit();
  });
  queueMicrotask(emit);
}

function update(next: Partial<CartState>, persist = true) {
  state = { ...state, ...next };
  if (persist) save();
  emit();
}

export function lineKey(id: string, color?: string, size?: string) {
  return [id, color ?? "", size ?? ""].join("|");
}

export const cartActions = {
  add(item: Omit<CartItem, "key">, { openDrawer = true } = {}) {
    const key = lineKey(item.id, item.color, item.size);
    const existing = state.items.find((l) => l.key === key);
    const items = existing
      ? state.items.map((l) => (l.key === key ? { ...l, quantity: Math.min(999, l.quantity + item.quantity) } : l))
      : [...state.items, { ...item, key }].slice(-MAX_LINES);
    update({ items, open: openDrawer ? true : state.open });
  },
  setQuantity(key: string, quantity: number) {
    update({
      items: state.items.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(999, quantity)) } : l)),
    });
  },
  remove(key: string) {
    update({ items: state.items.filter((l) => l.key !== key) });
  },
  /** Bỏ các dòng có sản phẩm không còn tồn tại trong DB. */
  removeIds(ids: string[]) {
    if (ids.length === 0) return;
    const gone = new Set(ids);
    update({ items: state.items.filter((l) => !gone.has(l.id)) });
  },
  clear() {
    update({ items: [] });
  },
  setOpen(open: boolean) {
    update({ open }, false);
  },
};

function subscribe(listener: () => void) {
  load();
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Trạng thái giỏ hàng thô (chỉ id + số lượng) — đủ cho icon đếm số trên header. */
export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

// ───────────── Lấy thông tin sản phẩm cho các id trong giỏ ─────────────

const productCache = new Map<string, CartProduct | null>();

async function fetchProducts(ids: string[]) {
  const res = await fetch(`/api/cart?ids=${encodeURIComponent(ids.join(","))}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = (await res.json()) as { products: CartProduct[] };
  const found = new Map(data.products.map((p) => [p.id, p]));
  ids.forEach((id) => productCache.set(id, found.get(id) ?? null));
}

/**
 * Giỏ hàng kèm thông tin sản phẩm (gọi /api/cart cho các id chưa có).
 * `enabled` = false để chưa gọi API (ví dụ khi ngăn kéo giỏ hàng đang đóng).
 */
export function useCartLines({ enabled = true }: { enabled?: boolean } = {}) {
  const { items, ready } = useCart();
  const [version, setVersion] = useState(0);
  const [failedKey, setFailedKey] = useState<string | null>(null);

  const idsKey = useMemo(() => [...new Set(items.map((i) => i.id))].sort().join(","), [items]);
  const error = failedKey !== null && failedKey === idsKey;

  // Mỗi lần mở giỏ / vào trang thanh toán thì lấy lại giá & tồn kho mới nhất
  useEffect(() => {
    if (!enabled || !ready || !idsKey) return;
    let cancelled = false;
    const ids = idsKey.split(",");
    fetchProducts(ids)
      .then(() => {
        if (cancelled) return;
        setFailedKey(null);
        cartActions.removeIds(ids.filter((id) => productCache.get(id) === null));
        setVersion((v) => v + 1);
      })
      .catch(() => {
        if (!cancelled) setFailedKey(idsKey);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, ready, idsKey]);

  const lines = useMemo(() => {
    void version;
    return items.flatMap((item): CartLine[] => {
      const product = productCache.get(item.id);
      if (!product) return [];
      const maxQuantity = Math.max(1, product.stock);
      return [
        {
          ...item,
          product,
          quantity: Math.min(item.quantity, maxQuantity),
          maxQuantity,
          outOfStock: product.stock <= 0,
        },
      ];
    });
  }, [items, version]);

  const loading = ready && items.length > 0 && items.some((i) => !productCache.has(i.id)) && !error;

  return { items, lines, ready, loading, error };
}

export function cartTotals(lines: CartLine[], freeShippingThreshold: number, shippingFee: number) {
  const buyable = lines.filter((l) => !l.outOfStock);
  const subtotal = buyable.reduce((sum, l) => sum + l.product.price * l.quantity, 0);
  const count = buyable.reduce((sum, l) => sum + l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFee;
  return { subtotal, count, shipping, total: subtotal + shipping };
}
