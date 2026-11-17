import { createHash, timingSafeEqual } from "node:crypto";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

/**
 * Đăng nhập quản trị (Auth.js v5) — chỉ MỘT tài khoản, khai báo bằng biến môi trường:
 *   ADMIN_USERNAME, ADMIN_PASSWORD (≥ 12 ký tự), AUTH_SECRET
 * Phiên lưu trong cookie JWT đã mã hóa — không cần bảng người dùng trong DB.
 */

/** So sánh thời gian hằng (băm trước để hai chuỗi luôn cùng độ dài). */
function safeEqual(a: string, b: string) {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export const ADMIN_ID = "admin";

/** Có tích "Ghi nhớ đăng nhập": giữ phiên 30 ngày. Không tích: phiên hết hạn sau 8 giờ. */
const REMEMBER_SECONDS = 60 * 60 * 24 * 30;
const SHORT_SECONDS = 60 * 60 * 8;

declare module "next-auth" {
  interface User {
    remember?: boolean;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        username: { label: "Tên đăng nhập" },
        password: { label: "Mật khẩu", type: "password" },
        remember: { label: "Ghi nhớ đăng nhập" },
      },
      authorize(credentials) {
        const expectedUser = process.env.ADMIN_USERNAME;
        const expectedPass = process.env.ADMIN_PASSWORD;
        // Chưa cấu hình hoặc mật khẩu quá ngắn → từ chối mọi đăng nhập
        if (!expectedUser || !expectedPass || expectedPass.length < 12) return null;

        const username = typeof credentials?.username === "string" ? credentials.username.trim() : "";
        const password = typeof credentials?.password === "string" ? credentials.password : "";
        // Luôn so sánh cả hai để thời gian phản hồi không lộ việc sai tên hay sai mật khẩu
        const userOk = safeEqual(username, expectedUser);
        const passOk = safeEqual(password, expectedPass);
        if (!userOk || !passOk) return null;

        return { id: ADMIN_ID, name: "Quản trị viên", remember: credentials?.remember === "true" };
      },
    }),
  ],
  // Cookie sống tối đa 30 ngày; phiên không "ghi nhớ" bị hủy sớm hơn trong callback jwt bên dưới
  session: { strategy: "jwt", maxAge: REMEMBER_SECONDS },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.remember = user.remember === true;
        token.loginAt = Math.floor(Date.now() / 1000);
      }
      const loginAt = typeof token.loginAt === "number" ? token.loginAt : 0;
      if (token.remember !== true && Date.now() / 1000 - loginAt > SHORT_SECONDS) return null; // hết hạn → đăng xuất
      return token;
    },
    session({ session, token }) {
      if (session.user) session.user.id = token.sub ?? "";
      return session;
    },
  },
  pages: { signIn: "/dang-nhap", error: "/dang-nhap" },
  trustHost: true,
});

/** Dùng trong trang / Server Action của admin: trả về phiên nếu là quản trị viên, ngược lại null. */
export async function getAdminSession() {
  const session = await auth();
  return session?.user?.id === ADMIN_ID ? session : null;
}
