"use client";

import { SessionProvider } from "next-auth/react";

/** Cung cấp phiên đăng nhập cho các Client Component (useSession) — trang vẫn được prerender tĩnh. */
export function AuthSessionProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider refetchOnWindowFocus={false}>{children}</SessionProvider>;
}
