"use server";

import { setTimeout as sleep } from "node:timers/promises";
import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export type LoginState = { error?: string };

/** Chỉ cho phép quay về trang trong khu vực quản trị (tránh open redirect). */
function safeAdminPath(value: FormDataEntryValue | null) {
  return typeof value === "string" && /^\/admin(\/[\w\-/]*)?$/.test(value) ? value : "/admin";
}

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").slice(0, 100);
  const password = String(formData.get("password") ?? "").slice(0, 200);
  const remember = formData.get("remember") === "on";
  if (!username || !password) return { error: "Vui lòng nhập tên đăng nhập và mật khẩu." };

  try {
    // Thành công: signIn ném lỗi điều hướng (redirect) tới trang admin — để nó đi tiếp
    await signIn("credentials", {
      username,
      password,
      remember: String(remember),
      redirectTo: safeAdminPath(formData.get("callbackUrl")),
    });
    return {};
  } catch (error) {
    if (error instanceof AuthError) {
      // Làm chậm việc dò mật khẩu
      await sleep(800);
      return {
        error:
          error.type === "CredentialsSignin"
            ? "Tên đăng nhập hoặc mật khẩu không đúng."
            : "Không đăng nhập được. Kiểm tra cấu hình AUTH_SECRET / ADMIN_* trên máy chủ.",
      };
    }
    throw error;
  }
}
