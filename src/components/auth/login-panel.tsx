"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getProviders, signIn, useSession } from "next-auth/react";
import { LoaderCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { GoogleIcon } from "./google-icon";

const errorMessages: Record<string, string> = {
  Configuration: "Đăng nhập Google chưa được cấu hình trên máy chủ. Vui lòng thử lại sau.",
  AccessDenied: "Bạn đã từ chối cấp quyền truy cập tài khoản Google.",
  Verification: "Liên kết đăng nhập đã hết hạn. Vui lòng thử lại.",
};

/** Chỉ cho phép chuyển hướng về đường dẫn nội bộ (tránh open redirect). */
function safeCallback(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/tai-khoan";
}

export function LoginPanel() {
  const { data: session, status } = useSession();
  const params = useSearchParams();
  const [pending, setPending] = useState(false);
  // null = đang kiểm tra; false = máy chủ chưa cấu hình Google OAuth
  const [googleReady, setGoogleReady] = useState<boolean | null>(null);

  useEffect(() => {
    getProviders()
      .then((p) => setGoogleReady(!!p?.google))
      .catch(() => setGoogleReady(false));
  }, []);
  const error = params.get("error");
  const callbackUrl = safeCallback(params.get("callbackUrl"));

  if (status === "authenticated" && session?.user) {
    return (
      <div className="text-center">
        <p className="text-muted">Bạn đang đăng nhập với</p>
        <p className="mt-1 font-medium text-ink">{session.user.email}</p>
        <div className="mt-8 flex flex-col gap-3">
          <Link href="/tai-khoan" className={buttonVariants({ size: "lg", className: "w-full" })}>
            Tài khoản của tôi
          </Link>
          <Link href="/san-pham" className={buttonVariants({ variant: "outline", size: "lg", className: "w-full" })}>
            Tiếp tục mua sắm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {googleReady === false && (
        <p role="status" className="mb-6 border-l-2 border-ink bg-sand/70 px-4 py-3 text-sm text-ink-soft">
          Đăng nhập Google chưa được bật trên máy chủ. Quản trị viên cần cấu hình <code className="text-[13px]">AUTH_GOOGLE_ID</code> và{" "}
          <code className="text-[13px]">AUTH_GOOGLE_SECRET</code>.
        </p>
      )}
      {error && googleReady !== false && (
        <p role="alert" className="mb-6 border-l-2 border-brand-600 bg-brand-50 px-4 py-3 text-sm text-brand-700">
          {errorMessages[error] ?? "Đăng nhập không thành công. Vui lòng thử lại."}
        </p>
      )}
      <button
        type="button"
        disabled={pending || status === "loading" || googleReady !== true}
        onClick={() => {
          setPending(true);
          signIn("google", { callbackUrl }).catch(() => setPending(false));
        }}
        className="group flex h-14 w-full cursor-pointer items-center justify-center gap-3 rounded-full border border-line bg-white text-[15px] font-medium text-ink shadow-sm transition-all duration-300 hover:border-ink hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:border-line disabled:hover:shadow-sm"
      >
        {pending ? (
          <LoaderCircle className="h-5 w-5 animate-spin text-muted" aria-hidden />
        ) : (
          <GoogleIcon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
        )}
        {pending ? "Đang chuyển tới Google…" : "Tiếp tục với Google"}
      </button>
      <p className="mt-6 text-center text-[13px] leading-relaxed text-muted">
        Bằng việc đăng nhập, bạn đồng ý với{" "}
        <Link href="/chinh-sach/dieu-khoan-su-dung" className="text-ink underline underline-offset-2 hover:text-brand-600">
          Điều khoản sử dụng
        </Link>{" "}
        và{" "}
        <Link href="/chinh-sach/chinh-sach-bao-mat" className="text-ink underline underline-offset-2 hover:text-brand-600">
          Chính sách bảo mật
        </Link>
        .
      </p>
    </div>
  );
}
