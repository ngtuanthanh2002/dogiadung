"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { ORDER_STATUSES, type OrderStatus } from "@/data/types";
import { requireAdmin } from "@/lib/admin/auth";
import { PRODUCTS_TAG } from "@/lib/catalog";
import { db } from "@/lib/db";

function orderId(formData: FormData) {
  const id = Math.floor(Number(formData.get("id")));
  if (!Number.isSafeInteger(id) || id <= 0) throw new Error("Mã đơn không hợp lệ");
  return id;
}

/**
 * Đổi trạng thái đơn.
 * - Hủy đơn: trả lại tồn kho & trừ số đã bán (chỉ một lần — đơn đã hủy không đổi trạng thái được nữa).
 * - Đơn đã hoàn thành không thể hủy (tránh cộng kho sai sau khi đã giao).
 */
export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const id = orderId(formData);
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) throw new Error("Trạng thái không hợp lệ");

  if (status === "cancelled") {
    // Một câu lệnh = một giao dịch: chỉ cộng kho nếu đơn thực sự chuyển sang "đã hủy" ở lần này
    await db()`
      WITH changed AS (
        UPDATE orders SET status = 'cancelled', updated_at = now()
        WHERE id = ${id} AND status IN ('new', 'confirmed', 'shipping')
        RETURNING id
      )
      UPDATE products p
      SET stock = p.stock + oi.qty, sold = GREATEST(p.sold - oi.qty, 0), updated_at = now()
      FROM (
        SELECT product_id, sum(quantity)::int AS qty FROM order_items
        WHERE order_id IN (SELECT id FROM changed) AND product_id IS NOT NULL
        GROUP BY product_id
      ) oi
      WHERE p.id = oi.product_id
    `;
    updateTag(PRODUCTS_TAG);
  } else {
    await db()`
      UPDATE orders SET status = ${status}, updated_at = now()
      WHERE id = ${id} AND status <> 'cancelled'
    `;
  }

  revalidatePath(`/admin/don-hang/${id}`);
}

export async function saveAdminNote(formData: FormData) {
  await requireAdmin();
  const id = orderId(formData);
  const note = String(formData.get("adminNote") ?? "").slice(0, 2000);
  await db()`UPDATE orders SET admin_note = ${note}, updated_at = now() WHERE id = ${id}`;
  revalidatePath(`/admin/don-hang/${id}`);
}

/** Xóa hẳn đơn (chỉ cho đơn đã hủy — ví dụ đơn rác, đơn thử). */
export async function deleteOrder(formData: FormData) {
  await requireAdmin();
  const id = orderId(formData);
  await db()`DELETE FROM orders WHERE id = ${id} AND status = 'cancelled'`;
  redirect("/admin/don-hang?deleted=1");
}
