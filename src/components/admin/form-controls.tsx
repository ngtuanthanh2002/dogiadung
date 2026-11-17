"use client";

import { useFormStatus } from "react-dom";
import { LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Nút submit tự hiện trạng thái "đang xử lý" của form cha. */
export function SubmitButton({
  children,
  pendingText = "Đang lưu…",
  variant = "primary",
  size = "sm",
  className,
  confirmMessage,
  name,
  value,
}: {
  children: React.ReactNode;
  pendingText?: string;
  variant?: "primary" | "outline" | "ghost";
  size?: "sm" | "md";
  className?: string;
  /** Hỏi xác nhận trước khi gửi (ví dụ thao tác xóa). */
  confirmMessage?: string;
  name?: string;
  value?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      onClick={(e) => {
        if (confirmMessage && !window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={buttonVariants({ variant, size, className })}
    >
      {pending && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />}
      {pending ? pendingText : children}
    </button>
  );
}

/** Nút xóa nhỏ (biểu tượng / chữ) dùng trong bảng — có hỏi xác nhận. */
export function DangerButton({ children, confirmMessage, className }: { children: React.ReactNode; confirmMessage: string; className?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      onClick={(e) => {
        if (!window.confirm(confirmMessage)) e.preventDefault();
      }}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 text-[13px] text-muted transition-colors hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50",
        className,
      )}
    >
      {pending ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden /> : children}
    </button>
  );
}
