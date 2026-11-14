import Link from "next/link";
import { siteConfig } from "@/config/site";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={cn("h-9 w-9", className)} aria-hidden>
      <rect width="40" height="40" rx="20" fill="#b8281f" />
      <path d="M10 20 20 11.5 30 20" fill="none" stroke="#faf8f5" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 19.5v9.5h4.5a4.75 4.75 0 0 0 0-9.5H15Z" fill="none" stroke="#faf8f5" strokeWidth="2.4" strokeLinejoin="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("flex shrink-0 items-center gap-2.5 transition-opacity duration-300 hover:opacity-80", className)} aria-label={`${siteConfig.name} — Trang chủ`}>
      <LogoMark />
      <span className="font-serif text-[22px] font-medium tracking-tight text-ink">Đại Kiều</span>
    </Link>
  );
}
