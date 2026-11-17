import { NextResponse, type NextRequest } from "next/server";
import type { CartProduct } from "@/data/types";
import { getProductsByIds } from "@/lib/catalog";

const MAX_IDS = 50;

/**
 * GET /api/cart?ids=GD101,GD102 — thông tin hiển thị cho các sản phẩm trong giỏ hàng.
 * Đọc từ bộ nhớ đệm sản phẩm nên thường không chạm tới DB. Mã không tồn tại sẽ không có trong kết quả.
 */
export async function GET(request: NextRequest) {
  const ids = [
    ...new Set(
      (request.nextUrl.searchParams.get("ids") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter((s) => /^[A-Za-z0-9_-]{1,40}$/.test(s)),
    ),
  ].slice(0, MAX_IDS);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  try {
    const products: CartProduct[] = (await getProductsByIds(ids)).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.images[0] ?? "/images/og-default.jpg",
      price: p.price,
      unit: p.unit,
      stock: p.stock,
    }));
    return NextResponse.json({ products }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("[api/cart] Không đọc được sản phẩm:", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "Không tải được giỏ hàng" }, { status: 503 });
  }
}
