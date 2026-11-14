"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { UserRound } from "lucide-react";

/** Nút tài khoản trên header: ảnh đại diện khi đã đăng nhập, biểu tượng người dùng khi chưa. */
export function AccountButton() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const signedIn = status === "authenticated" && !!user;

  return (
    <Link
      href={signedIn ? "/tai-khoan" : "/dang-nhap"}
      aria-label={signedIn ? `Tài khoản của ${user?.name ?? "bạn"}` : "Đăng nhập"}
      title={signedIn ? (user?.name ?? "Tài khoản") : "Đăng nhập"}
      className="group flex h-10 items-center gap-2 rounded-full pl-2 pr-2 text-ink transition-colors hover:bg-sand lg:pr-3"
    >
      {signedIn && user?.image ? (
        <Image
          src={user.image}
          alt=""
          width={28}
          height={28}
          className="h-7 w-7 rounded-full object-cover ring-1 ring-line transition group-hover:ring-ink"
        />
      ) : (
        <UserRound className="h-[19px] w-[19px]" strokeWidth={1.6} aria-hidden />
      )}
      <span className="hidden max-w-[110px] truncate text-[13px] lg:inline">
        {signedIn ? (user?.name?.split(" ").slice(-1)[0] ?? "Tài khoản") : "Đăng nhập"}
      </span>
    </Link>
  );
}
