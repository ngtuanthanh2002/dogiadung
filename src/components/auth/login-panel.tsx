"use client";

import { startTransition, useActionState, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, LoaderCircle } from "lucide-react";
import { login, type LoginState } from "@/app/dang-nhap/actions";
import { buttonVariants } from "@/components/ui/button";

const STORAGE_KEY = "phungo-admin-login";

const inputClass =
  "h-11 w-full rounded-lg border border-line bg-white px-3.5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 hover:border-ink/30 focus:border-ink";

const initialState: LoginState = {};

/**
 * Form đăng nhập quản trị — thành công sẽ chuyển tới /admin.
 * "Ghi nhớ đăng nhập" (mặc định bật): lưu TÊN ĐĂNG NHẬP vào localStorage để lần sau điền sẵn và giữ phiên 30 ngày.
 * Mật khẩu KHÔNG lưu vào localStorage (mọi script trên trang đều đọc được) — để trình quản lý mật khẩu
 * của trình duyệt lưu (autocomplete="current-password").
 */
export function LoginPanel() {
  const params = useSearchParams();
  const [state, dispatch, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const rememberRef = useRef<HTMLInputElement>(null);

  // Điền sẵn tên đăng nhập đã ghi nhớ
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as { username?: string } | null;
      if (saved?.username && usernameRef.current && !usernameRef.current.value) {
        usernameRef.current.value = saved.username;
        passwordRef.current?.focus();
        return;
      }
    } catch {
      // localStorage bị chặn / dữ liệu hỏng — bỏ qua
    }
    usernameRef.current?.focus();
  }, []);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        // Không dùng <form action> để React không xóa trắng form khi sai mật khẩu
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        try {
          if (rememberRef.current?.checked) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ username: String(fd.get("username") ?? "").trim() }));
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch {}
        startTransition(() => dispatch(fd));
      }}
      className="space-y-5"
    >
      <input type="hidden" name="callbackUrl" value={params.get("callbackUrl") ?? "/admin"} />

      {state.error && (
        <p role="alert" className="rounded-lg border border-brand-100 bg-brand-50 px-3.5 py-2.5 text-[13px] text-brand-700">
          {state.error}
        </p>
      )}

      <div>
        <label htmlFor="username" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          Tên đăng nhập
        </label>
        <input ref={usernameRef} id="username" name="username" autoComplete="username" autoCapitalize="none" spellCheck={false} required className={inputClass} />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-[13px] font-medium text-ink-soft">
          Mật khẩu
        </label>
        <div className="relative">
          <input
            ref={passwordRef}
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            aria-pressed={showPassword}
            className="absolute right-1 top-1 flex h-9 w-9 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-sand hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
          </button>
        </div>
      </div>

      <label className="flex w-fit cursor-pointer items-center gap-2.5 text-[14px] text-ink-soft select-none">
        <input ref={rememberRef} type="checkbox" name="remember" defaultChecked className="h-4 w-4 cursor-pointer accent-ink" />
        Ghi nhớ đăng nhập
      </label>

      <button type="submit" disabled={pending} className={buttonVariants({ size: "md", className: "w-full" })}>
        {pending ? (
          <>
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            Đang đăng nhập…
          </>
        ) : (
          "Đăng nhập"
        )}
      </button>
    </form>
  );
}
