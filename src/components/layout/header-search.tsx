"use client";

import { useEffect, useId, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, Search } from "lucide-react";
import { hotKeywords } from "@/config/site";
import type { SearchSuggestion } from "@/app/api/search/route";
import { cn, formatPrice } from "@/lib/utils";

const DEBOUNCE_MS = 250;
const MIN_CHARS = 2;

/** Kết quả đã tải trong phiên — gõ lại từ cũ hiện ngay, không gọi API lần nữa. */
const cache = new Map<string, SearchSuggestion[]>();

type Status = "idle" | "loading" | "done" | "error";

/**
 * Thanh tìm kiếm giữa header.
 * - Ô trống: hiện "Tìm kiếm phổ biến" + danh mục.
 * - Đang gõ (≥ 2 ký tự): sau 250ms ngừng gõ (debounce) gọi /api/search, hiện 5 sản phẩm có tên giống / gần giống nhất.
 * - Enter: tới trang kết quả /san-pham?q= (form GET thuần — vẫn chạy khi chưa tải JS); ↑ ↓ để chọn gợi ý.
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  // Kết quả lần tải gần nhất — giữ hiển thị (mờ) trong lúc chờ kết quả của từ khóa mới
  const [last, setLast] = useState<SearchSuggestion[]>([]);
  const [errorKey, setErrorKey] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const term = query.trim();
  const key = term.toLowerCase();
  const searching = term.length >= MIN_CHARS;
  const cached = searching ? cache.get(key) : undefined;
  const status: Status = !searching ? "idle" : cached ? "done" : errorKey === key ? "error" : "loading";
  const results = cached ?? last;

  useEffect(() => {
    if (!searching || cache.has(key)) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(term)}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((data: { products: SearchSuggestion[] }) => {
          cache.set(key, data.products);
          setLast(data.products);
        })
        .catch((error: unknown) => {
          if ((error as Error).name !== "AbortError") setErrorKey(key);
        });
    }, DEBOUNCE_MS);
    // Gõ tiếp trước khi hết 250ms → hủy hẹn giờ; request đang chạy của từ khóa cũ cũng bị hủy
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, term, searching]);

  const close = () => {
    setOpen(false);
    setActive(-1);
  };

  const showResults = searching && status === "done" && results.length > 0;
  const activeId = showResults && active >= 0 ? `${listId}-${active}` : undefined;
  const allResultsHref = `/san-pham?q=${encodeURIComponent(term)}`;

  return (
    <div
      className={cn("relative w-full", className)}
      onFocus={() => setOpen(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) close();
      }}
    >
      <form action="/san-pham" role="search" className="relative" onSubmit={close}>
        <label htmlFor={inputId} className="sr-only">
          Tìm kiếm sản phẩm
        </label>
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          value={query}
          maxLength={100}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              close();
              inputRef.current?.blur();
            } else if (showResults && e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => (i + 1) % results.length);
            } else if (showResults && e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
            } else if (e.key === "Enter" && showResults && active >= 0) {
              e.preventDefault();
              close();
              router.push(`/san-pham/${results[active].slug}`);
            }
          }}
          role="combobox"
          aria-expanded={open && showResults}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={activeId}
          placeholder={placeholder}
          className="h-12 w-full rounded-full border border-line bg-white pl-5 pr-14 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/80 hover:border-ink/40 focus:border-ink [&::-webkit-search-cancel-button]:hidden"
        />
        <button
          type="submit"
          aria-label="Tìm kiếm"
          className="absolute right-1.5 top-1.5 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-ink text-ivory transition-colors hover:bg-brand-600"
        >
          {searching && status === "loading" ? (
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
          ) : (
            <Search className="h-4 w-4" strokeWidth={2} aria-hidden />
          )}
        </button>
      </form>

      <div
        className={cn(
          "absolute inset-x-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-white shadow-[0_20px_40px_-20px_rgb(0_0_0/0.25)] transition-all duration-200",
          open ? "visible translate-y-0 opacity-100" : "invisible -translate-y-1 opacity-0",
        )}
      >
        {searching ? (
          <div>
            <p className="px-5 pb-1 pt-4 text-[12px] tracking-wide text-muted" aria-live="polite">
              {status === "loading" && results.length === 0 && "Đang tìm…"}
              {status === "error" && "Không tải được gợi ý — nhấn Enter để xem kết quả."}
              {status === "done" && (results.length > 0 ? "Sản phẩm gợi ý" : `Không tìm thấy sản phẩm nào cho “${term}”`)}
            </p>

            {results.length > 0 && status !== "error" && (
              <ul id={listId} role="listbox" aria-label="Sản phẩm gợi ý" className={cn("px-2 pb-1 transition-opacity", status === "loading" && "opacity-50")}>
                {results.map((p, i) => (
                  <li key={p.slug} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                    <Link
                      href={`/san-pham/${p.slug}`}
                      onClick={close}
                      onMouseEnter={() => setActive(i)}
                      tabIndex={-1}
                      className={cn("flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-colors", i === active ? "bg-sand/70" : "hover:bg-sand/50")}
                    >
                      <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-sand">
                        <Image src={p.image} alt="" fill sizes="48px" className="object-cover" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-ink">{p.name}</span>
                        {p.categoryName && <span className="block truncate text-[12px] text-muted">{p.categoryName}</span>}
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-[14px] font-medium tabular-nums text-ink">
                          {formatPrice(p.price)}
                          {p.unit && <span className="font-normal text-muted">/{p.unit}</span>}
                        </span>
                        {p.originalPrice && p.originalPrice > p.price && (
                          <span className="block text-[12px] tabular-nums text-muted line-through">{formatPrice(p.originalPrice)}</span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}

            <Link
              href={allResultsHref}
              onClick={close}
              className="group flex items-center justify-between border-t border-line px-5 py-3.5 text-[13px] text-ink-soft transition-colors hover:bg-sand/40 hover:text-ink"
            >
              <span>
                Xem tất cả kết quả cho <span className="font-medium text-ink">“{term}”</span>
              </span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden />
            </Link>
          </div>
        ) : (
          <div className="p-5">
            <p className="text-[12px] tracking-wide text-muted">Tìm kiếm phổ biến</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {hotKeywords.map((kw) => (
                <li key={kw}>
                  <Link
                    href={`/san-pham?q=${encodeURIComponent(kw)}`}
                    onClick={close}
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
                  <Link href={`/danh-muc/${c.slug}`} onClick={close} className="block py-1 text-sm text-ink-soft hover:text-ink">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
