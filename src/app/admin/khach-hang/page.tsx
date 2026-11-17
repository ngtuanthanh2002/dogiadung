import Link from "next/link";
import type { Metadata } from "next";
import { Search } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listCustomers } from "@/lib/admin/queries";
import { cn, formatDateTime, formatPrice } from "@/lib/utils";
import { EmptyState, inputClass, PageHeader, Pagination, pageParam, param, Pill } from "@/components/admin/ui";

export const metadata: Metadata = { title: "Khách hàng" };

export default async function CustomersPage({ searchParams }: PageProps<"/admin/khach-hang">) {
  await requireAdmin();
  const sp = await searchParams;
  const q = param(sp.q)?.trim().slice(0, 100) || undefined;
  const page = pageParam(sp.page);
  const { customers, total, pages } = await listCustomers({ q, page });

  const href = (p: number) => {
    const s = new URLSearchParams();
    if (q) s.set("q", q);
    if (p > 1) s.set("page", String(p));
    return s.size ? `/admin/khach-hang?${s}` : "/admin/khach-hang";
  };

  return (
    <>
      <PageHeader
        title="Khách hàng"
        description="Những người đã đặt hàng, gom theo số điện thoại. Website không có tài khoản khách — mỗi lần đặt hàng thông tin được lưu tự động."
      />

      <form action="/admin/khach-hang" method="get" className="relative mb-5 w-full sm:w-80" role="search">
        <label htmlFor="customer-q" className="sr-only">
          Tìm khách hàng
        </label>
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden />
        <input id="customer-q" name="q" defaultValue={q} placeholder="Tên, số điện thoại, email…" className={cn(inputClass, "pl-10")} />
      </form>

      {customers.length === 0 ? (
        <EmptyState title={q ? "Không tìm thấy khách hàng" : "Chưa có khách hàng"} description={q ? undefined : "Khách hàng sẽ xuất hiện sau đơn đặt hàng đầu tiên."} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-line bg-white">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[14px]">
              <thead className="border-b border-line bg-sand/40 text-[12px] uppercase tracking-wider text-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Khách hàng</th>
                  <th className="px-5 py-3 font-medium">Liên hệ</th>
                  <th className="px-5 py-3 text-center font-medium">Số đơn</th>
                  <th className="px-5 py-3 text-right font-medium">Đã mua</th>
                  <th className="px-5 py-3 font-medium">Đơn gần nhất</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {customers.map((c) => (
                  <tr key={c.phone} className="relative transition-colors hover:bg-sand/40">
                    <td className="px-5 py-3.5">
                      <Link href={`/admin/don-hang?q=${encodeURIComponent(c.phone)}`} className="font-medium text-ink after:absolute after:inset-0">
                        {c.name}
                      </Link>
                      <p className="text-[12px] text-muted">{c.province}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <p>{c.phone}</p>
                      <p className="max-w-56 truncate text-[12px] text-muted">{c.email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="tabular-nums">{c.orders}</span>
                      {c.cancelledOrders > 0 && (
                        <span className="ml-2">
                          <Pill tone={c.cancelledOrders >= 2 ? "danger" : "warning"}>{c.cancelledOrders} hủy</Pill>
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right tabular-nums">
                      {formatPrice(c.spent)}
                      <p className="text-[12px] text-muted">{c.completedOrders} đơn hoàn thành</p>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-[13px] text-muted">{formatDateTime(c.lastOrderAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      <p className="mt-4 text-[13px] text-muted">{total} khách hàng · bấm vào một khách để xem các đơn của họ</p>
      <Pagination page={page} pages={pages} href={href} />
    </>
  );
}
