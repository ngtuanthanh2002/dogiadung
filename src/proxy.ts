import { NextResponse, type NextRequest } from "next/server";
import { policies } from "@/data/policies";

/**
 * Chạy trước khi render:
 * 1. /admin: chưa có cookie phiên → chuyển tới /dang-nhap (lớp lọc nhanh; trang & Server Action vẫn tự kiểm tra phiên).
 * 2. Trả 404 thật cho trang chính sách sai slug (dữ liệu tĩnh trong code).
 *
 * Sản phẩm / danh mục nằm trong DB nên KHÔNG kiểm tra ở đây (tránh truy vấn DB mỗi lượt truy cập,
 * giữ Neon được "ngủ"). Slug sai sẽ do trang gọi notFound(): hiện trang 404 kèm thẻ noindex.
 */
const policySlugs = new Set(policies.map((p) => p.slug));

const notFound = (request: NextRequest) =>
  // Rewrite tới một đường dẫn không tồn tại → Next.js render app/not-found.tsx với status 404
  NextResponse.rewrite(new URL("/_khong-tim-thay", request.url));

function hasSessionCookie(request: NextRequest) {
  return request.cookies
    .getAll()
    .some((c) => c.name.startsWith("authjs.session-token") || c.name.startsWith("__Secure-authjs.session-token"));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    if (!hasSessionCookie(request)) {
      const url = new URL("/dang-nhap", request.url);
      url.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const [, section, rawSlug, ...rest] = pathname.split("/");
  if (!rawSlug) return NextResponse.next();
  if (rest.length > 0) return notFound(request);

  if (section === "chinh-sach") {
    let slug: string;
    try {
      slug = decodeURIComponent(rawSlug);
    } catch {
      return notFound(request);
    }
    if (!policySlugs.has(slug)) return notFound(request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/san-pham/:slug+", "/danh-muc/:slug+", "/chinh-sach/:slug+", "/admin", "/admin/:path*"],
};
