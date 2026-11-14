"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";

/** Ô chọn sắp xếp — URL của từng lựa chọn được tính sẵn ở server (giữ nguyên các bộ lọc khác). */
export function SortSelect({ value, options }: { value: string; options: { value: string; label: string; href: string }[] }) {
  const router = useRouter();
  return (
    <label className="flex items-center gap-2 text-[13px] text-muted">
      <span className="hidden sm:inline">Sắp xếp</span>
      <span className="relative">
        <select
          value={value}
          aria-label="Sắp xếp sản phẩm"
          onChange={(e) => {
            const opt = options.find((o) => o.value === e.target.value);
            if (opt) router.push(opt.href, { scroll: false });
          }}
          className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-white pl-4 pr-9 text-[13px] text-ink outline-none transition-colors hover:border-ink focus-visible:border-ink"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink" aria-hidden />
      </span>
    </label>
  );
}
