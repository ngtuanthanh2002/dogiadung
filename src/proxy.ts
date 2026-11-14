import { NextResponse, type NextRequest } from "next/server";
import { categories } from "@/data/categories";
import { policies } from "@/data/policies";
import { products } from "@/data/products";

/**
 * Với Cache Components, trang động gửi "shell" trước nên notFound() trong trang chỉ
 * trả về 200 + noindex. Proxy kiểm tra slug TRƯỚC khi stream để trả về mã 404 thật
 * (chuẩn SEO, tránh "soft 404").
 *
 * Khi chuyển sang lấy dữ liệu từ API, thay các Set dưới đây bằng một tra cứu nhẹ
 * (ví dụ danh sách slug được cache), không tải toàn bộ nội dung ở đây.
 */
const known: Record<string, Set<string>> = {
  "san-pham": new Set(products.map((p) => p.slug)),
  "danh-muc": new Set(categories.map((c) => c.slug)),
  "chinh-sach": new Set(policies.map((p) => p.slug)),
};

export function proxy(request: NextRequest) {
  // Trang tài khoản: chưa có cookie phiên đăng nhập thì chuyển tới trang đăng nhập (trang vẫn kiểm tra lại phiên).
  if (request.nextUrl.pathname === "/tai-khoan") {
    const hasSession = request.cookies
      .getAll()
      .some((c) => c.name.startsWith("authjs.session-token") || c.name.startsWith("__Secure-authjs.session-token"));
    if (!hasSession) {
      const url = new URL("/dang-nhap", request.url);
      url.searchParams.set("callbackUrl", "/tai-khoan");
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const [, section, slug, ...rest] = request.nextUrl.pathname.split("/");
  const slugs = known[section];

  if (slugs && slug && (rest.length > 0 || !slugs.has(decodeURIComponent(slug)))) {
    // Rewrite tới một đường dẫn không tồn tại → Next.js render app/not-found.tsx với status 404
    return NextResponse.rewrite(new URL("/_khong-tim-thay", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/san-pham/:slug+", "/danh-muc/:slug+", "/chinh-sach/:slug+", "/tai-khoan"],
};
