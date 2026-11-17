import { provinces } from "@/data/provinces";

/**
 * Luật kiểm tra thông tin đặt hàng — dùng CHUNG cho trình duyệt (kiểm tra trước khi hiện hộp xác nhận)
 * và server action (kiểm tra lại, không tin dữ liệu gửi lên).
 */

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

export type OrderErrors = Partial<Record<OrderField, string>>;

export type OrderForm = {
  fullName: string;
  phone: string;
  email: string;
  province: string;
  ward: string;
  address: string;
  otherReceiver: boolean;
  receiverName: string;
  receiverPhone: string;
  note: string;
  agree: boolean;
};

const PHONE_RE = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(formData: FormData, key: string, max = 200) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

const phoneOf = (s: string) => s.replace(/[\s.-]/g, "");

export function readOrderForm(formData: FormData): OrderForm {
  return {
    fullName: text(formData, "fullName", 80),
    phone: phoneOf(text(formData, "phone", 20)),
    email: text(formData, "email", 120),
    province: text(formData, "province", 60),
    ward: text(formData, "ward", 80),
    address: text(formData, "address", 200),
    otherReceiver: formData.get("otherReceiver") === "on",
    receiverName: text(formData, "receiverName", 80),
    receiverPhone: phoneOf(text(formData, "receiverPhone", 20)),
    note: text(formData, "note", 500),
    agree: formData.get("agree") === "on",
  };
}

export function validateOrderForm(f: OrderForm): OrderErrors {
  const errors: OrderErrors = {};
  if (f.fullName.length < 2) errors.fullName = "Vui lòng nhập họ và tên";
  if (!PHONE_RE.test(f.phone)) errors.phone = "Số điện thoại không hợp lệ";
  if (!EMAIL_RE.test(f.email)) errors.email = "Email không hợp lệ";
  if (!provinces.includes(f.province as (typeof provinces)[number])) errors.province = "Vui lòng chọn tỉnh / thành phố";
  if (f.ward.length < 2) errors.ward = "Vui lòng nhập phường / xã";
  if (f.address.length < 5) errors.address = "Vui lòng nhập địa chỉ cụ thể";
  if (f.otherReceiver) {
    if (f.receiverName.length < 2) errors.receiverName = "Vui lòng nhập tên người nhận";
    if (!PHONE_RE.test(f.receiverPhone)) errors.receiverPhone = "Số điện thoại người nhận không hợp lệ";
  }
  if (!f.agree) errors.agree = "Vui lòng đồng ý với điều khoản để tiếp tục";
  return errors;
}

export function fullAddress(f: Pick<OrderForm, "address" | "ward" | "province">) {
  return [f.address, f.ward, f.province].filter(Boolean).join(", ");
}
