"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import * as Dialog from "@radix-ui/react-dialog";
import { Banknote, Check, CircleCheck, Copy, LoaderCircle, MapPin, Phone, StickyNote, X } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { PlacedOrder } from "@/app/(shop)/thanh-toan/actions";
import { fullAddress, type OrderForm } from "@/lib/order-validation";
import { cn, formatDateTime, formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

/** Ảnh chụp đơn tại lúc bấm "Đặt hàng" — hiển thị trong hộp xác nhận. */
export type OrderDraft = {
  form: OrderForm;
  lines: { key: string; name: string; image: string; quantity: number; price: number; unit?: string; color?: string; size?: string }[];
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
};

const overlayClass =
  "fixed inset-0 z-[60] bg-ink/45 backdrop-blur-[2px] data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in";
const contentClass =
  "fixed left-1/2 top-1/2 z-[60] flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl bg-ivory shadow-2xl outline-none data-[state=closed]:animate-fade-out data-[state=open]:animate-fade-in";

function variant(item: { color?: string | null; size?: string | null }) {
  return [item.color, item.size && `Size ${item.size}`].filter(Boolean).join(" · ");
}

function ItemList({ items }: { items: { key: string; name: string; image: string; quantity: number; price: number; unit?: string | null; color?: string | null; size?: string | null }[] }) {
  return (
    <ul className="divide-y divide-line">
      {items.map((item) => (
        <li key={item.key} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <span className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-sand">
            <Image src={item.image || PLACEHOLDER_IMAGE} alt="" fill sizes="48px" className="object-cover" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14px] text-ink">{item.name}</p>
            <p className="text-[12px] text-muted">
              {[variant(item), `${item.quantity} ${item.unit ?? "×"} ${formatPrice(item.price)}`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <p className="shrink-0 text-[14px] tabular-nums">{formatPrice(item.price * item.quantity)}</p>
        </li>
      ))}
    </ul>
  );
}

function Totals({ subtotal, shipping, total }: { subtotal: number; shipping: number; total: number }) {
  return (
    <dl className="space-y-2 text-[14px]">
      <div className="flex justify-between">
        <dt className="text-muted">Tạm tính</dt>
        <dd className="tabular-nums">{formatPrice(subtotal)}</dd>
      </div>
      <div className="flex justify-between">
        <dt className="text-muted">Phí giao hàng</dt>
        <dd className="tabular-nums">{shipping === 0 ? "Miễn phí" : formatPrice(shipping)}</dd>
      </div>
      <div className="flex items-baseline justify-between border-t border-line pt-3">
        <dt className="font-medium">Tổng thanh toán</dt>
        <dd className="font-serif text-[26px] tabular-nums">{formatPrice(total)}</dd>
      </div>
    </dl>
  );
}

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("border-t border-line px-6 py-5 sm:px-7", className)}>
      <h3 className="mb-3 text-[12px] font-medium uppercase tracking-[0.14em] text-muted">{title}</h3>
      {children}
    </section>
  );
}

function Recipient({
  name,
  phone,
  email,
  address,
  receiver,
  note,
}: {
  name: string;
  phone: string;
  email: string;
  address: string;
  receiver: { name: string; phone: string } | null;
  note: string;
}) {
  return (
    <div className="space-y-2 text-[14px] text-ink-soft">
      <p className="flex gap-2.5">
        <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span>
          <span className="font-medium text-ink">{receiver?.name ?? name}</span> · {receiver?.phone ?? phone}
          {receiver && <span className="block text-[12px] text-muted">Người đặt: {name} · {phone}</span>}
          <span className="block text-[12px] text-muted">{email}</span>
        </span>
      </p>
      <p className="flex gap-2.5">
        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
        <span>{address}</span>
      </p>
      {note && (
        <p className="flex gap-2.5">
          <StickyNote className="mt-0.5 h-4 w-4 shrink-0 text-muted" aria-hidden />
          <span className="whitespace-pre-line">{note}</span>
        </p>
      )}
    </div>
  );
}

// ───────────── Hộp xác nhận (kèm trạng thái đang gửi) ─────────────

export function ConfirmOrderDialog({
  draft,
  open,
  pending,
  onCancel,
  onConfirm,
}: {
  draft: OrderDraft | null;
  open: boolean;
  pending: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!draft) return null;
  const { form } = draft;
  // Đang gửi đơn: không cho đóng hộp thoại (Esc, bấm ra ngoài) để tránh hiểu nhầm là đã hủy
  const block = (e: Event) => pending && e.preventDefault();

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && !pending && onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content className={contentClass} onEscapeKeyDown={block} onPointerDownOutside={block} onInteractOutside={block} aria-busy={pending}>
          <div className="flex items-start justify-between gap-4 px-6 pb-4 pt-6 sm:px-7">
            <div>
              <Dialog.Title className="font-serif text-[26px] leading-tight">Xác nhận đặt hàng</Dialog.Title>
              <Dialog.Description className="mt-1 text-[13px] text-muted">Vui lòng kiểm tra lại thông tin trước khi gửi đơn.</Dialog.Description>
            </div>
            <Dialog.Close
              disabled={pending}
              className="-mr-2 flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink disabled:opacity-40"
              aria-label="Đóng"
            >
              <X className="h-5 w-5" aria-hidden />
            </Dialog.Close>
          </div>

          <div className="relative min-h-0 flex-1 overflow-y-auto">
            <Section title="Giao đến">
              <Recipient
                name={form.fullName}
                phone={form.phone}
                email={form.email}
                address={fullAddress(form)}
                receiver={form.otherReceiver ? { name: form.receiverName, phone: form.receiverPhone } : null}
                note={form.note}
              />
            </Section>
            <Section title={`Sản phẩm (${draft.count})`}>
              <ItemList items={draft.lines} />
            </Section>
            <Section title="Thanh toán">
              <Totals subtotal={draft.subtotal} shipping={draft.shipping} total={draft.total} />
              <p className="mt-3 flex items-center gap-2 rounded-lg bg-sand/70 px-3.5 py-2.5 text-[13px] text-ink-soft">
                <Banknote className="h-4 w-4 shrink-0" strokeWidth={1.6} aria-hidden />
                Thanh toán tiền mặt khi nhận hàng (COD) — không cần trả trước.
              </p>
            </Section>

            {/* Lớp phủ khi đang gửi đơn */}
            {pending && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-ivory/85 backdrop-blur-[1px]" role="status" aria-live="assertive">
                <LoaderCircle className="h-9 w-9 animate-spin text-ink" strokeWidth={1.6} aria-hidden />
                <p className="font-serif text-xl text-ink">Đang gửi đơn hàng…</p>
                <p className="text-[13px] text-muted">Vui lòng không đóng hoặc tải lại trang.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-line bg-white/60 px-6 py-4 sm:flex-row sm:px-7">
            <button type="button" onClick={onCancel} disabled={pending} className={buttonVariants({ variant: "ghost", className: "sm:flex-1" })}>
              Quay lại chỉnh sửa
            </button>
            <button type="button" onClick={onConfirm} disabled={pending} autoFocus className={buttonVariants({ className: "sm:flex-1" })}>
              {pending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> Đang đặt hàng…
                </>
              ) : (
                <>Xác nhận đặt hàng · {formatPrice(draft.total)}</>
              )}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ───────────── Hộp đặt hàng thành công ─────────────

export function OrderSuccessDialog({ order, open, onClose }: { order: PlacedOrder | null; open: boolean; onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  if (!order) return null;

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(order.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  return (
    <Dialog.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className={overlayClass} />
        <Dialog.Content className={contentClass}>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="relative px-6 pb-6 pt-8 text-center sm:px-7">
              <Dialog.Close
                className="absolute right-4 top-4 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-sand hover:text-ink"
                aria-label="Đóng"
              >
                <X className="h-5 w-5" aria-hidden />
              </Dialog.Close>
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 ring-8 ring-emerald-50/50">
                <CircleCheck className="h-9 w-9" strokeWidth={1.5} aria-hidden />
              </span>
              <Dialog.Title className="mt-5 font-serif text-[30px] leading-tight">Đặt hàng thành công</Dialog.Title>
              <Dialog.Description className="mx-auto mt-2 max-w-sm text-[14px] leading-relaxed text-ink-soft">
                Cảm ơn <span className="font-medium text-ink">{order.customerName}</span>! Đơn hàng của bạn đã được ghi nhận.
              </Dialog.Description>

              <div className="mx-auto mt-6 flex max-w-sm items-center justify-between gap-3 rounded-xl border border-line bg-white px-4 py-3 text-left">
                <div>
                  <p className="text-[12px] text-muted">Mã đơn hàng</p>
                  <p className="font-mono text-[18px] font-medium tracking-wide text-ink">{order.code}</p>
                  <p className="text-[12px] text-muted">{formatDateTime(order.createdAt)}</p>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  className="flex h-9 shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-line px-3 text-[13px] text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-700" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
                  {copied ? "Đã chép" : "Sao chép"}
                </button>
              </div>
            </div>

            {order.items.length > 0 && (
              <Section title={`Sản phẩm (${order.itemCount})`}>
                <ItemList items={order.items.map((it, i) => ({ ...it, key: String(i), price: it.unitPrice }))} />
              </Section>
            )}
            <Section title="Thanh toán">
              <Totals subtotal={order.subtotal} shipping={order.shippingFee} total={order.total} />
            </Section>
            <Section title="Giao đến">
              <Recipient name={order.customerName} phone={order.phone} email={order.email} address={order.address} receiver={order.receiver} note={order.note} />
            </Section>
            <Section title="Tiếp theo">
              <ol className="space-y-2.5 text-[14px] text-ink-soft">
                {[
                  <>
                    Nhân viên {siteConfig.name} sẽ gọi đến số <span className="font-medium text-ink">{order.phone}</span> để xác nhận đơn ({siteConfig.contact.workingHours}).
                  </>,
                  <>Đơn được đóng gói và giao trong 1–5 ngày tùy khu vực.</>,
                  <>
                    Kiểm tra hàng rồi thanh toán <span className="font-medium text-ink">{formatPrice(order.total)}</span> tiền mặt cho nhân viên giao hàng.
                  </>,
                ].map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink text-[12px] font-medium text-ivory">{i + 1}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
              <p className="mt-4 text-[13px] text-muted">
                Cần hỗ trợ? Gọi hotline{" "}
                <a href={siteConfig.contact.hotlineHref} className="font-medium text-ink underline-offset-4 hover:underline">
                  {siteConfig.contact.hotline}
                </a>{" "}
                và đọc mã đơn hàng.
              </p>
            </Section>
          </div>

          <div className="flex flex-col-reverse gap-2.5 border-t border-line bg-white/60 px-6 py-4 sm:flex-row sm:px-7">
            <Link href="/" onClick={onClose} className={buttonVariants({ variant: "ghost", className: "sm:flex-1" })}>
              Về trang chủ
            </Link>
            <Link href="/san-pham" onClick={onClose} className={buttonVariants({ className: "sm:flex-1" })}>
              Tiếp tục mua sắm
            </Link>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
