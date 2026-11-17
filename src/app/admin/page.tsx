import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getDashboardStats, LOW_STOCK } from "@/lib/admin/queries";
import { imageKitConfigured } from "@/lib/imagekit";
import { formatDateTime, formatPrice, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, PageHeader, StatusBadge } from "@/components/admin/ui";
import { SubmitButton } from "@/components/admin/form-controls";
import { cleanupImages } from "./actions";

export const metadata: Metadata = { title: "Tổng quan" };

function Stat({ label, value, hint, href, highlight }: { label: string; value: string; hint?: string; href?: string; highlight?: boolean }) {
  const body = (
    <>
      <p className="text-[13px] text-muted">{label}</p>
      <p className={`mt-2 font-serif text-[30px] leading-none ${highlight ? "text-brand-600" : "text-ink"}`}>{value}</p>
      {hint && <p className="mt-2 text-[12px] text-muted">{hint}</p>}
    </>
  );
  const cls = "block rounded-xl border border-line bg-white p-5 transition-colors";
  return href ? (
    <Link href={href} className={`${cls} hover:border-ink/40`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

export default async function AdminDashboard() {
  await requireAdmin();
  const s = await getDashboardStats();

  return (
    <>
      <PageHeader
        title="Tổng quan"
        description="Tình hình cửa hàng hôm nay."
        actions={
          <Link href="/admin/san-pham/moi" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" aria-hidden /> Thêm sản phẩm
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Đơn mới chờ xác nhận" value={String(s.newOrders)} href="/admin/don-hang?status=new" highlight={s.newOrders > 0} hint="Gọi điện xác nhận với khách" />
        <Stat label="Đơn đang xử lý / giao" value={String(s.processingOrders)} href="/admin/don-hang?status=shipping" hint={`Giá trị ${formatPrice(s.pendingRevenue)}`} />
        <Stat label="Doanh thu tháng này" value={formatPrice(s.monthRevenue)} hint="Tính trên đơn đã hoàn thành" />
        <Stat label="Đơn hôm nay" value={String(s.todayOrders)} href="/admin/don-hang" hint={`${s.customers} khách đã từng đặt`} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card
          title="Đơn hàng mới nhất"
          actions={
            <Link href="/admin/don-hang" className="inline-flex items-center gap-1 text-[13px] text-ink-soft hover:text-ink">
              Tất cả <ArrowRight className="h-3.5 w-3.5" aria-hidden />
            </Link>
          }
        >
          {s.recentOrders.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Chưa có đơn hàng nào. Đơn khách đặt trên website sẽ hiện ở đây.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {s.recentOrders.map((o) => (
                <li key={o.id}>
                  <Link href={`/admin/don-hang/${o.id}`} className="-mx-2 flex items-center gap-4 rounded-lg px-2 py-3 transition-colors hover:bg-sand/50">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[14px] font-medium text-ink">
                        {o.customerName} <span className="font-normal text-muted">· {o.phone}</span>
                      </p>
                      <p className="mt-0.5 text-[12px] text-muted">
                        {o.code} · {o.itemCount} sản phẩm · {formatDateTime(o.createdAt)}
                      </p>
                    </div>
                    <span className="hidden text-[14px] tabular-nums sm:block">{formatPrice(o.total)}</span>
                    <StatusBadge status={o.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-6">
          <Card title={`Sắp hết hàng (≤ ${LOW_STOCK})`}>
            {s.lowStock.length === 0 ? (
              <p className="text-sm text-muted">Tất cả sản phẩm còn đủ hàng.</p>
            ) : (
              <ul className="-my-1.5 divide-y divide-line">
                {s.lowStock.map((p) => (
                  <li key={p.id}>
                    <Link href={`/admin/san-pham/${p.id}`} className="flex items-center gap-3 py-2.5 hover:text-brand-600">
                      <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-md bg-sand">
                        <Image src={p.image || PLACEHOLDER_IMAGE} alt="" fill sizes="40px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14px]">{p.name}</span>
                      <span className={`text-[13px] tabular-nums ${p.stock === 0 ? "text-brand-600" : "text-amber-700"}`}>
                        {p.stock === 0 ? "Hết" : `Còn ${p.stock}`}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="Cửa hàng">
            <dl className="space-y-2.5 text-[14px]">
              <div className="flex justify-between">
                <dt className="text-muted">Sản phẩm đang bán</dt>
                <dd>
                  {s.publishedProducts} / {s.totalProducts}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Danh mục</dt>
                <dd>{s.categories}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Lưu ảnh (ImageKit)</dt>
                <dd className={imageKitConfigured() ? "text-emerald-700" : "text-brand-600"}>{imageKitConfigured() ? "Đã kết nối" : "Chưa cấu hình"}</dd>
              </div>
            </dl>
            <form action={cleanupImages} className="mt-5 border-t border-line pt-4">
              <p className="text-[12px] leading-relaxed text-muted">
                Xóa trên ImageKit những ảnh đã tải lên nhưng không sản phẩm / danh mục nào dùng (giải phóng dung lượng).
              </p>
              <SubmitButton variant="outline" pendingText="Đang dọn…" className="mt-3" confirmMessage="Xóa vĩnh viễn các ảnh không dùng trên ImageKit?">
                Dọn ảnh không dùng
              </SubmitButton>
            </form>
          </Card>
        </div>
      </div>
    </>
  );
}
