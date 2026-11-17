"use server";

import { randomInt } from "node:crypto";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { siteConfig } from "@/config/site";
import { provinces } from "@/data/provinces";
import { getProductsByIds, PRODUCTS_TAG } from "@/lib/catalog";
import { db } from "@/lib/db";

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

type SubmittedLine = { id: string; quantity: number; color?: string; size?: string };

const PHONE_RE = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Chống spam đơn đơn giản: tối đa 5 đơn / 10 phút cho mỗi IP (trong bộ nhớ của từng máy chủ).
 * Không tuyệt đối trên serverless nhưng chặn được việc bấm liên tục / bot đơn giản.
 */
const RATE_WINDOW_MS = 10 * 60_000;
const RATE_MAX = 5;
const recentOrders = new Map<string, number[]>();

function rateLimited(ip: string) {
  const now = Date.now();
  const hits = (recentOrders.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (hits.length >= RATE_MAX) return true;
  hits.push(now);
  recentOrders.set(ip, hits);
  if (recentOrders.size > 5000) recentOrders.clear();
  return false;
}

function newOrderCode() {
  const now = new Date(Date.now() + 7 * 3600_000); // giờ Việt Nam
  const ymd = now.toISOString().slice(2, 10).replace(/-/g, "");
  return `PN${ymd}${randomInt(100000, 999999)}`;
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

  // Ô "website" bị ẩn với người thật — bot điền vào thì bỏ qua
  if (text(formData, "website")) {
    return { status: "error", message: "Không gửi được đơn hàng.", errors: {} };
  }
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (rateLimited(ip)) {
    return {
      status: "error",
      message: "Bạn vừa đặt nhiều đơn liên tiếp. Vui lòng thử lại sau ít phút hoặc gọi hotline để được hỗ trợ.",
      errors: {},
    };
  }

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

  // Giá, tồn kho, màu/size hợp lệ đều lấy từ DB — không tin dữ liệu gửi lên từ trình duyệt
  const ids = submitted.map((l) => l?.id).filter((id): id is string => typeof id === "string");
  let catalog: Awaited<ReturnType<typeof getProductsByIds>>;
  try {
    catalog = await getProductsByIds(ids);
  } catch (error) {
    console.error("[order] Không đọc được sản phẩm:", error instanceof Error ? error.message : error);
    return { status: "error", message: "Hệ thống đang bận, vui lòng thử lại sau ít phút.", errors: {} };
  }
  const byId = new Map(catalog.map((p) => [p.id, p]));

  const items = submitted.flatMap((line) => {
    const product = typeof line?.id === "string" ? byId.get(line.id) : undefined;
    if (!product || product.stock <= 0) return [];
    const color = product.colors?.some((c) => c.name === line.color) ? line.color : undefined;
    const size = product.sizes?.includes(line.size ?? "") ? line.size : undefined;
    const quantity = Math.min(product.stock, Math.max(1, Math.floor(Number(line.quantity) || 1)));
    return [{ product, quantity, color, size }];
  });
  if (items.length === 0) errors.cart = "Giỏ hàng đang trống";

  if (Object.keys(errors).length > 0) {
    return { status: "error", message: "Vui lòng kiểm tra lại thông tin đặt hàng.", errors };
  }

  const order = {
    customerName: fullName,
    phone,
    email,
    province,
    ward,
    address,
    receiverName: otherReceiver ? receiverName : null,
    receiverPhone: otherReceiver ? receiverPhone : null,
    note,
  };
  const orderItems = items.map((i) => ({ id: i.product.id, quantity: i.quantity, color: i.color ?? null, size: i.size ?? null }));

  // Lưu đơn + trừ tồn kho trong một giao dịch (hàm place_order trong DB, xem src/db/schema.ts).
  // Giá được lấy lại từ DB tại thời điểm đặt.
  let result: { out_code: string; out_total: number; out_count: number } | undefined;
  for (let attempt = 0; attempt < 3 && !result; attempt++) {
    try {
      const rows = (await db()`
        SELECT * FROM place_order(
          ${JSON.stringify({ ...order, code: newOrderCode() })}::jsonb,
          ${JSON.stringify(orderItems)}::jsonb,
          ${siteConfig.freeShippingThreshold}, ${siteConfig.shippingFee}
        )
      `) as { out_code: string; out_total: number; out_count: number }[];
      result = rows[0];
    } catch (error) {
      const err = error as { message?: string; code?: string; detail?: string };
      if (err.code === "23505") continue; // trùng mã đơn (rất hiếm) → tạo mã khác
      if (err.message?.includes("OUT_OF_STOCK")) {
        const name = items.find((i) => i.product.id === err.detail)?.product.name;
        return {
          status: "error",
          message: `${name ? `“${name}”` : "Một sản phẩm"} vừa hết hàng hoặc không đủ số lượng. Vui lòng giảm số lượng hoặc bỏ sản phẩm này khỏi giỏ.`,
          errors: { cart: "Có sản phẩm không đủ hàng" },
        };
      }
      // Không ghi thông tin cá nhân của khách ra log
      console.error("[order] Không lưu được đơn:", err.message ?? error);
      return { status: "error", message: "Hệ thống đang bận, vui lòng thử lại sau ít phút.", errors: {} };
    }
  }
  if (!result) {
    return { status: "error", message: "Không tạo được mã đơn hàng, vui lòng thử lại.", errors: {} };
  }

  // Tồn kho / số đã bán thay đổi → làm mới cache sản phẩm (cửa hàng vẫn phục vụ bản cũ trong lúc tải lại)
  revalidateTag(PRODUCTS_TAG, "max");

  return {
    status: "success",
    orderCode: result.out_code,
    total: result.out_total,
    itemCount: result.out_count,
    phone,
    fullName,
  };
}
