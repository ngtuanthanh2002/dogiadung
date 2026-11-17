import { Suspense } from "react";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ListingHeader } from "@/components/listing/listing-header";
import { ListingResults, ListingResultsSkeleton } from "@/components/listing/listing-results";

export const metadata: Metadata = pageMetadata({
  title: "Tất cả sản phẩm",
  description:
    "Hàng gia dụng, quần áo và vải chọn lọc tại Phú Ngọ. Thanh toán khi nhận hàng, miễn phí giao hàng cho đơn từ 499.000₫, đổi trả trong 7 ngày.",
  path: "/san-pham",
});

export default function ProductsPage({ searchParams }: PageProps<"/san-pham">) {
  return (
    <>
      <ListingHeader
        title="Tất cả sản phẩm"
        description="Hàng gia dụng, nội thất, quần áo và vải — lọc theo danh mục, mức giá và ưu đãi để tìm nhanh sản phẩm bạn cần."
        breadcrumbs={[{ label: "Sản phẩm", href: "/san-pham" }]}
      />
      <div className="container-page">
        <Suspense fallback={<ListingResultsSkeleton />}>
          <ListingResults searchParams={searchParams} basePath="/san-pham" />
        </Suspense>
      </div>
    </>
  );
}
