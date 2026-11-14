"use server";

import { randomInt } from "node:crypto";
import { siteConfig } from "@/config/site";
import { getProduct } from "@/data/products";
import { provinces } from "@/data/provinces";

export type OrderField =
  | "fullName"
  | "phone"
  | "email"
  | "province"
  | "ward"
  | "address"
  | "receiverName"
  | "receiverPhone"
  | "agree"
  | "cart";

export type OrderState =
  | { status: "idle" }
  | { status: "error"; message: string; errors: Partial<Record<OrderField, string>> }
  | { status: "success"; orderCode: string; total: number; itemCount: number; phone: string; fullName: string };

type SubmittedLine = { slug: string; quantity: number; color?: string; size?: string };

const PHONE_RE = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type Order = {
  orderCode: string;
  total: number;
  [key: string]: unknown;
};

/**
 * TODO: kết nối hệ thống thật — gọi API đơn hàng / lưu cơ sở dữ liệu / gửi email xác nhận.
 * Không ghi thông tin cá nhân của khách (tên, SĐT, địa chỉ) ra log.
 */
async function saveOrder(order: Order) {
  console.info(`[order] ${order.orderCode} — tổng ${order.total}đ (chưa kết nối hệ thống lưu đơn)`);
}

function text(formData: FormData, key: string, max = 200) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Đặt hàng (thanh toán khi nhận hàng — COD).
 * Kiểm tra dữ liệu và TÍNH LẠI tổng tiền từ dữ liệu sản phẩm phía server
 * (không tin giá gửi lên từ trình duyệt).
 */
export async function placeOrder(_prev: OrderState, formData: FormData): Promise<OrderState> {
  const errors: Partial<Record<OrderField, string>> = {};

  const fullName = text(formData, "fullName", 80);
  const phone = text(formData, "phone", 20).replace(/[\s.-]/g, "");
  const email = text(formData, "email", 120);
  const province = text(formData, "province", 60);
  const ward = text(formData, "ward", 80);
  const address = text(formData, "address", 200);
  const otherReceiver = formData.get("otherReceiver") === "on";
  const receiverName = text(formData, "receiverName", 80);
  const receiverPhone = text(formData, "receiverPhone", 20).replace(/[\s.-]/g, "");
  const note = text(formData, "note", 500);

  if (fullName.length < 2) errors.fullName = "Vui lòng nhập họ và tên";
  if (!PHONE_RE.test(phone)) errors.phone = "Số điện thoại không hợp lệ";
  if (!EMAIL_RE.test(email)) errors.email = "Email không hợp lệ";
  if (!provinces.includes(province as (typeof provinces)[number])) errors.province = "Vui lòng chọn tỉnh / thành phố";
  if (ward.length < 2) errors.ward = "Vui lòng nhập phường / xã";
  if (address.length < 5) errors.address = "Vui lòng nhập địa chỉ cụ thể";
  if (otherReceiver) {
    if (receiverName.length < 2) errors.receiverName = "Vui lòng nhập tên người nhận";
    if (!PHONE_RE.test(receiverPhone)) errors.receiverPhone = "Số điện thoại người nhận không hợp lệ";
  }
  if (formData.get("agree") !== "on") errors.agree = "Vui lòng đồng ý với điều khoản để tiếp tục";

  let submitted: SubmittedLine[] = [];
  try {
    const parsed = JSON.parse(text(formData, "cart", 20000) || "[]");
    if (Array.isArray(parsed)) submitted = parsed.slice(0, 50);
  } catch {
    submitted = [];
  }

  const items = submitted.flatMap((line) => {
    const product = typeof line?.slug === "string" ? getProduct(line.slug) : undefined;
    if (!product) return [];
    const quantity = Math.min(product.stock, Math.max(1, Math.floor(Number(line.quantity) || 1)));
    return [{ product, quantity, color: line.color, size: line.size }];
  });
  if (items.length === 0) errors.cart = "Giỏ hàng đang trống";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại thông tin đặt hàng.", errors };
  }

  const subtotal = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const shipping = subtotal >= siteConfig.freeShippingThreshold ? 0 : siteConfig.shippingFee;
  const total = subtotal + shipping;

  const now = new Date();
  const orderCode = `DK${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}${randomInt(1000, 9999)}`;

  const order = {
    orderCode,
    createdAt: now.toISOString(),
    paymentMethod: "COD",
    customer: { fullName, phone, email },
    shippingAddress: { province, ward, address },
    receiver: otherReceiver ? { name: receiverName, phone: receiverPhone } : null,
    note,
    items: items.map((i) => ({
      sku: i.product.id,
      name: i.product.name,
      color: i.color,
      size: i.size,
      quantity: i.quantity,
      unitPrice: i.product.price,
    })),
    subtotal,
    shipping,
    total,
  };

  await saveOrder(order);

  return {
    status: "success",
    orderCode,
    total,
    itemCount: items.reduce((n, i) => n + i.quantity, 0),
    phone,
    fullName,
  };
}
