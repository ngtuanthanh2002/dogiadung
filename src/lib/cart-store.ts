"use client";

import { useSyncExternalStore } from "react";

/**
 * Giỏ hàng phía trình duyệt, lưu trong localStorage.
 * Giá ở đây chỉ để hiển thị — khi đặt hàng, server tính lại tổng tiền từ dữ liệu sản phẩm.
 */
export type CartLine = {
  key: string;
  slug: string;
  name: string;
  image: string;
  price: number;
  unit?: string;
  color?: string;
  size?: string;
  quantity: number;
  maxQuantity: number;
};

type CartState = { lines: CartLine[]; open: boolean; ready: boolean };

const STORAGE_KEY = "daikieu-cart-v1";
const SERVER_STATE: CartState = { lines: [], open: false, ready: false };

let state: CartState = SERVER_STATE;
let loaded = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.lines));
  } catch {
    // localStorage có thể bị chặn (chế độ riêng tư) — giỏ hàng vẫn hoạt động trong phiên.
  }
}

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  let lines: CartLine[] = [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) lines = JSON.parse(raw);
  } catch {
    lines = [];
  }
  state = { lines: Array.isArray(lines) ? lines : [], open: false, ready: true };
  window.addEventListener("storage", (e) => {
    if (e.key !== STORAGE_KEY) return;
    try {
      state = { ...state, lines: e.newValue ? JSON.parse(e.newValue) : [] };
      emit();
    } catch {}
  });
  queueMicrotask(emit);
}

function update(next: Partial<CartState>, persist = true) {
  state = { ...state, ...next };
  if (persist) save();
  emit();
}

export function lineKey(slug: string, color?: string, size?: string) {
  return [slug, color ?? "", size ?? ""].join("|");
}

export const cartActions = {
  add(line: Omit<CartLine, "key">, { openDrawer = true } = {}) {
    const key = lineKey(line.slug, line.color, line.size);
    const existing = state.lines.find((l) => l.key === key);
    const lines = existing
      ? state.lines.map((l) =>
          l.key === key ? { ...l, quantity: Math.min(l.maxQuantity, l.quantity + line.quantity) } : l,
        )
      : [...state.lines, { ...line, key }];
    update({ lines, open: openDrawer ? true : state.open });
  },
  setQuantity(key: string, quantity: number) {
    update({
      lines: state.lines.map((l) => (l.key === key ? { ...l, quantity: Math.max(1, Math.min(l.maxQuantity, quantity)) } : l)),
    });
  },
  remove(key: string) {
    update({ lines: state.lines.filter((l) => l.key !== key) });
  },
  clear() {
    update({ lines: [] });
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

export function useCart() {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => SERVER_STATE,
  );
}

export function cartTotals(lines: CartLine[], freeShippingThreshold: number, shippingFee: number) {
  const subtotal = lines.reduce((sum, l) => sum + l.price * l.quantity, 0);
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const shipping = subtotal === 0 || subtotal >= freeShippingThreshold ? 0 : shippingFee;
  return { subtotal, count, shipping, total: subtotal + shipping };
}
