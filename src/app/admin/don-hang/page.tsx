import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from "@/data/types";
import { requireAdmin } from "@/lib/admin/auth";
import { listOrders } from "@/lib/admin/queries";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";
import { EmptyState, inputClass, Notice, PageHeader, Pagination, pageParam, param, StatusBadge } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Đơn hàng" };

function buildHref(params: { status?: string; q?: string; page?: number }) {
  const sp = new URLSearchParams();
  if (params.status) sp.set("status", params.status);
  if (params.q) sp.set("q", params.q);
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return qs ? `/admin/don-hang?${qs}` : "/admin/don-hang";
}

export default async function OrdersPage({ searchParams }: PageProps<"/admin/don-hang">) {
  await requireAdmin();
  const sp = await searchParams;
  const rawStatus = param(sp.status);
  const status = ORDER_STATUSES.includes(rawStatus as OrderStatus) ? (rawStatus as OrderStatus) : undefined;
  const q = param(sp.q)?.trim().slice(0, 100) || undefined;
  const page = pageParam(sp.page);

  const { orders, total, pages, counts } = await listOrders({ status, q, page });
  const all = Object.values(counts).reduce((a, b) => a + (b ?? 0), 0);

  const tabs: { value?: OrderStatus; label: string; count: number }[] = [
    { label: "Tất cả", count: all },
    ...ORDER_STATUSES.map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s], count: counts[s] ?? 0 })),
  ];

  return (
    <>
      <PageHeader title="Đơn hàng" description="Khách đặt hàng trên website (thanh toán khi nhận hàng) — không cần tài khoản." />
      {param(sp.deleted) && <Notice>Đã xóa đơn hàng.</Notice>}

      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Lọc theo trạng thái" className="scrollbar-none -mx-1 flex gap-1 overflow-x-auto px-1">
          {tabs.map((t) => {
            const active = t.value === status;
            return (
              <Link
                key={t.label}
                href={buildHref({ status: t.value, q })}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-9 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-[13px] transition-colors",
                  active ? "bg-ink text-ivory" : "bg-white text-ink-soft ring-1 ring-line hover:text-ink",
                )}
              >
                {t.label}
                <span className={cn("tabular-nums", active ? "text-ivory/70" : "text-muted")}>{t.count}</span>
              </Link>
            );
          })}
        </nav>

        <form action="/admin/don-hang" method="get" className="relative w-full sm:w-72" role="search">
          {status && <input type="hidden" name="status" value={status} />}
          <label htmlFor="order-q" className="sr-only">
            Tìm đơn hàng
          </label>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
          <input id="order-q" name="q" defaultValue={q} placeholder="Mã đơn, SĐT, tên, email…" className={cn(inputClass, "pl-10")} />
        </form>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title={q || status ? "Không có đơn phù hợp" : "Chưa có đơn hàng"}
          description={q || status ? "Thử bỏ bộ lọc hoặc tìm với từ khóa khác." : "Khi khách đặt hàng trên website, đơn sẽ xuất hiện tại đây."}
        />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead className="border-b border-line bg-sand/40 text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Mã đơn</th>
                  <th className="px-5 py-3 font-medium">Khách hàng</th>
                  <th className="px-5 py-3 font-medium">Giao đến</th>
                  <th className="px-5 py-3 text-right font-medium">Tổng tiền</th>
                  <th className="px-5 py-3 font-medium">Trạng thái</th>
                  <th className="px-5 py-3 font-medium">Thời gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {orders.map((o) => (
                  <tr key={o.id} className="group relative transition-colors hover:bg-sand/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/don-hang/${o.id}`} className="font-medium text-ink after:absolute after:inset-0">
                        {o.code}
                      </Link>
                      <p className="text-[12px] text-muted">{o.itemCount} sản phẩm</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-ink">{o.customerName}</p>
                      <p className="text-[12px] text-muted">{o.phone}</p>
                    </td>
                    <td className="max-w-56 px-5 py-3.5">
                      <p className="truncate text-ink-soft">{o.province}</p>
                      <p className="truncate text-[12px] text-muted">{o.ward}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">{formatPrice(o.total)}</td>
                    <td className="px-5 py-3.5">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-muted">{formatDateTime(o.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <p className="mt-4 text-[13px] text-muted">{total} đơn</p>
      <Pagination page={page} pages={pages} href={(p) => buildHref({ status, q, page: p })} />
    </>
  );
}
