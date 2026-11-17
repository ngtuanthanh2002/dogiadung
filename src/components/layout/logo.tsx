import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

/** Biểu tượng thương hiệu: mái nhà + chữ "P" (Phú Ngọ). Giữ đồng bộ với app/icon.svg và app/apple-icon.png. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <rect width="40" height="40" rx="20" fill="#b8281f" />
      <path d="M10 20 20 11.5 30 20" fill="none" stroke="#faf8f5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16 29.5V19.5h4.25a3.25 3.25 0 0 1 0 6.5H16" fill="none" stroke="#faf8f5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5 transition-opacity duration-300 hover:opacity-80", className)} aria-label={`${siteConfig.name} — Trang chủ`}>
      <LogoMark />
      <span className="font-serif text-[22px] font-medium tracking-tight text-ink">{siteConfig.name}</span>
    </Link>
  );
}
