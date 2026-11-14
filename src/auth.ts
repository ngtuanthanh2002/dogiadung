import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/** Chỉ bật Google khi đã có thông tin OAuth — nếu chưa, trang đăng nhập báo "chưa cấu hình" thay vì lỗi của Google. */
const googleConfigured = Boolean(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET);

/**
 * Đăng nhập bằng Google (Auth.js v5). Phiên lưu trong cookie JWT — không cần cơ sở dữ liệu.
 * Biến môi trường cần có: AUTH_SECRET, AUTH_GOOGLE_ID, AUTH_GOOGLE_SECRET (xem .env.example).
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: googleConfigured ? [Google] : [],
  session: { strategy: "jwt" },
  pages: { signIn: "/dang-nhap", error: "/dang-nhap" },
  trustHost: true,
});
