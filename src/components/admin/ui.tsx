import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ORDER_STATUS_LABEL, type OrderStatus } from "@/data/types";
import { cn } from "@/lib/utils";

/** Các thành phần giao diện dùng chung trong trang quản trị (server-safe). */

export const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-[14px] text-ink outline-none transition-colors placeholder:text-muted/70 hover:border-ink/30 focus:border-ink aria-[invalid=true]:border-brand-600";

export const textareaClass =
  "w-full rounded-lg border border-line bg-white px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none transition-colors placeholder:text-muted/70 hover:border-ink/30 focus:border-ink";

export const labelClass = "mb-1.5 block text-[13px] font-medium text-ink-soft";

export function PageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted transition-colors hover:text-ink">
            <ChevronLeft className="h-4 w-4" aria-hidden />
            {back.label}
          </Link>
        )}
        <h1 className="font-serif text-[32px] leading-tight text-ink">{title}</h1>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, actions, children, className }: { title?: string; actions?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border border-line bg-white", className)}>
      {(title || actions) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          {title && <h2 className="text-[15px] font-medium text-ink">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

const statusStyle: Record<OrderStatus, string> = {
  new: "bg-brand-50 text-brand-700 ring-brand-100",
  confirmed: "bg-sky-50 text-sky-800 ring-sky-100",
  shipping: "bg-amber-50 text-amber-800 ring-amber-100",
  completed: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  cancelled: "bg-sand text-muted ring-line",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset", statusStyle[status])}>
      {ORDER_STATUS_LABEL[status]}
    </span>
  );
}

export function Pill({ children, tone = "neutral" }: { children: React.ReactNode; tone?: "neutral" | "success" | "warning" | "danger" }) {
  const tones = {
    neutral: "bg-sand text-ink-soft ring-line",
    success: "bg-emerald-50 text-emerald-800 ring-emerald-100",
    warning: "bg-amber-50 text-amber-800 ring-amber-100",
    danger: "bg-brand-50 text-brand-700 ring-brand-100",
  };
  return <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[12px] font-medium ring-1 ring-inset", tones[tone])}>{children}</span>;
}

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-white px-6 py-16 text-center">
      <p className="font-serif text-xl text-ink">{title}</p>
      {description && <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

export function Notice({ tone = "success", children }: { tone?: "success" | "error" | "info"; children: React.ReactNode }) {
  const tones = {
    success: "border-emerald-600 bg-emerald-50 text-emerald-900",
    error: "border-brand-600 bg-brand-50 text-brand-700",
    info: "border-ink bg-sand/70 text-ink-soft",
  };
  return (
    <p role={tone === "error" ? "alert" : "status"} className={cn("mb-6 rounded-r-lg border-l-2 px-4 py-3 text-sm", tones[tone])}>
      {children}
    </p>
  );
}

/** Phân trang bằng link GET — giữ nguyên các tham số lọc khác. */
export function Pagination({ page, pages, href }: { page: number; pages: number; href: (page: number) => string }) {
  if (pages <= 1) return null;
  const btn = "flex h-9 min-w-9 items-center justify-center rounded-lg border border-line bg-white px-3 text-[13px] text-ink-soft transition-colors hover:border-ink hover:text-ink";
  return (
    <nav aria-label="Phân trang" className="mt-6 flex items-center justify-between gap-3">
      <p className="text-[13px] text-muted">
        Trang {page} / {pages}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={href(page - 1)} className={btn} aria-label="Trang trước">
            <ChevronLeft className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={cn(btn, "pointer-events-none opacity-40")} aria-hidden>
            <ChevronLeft className="h-4 w-4" />
          </span>
        )}
        {page < pages ? (
          <Link href={href(page + 1)} className={btn} aria-label="Trang sau">
            <ChevronRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : (
          <span className={cn(btn, "pointer-events-none opacity-40")} aria-hidden>
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </div>
    </nav>
  );
}

/** Lấy giá trị đầu tiên của một searchParam. */
export function param(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export function pageParam(value: string | string[] | undefined) {
  const n = Math.floor(Number(param(value)));
  return Number.isFinite(n) && n > 0 ? n : 1;
}
