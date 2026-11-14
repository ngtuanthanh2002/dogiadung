"use client";

import { useId, useRef, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { hotKeywords } from "@/config/site";
import { cn } from "@/lib/utils";

/**
 * Thanh tìm kiếm luôn hiển thị giữa header. Khi focus sẽ hiện "Tìm kiếm phổ biến"
 * (như site gốc). Form GET thuần tới /san-pham?q= — vẫn hoạt động khi chưa tải JS.
 */
export function HeaderSearch({
  className,
  categories,
  placeholder = "Tìm sản phẩm: nồi gang, quạt, váy, vải linen…",
}: {
  className?: string;
  categories: { slug: string; name: string }[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const inputId = useId();
  const panelId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn("relative w-full", className)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setOpen(false);
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          inputRef.current?.blur();
        }
      }}
    >
      <form action="/san-pham" role="search" className="relative" onSubmit={() => setOpen(false)}>
        <label htmlFor={inputId} className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          placeholder={placeholder}
          className="h-12 w-full rounded-full border border-line bg-white pl-5 pr-14 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/80 hover:border-ink/40 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute right-1.5 top-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-brand-600"
        >
          <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
        </button>
      </form>

      <div
        id={panelId}
        className={cn(
          "absolute inset-x-0 top-full z-50 mt-2 rounded-2xl border border-line bg-white p-5 shadow-[0_20px_40px_-20px_rgb(0_0_0/0.25)] transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        <p className="text-[12px] tracking-wide text-muted">Tìm kiếm phổ biến</p>
        <ul className="mt-3 flex flex-wrap gap-2">
          {hotKeywords.map((kw) => (
            <li key={kw}>
              <Link
                href={`/san-pham?q=${encodeURIComponent(kw)}`}
                onClick={() => setOpen(false)}
                className="inline-block rounded-full bg-sand/70 px-3.5 py-1.5 text-[13px] text-ink-soft transition-colors hover:bg-ink hover:text-ivory"
              >
                {kw}
              </Link>
            </li>
          ))}
        </ul>
        <p className="mt-5 text-[12px] tracking-wide text-muted">Danh mục</p>
        <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
          {categories.map((c) => (
            <li key={c.slug}>
              <Link href={`/danh-muc/${c.slug}`} onClick={() => setOpen(false)} className="block py-1 text-sm text-ink-soft hover:text-ink">
                {c.name}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
