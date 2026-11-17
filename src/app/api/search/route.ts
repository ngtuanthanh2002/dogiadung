import { NextResponse, type NextRequest } from "next/server";
import { getAllProducts } from "@/lib/catalog";
import { suggestProducts } from "@/lib/product-search";
import { PLACEHOLDER_IMAGE } from "@/lib/utils";

export type SearchSuggestion = {
  slug: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  unit?: string;
  categoryName?: string;
};

/**
 * GET /api/search?q=noi gang — 5 sản phẩm có tên giống / gần giống nhất (gợi ý khi gõ ở ô tìm kiếm).
 * Lọc trên danh sách sản phẩm đã cache nên không chạm DB.
 */
export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get("q") ?? "").trim().slice(0, 100);
  if (q.length < 2) return NextResponse.json({ products: [] });

  try {
    const products: SearchSuggestion[] = suggestProducts(await getAllProducts(), q, 5).map((p) => ({
      slug: p.slug,
      name: p.name,
      image: p.images[0] ?? PLACEHOLDER_IMAGE,
      price: p.price,
      originalPrice: p.originalPrice,
      unit: p.unit,
      categoryName: p.categoryName,
    }));
    return NextResponse.json(
      { products },
      { headers: { "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600" } },
    );
  } catch (error) {
    console.error("[api/search]", error instanceof Error ? error.message : error);
    return NextResponse.json({ products: [], error: "Không tìm được sản phẩm" }, { status: 503 });
  }
}
