import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Mail, MapPin, Phone, StickyNote, Trash } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/data/types";
import { requireAdmin } from "@/lib/admin/auth";
import { countOrdersByPhone, getOrder } from "@/lib/admin/queries";
import { cn, formatDateTime, formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { Card, PageHeader, Pill, StatusBadge, textareaClass } from "@/components/admin/ui";
import { DangerButton, SubmitButton } from "@/components/admin/form-controls";
import { deleteOrder, saveAdminNote, updateOrderStatus } from "../actions";

export const metadata: Metadata = { title: "Chi tiết đơn hàng" };

/** Bước tiếp theo gợi ý cho từng trạng thái. */
const nextStep: Partial<Record<OrderStatus, { status: OrderStatus; label: string }>> = {
  new: { status: "confirmed", label: "Xác nhận đơn" },
  confirmed: { status: "shipping", label: "Đã giao cho vận chuyển" },
  shipping: { status: "completed", label: "Đã giao & thu tiền" },
};

export default async function OrderDetailPage({ params }: PageProps<"/admin/don-hang/[id]">) {
  await requireAdmin();
  const { id } = await params;
  const orderId = Math.floor(Number(id));
  if (!Number.isSafeInteger(orderId) || orderId <= 0) notFound();

  const order = await getOrder(orderId);
  if (!order) notFound();
  const previousOrders = (await countOrdersByPhone(order.phone)) - 1;

  const locked = order.status === "cancelled";
  const step = nextStep[order.status];
  const tel = order.phone.replace(/^\+84/, "0");

  return (
    <>
      <PageHeader
        back={{ href: "/admin/don-hang", label: "Đơn hàng" }}
        title={`Đơn ${order.code}`}
        description={
          <span className="inline-flex flex-wrap items-center gap-2">
            Đặt lúc {formatDateTime(order.createdAt)} <StatusBadge status={order.status} />
          </span>
        }
        actions={
          <a href={`tel:${tel}`} className="inline-flex h-10 items-center gap-2 rounded-full border border-ink px-5 text-[13px] font-medium text-ink transition-colors hover:bg-ink hover:text-ivory">
            <Phone className="h-4 w-4" aria-hidden /> Gọi {order.phone}
          </a>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="space-y-6">
          <Card title={`Sản phẩm (${order.itemCount})`}>
            <ul className="-my-3 divide-y divide-line">
              {order.items.map((item) => (
                <li key={item.id} className="flex gap-4 py-3">
                  <span className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-sand">
                    <Image src={item.image || PLACEHOLDER_IMAGE} alt="" fill sizes="56px" className="object-cover" />
                  </span>
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link href={`/admin/san-pham/${item.productId}`} className="text-[14px] font-medium text-ink hover:text-brand-600">
                        {item.productName}
                      </Link>
                    ) : (
                      <p className="text-[14px] font-medium text-ink">
                        {item.productName} <span className="font-normal text-muted">(đã xóa)</span>
                      </p>
                    )}
                    <p className="mt-0.5 text-[12px] text-muted">
                      {["Mã " + item.sku, item.color && `Màu ${item.color}`, item.size && `Size ${item.size}`].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                  <div className="text-right text-[14px] tabular-nums">
                    <p>{formatPrice(item.unitPrice * item.quantity)}</p>
                    <p className="text-[12px] text-muted">
                      {item.quantity} {item.unit ?? "×"} {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Tạm tính</dt>
                <dd className="tabular-nums">{formatPrice(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Phí giao hàng</dt>
                <dd className="tabular-nums">{order.shippingFee === 0 ? "Miễn phí" : formatPrice(order.shippingFee)}</dd>
              </div>
              <div className="flex items-baseline justify-between border-t border-line pt-3">
                <dt className="font-medium">Thu khi giao (COD)</dt>
                <dd className="font-serif text-2xl tabular-nums">{formatPrice(order.total)}</dd>
              </div>
            </dl>
          </Card>

          {order.note && (
            <Card title="Ghi chú của khách">
              <p className="flex gap-2 whitespace-pre-line text-[14px] text-ink-soft">
                <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                {order.note}
              </p>
            </Card>
          )}

          <Card title="Ghi chú nội bộ">
            <form action={saveAdminNote}>
              <input type="hidden" name="id" value={order.id} />
              <label htmlFor="adminNote" className="sr-only">
                Ghi chú nội bộ
              </label>
              <textarea
                id="adminNote"
                name="adminNote"
                rows={3}
                maxLength={2000}
                defaultValue={order.adminNote}
                placeholder="Chỉ quản trị viên thấy — ví dụ: khách hẹn giao sau 18h, mã vận đơn GHN…"
                className={textareaClass}
              />
              <SubmitButton className="mt-3" variant="outline">
                Lưu ghi chú
              </SubmitButton>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card title="Xử lý đơn">
            {locked ? (
              <p className="text-sm text-muted">Đơn đã hủy — tồn kho đã được hoàn lại. Không thể đổi trạng thái.</p>
            ) : (
              <>
                {step && (
                  <form action={updateOrderStatus}>
                    <input type="hidden" name="id" value={order.id} />
                    <input type="hidden" name="status" value={step.status} />
                    <SubmitButton size="md" className="w-full" pendingText="Đang cập nhật…">
                      {step.label}
                    </SubmitButton>
                  </form>
                )}
                <form action={updateOrderStatus} className={cn("flex gap-2", step && "mt-4 border-t border-line pt-4")}>
                  <input type="hidden" name="id" value={order.id} />
                  <label htmlFor="status" className="sr-only">
                    Trạng thái
                  </label>
                  <select
                    id="status"
                    name="status"
                    defaultValue={order.status}
                    className="h-10 flex-1 cursor-pointer rounded-lg border border-line bg-white px-3 text-[14px] outline-none focus:border-ink"
                  >
                    {ORDER_STATUSES.filter((s) => !(order.status === "completed" && s === "cancelled")).map((s) => (
                      <option key={s} value={s}>
                        {ORDER_STATUS_LABEL[s]}
                      </option>
                    ))}
                  </select>
                  <SubmitButton variant="outline" pendingText="…" confirmMessage="Đổi trạng thái đơn hàng? Nếu chọn “Đã hủy”, tồn kho sẽ được hoàn lại và không thể khôi phục.">
                    Đổi
                  </SubmitButton>
                </form>
                <ol className="mt-5 space-y-1.5 text-[12px] text-muted">
                  <li>Mới → gọi điện xác nhận với khách</li>
                  <li>Đã xác nhận → đóng gói, giao cho đơn vị vận chuyển</li>
                  <li>Đang giao → khi khách nhận & trả tiền, chọn Hoàn thành</li>
                  <li>Hủy đơn sẽ tự cộng lại tồn kho</li>
                </ol>
              </>
            )}
          </Card>

          <Card title="Khách hàng">
            <p className="text-[15px] font-medium text-ink">{order.customerName}</p>
            {previousOrders > 0 ? (
              <Link href={`/admin/don-hang?q=${encodeURIComponent(order.phone)}`} className="mt-1 inline-block">
                <Pill tone="success">Khách quen · {previousOrders} đơn trước</Pill>
              </Link>
            ) : (
              <p className="mt-1">
                <Pill>Khách mới</Pill>
              </p>
            )}
            <ul className="mt-4 space-y-2.5 text-[14px] text-ink-soft">
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <a href={`tel:${tel}`} className="hover:text-ink">
                  {order.phone}
                </a>
              </li>
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <a href={`mailto:${order.email}`} className="break-all hover:text-ink">
                  {order.email}
                </a>
              </li>
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
                <span>
                  {order.address}, {order.ward}, {order.province}
                </span>
              </li>
            </ul>
            {order.receiverName && (
              <div className="mt-4 rounded-lg bg-sand/60 px-3.5 py-3 text-[13px]">
                <p className="text-muted">Người nhận khác</p>
                <p className="mt-0.5 text-ink">
                  {order.receiverName} · {order.receiverPhone}
                </p>
              </div>
            )}
            <p className="mt-4 text-[12px] text-muted">Thanh toán: {order.paymentMethod === "COD" ? "Tiền mặt khi nhận hàng (COD)" : order.paymentMethod}</p>
          </Card>

          {locked && (
            <form action={deleteOrder} className="text-right">
              <input type="hidden" name="id" value={order.id} />
              <DangerButton confirmMessage={`Xóa vĩnh viễn đơn ${order.code}? Không thể hoàn tác.`}>
                <Trash className="h-4 w-4" aria-hidden /> Xóa đơn đã hủy
              </DangerButton>
            </form>
          )}
        </div>
      </div>
    </>
  );
}
