import "server-only";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/auth";

/**
 * Bắt buộc gọi ở ĐẦU mọi trang và Server Action của admin.
 * (Proxy chỉ kiểm tra có cookie hay không — không đủ để bảo vệ dữ liệu.)
 */
export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/dang-nhap?callbackUrl=/admin");
  return session;
}
