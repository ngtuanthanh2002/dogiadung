import Link from "next/link";
import type { Metadata } from "next";
import { connection } from "next/server";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminCategories } from "@/lib/admin/queries";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, PageHeader } from "@/components/admin/ui";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Thêm sản phẩm" };

/** Mã gợi ý: SP + thời gian (base36) — gần như không trùng, admin có thể đổi. */
function suggestProductId() {
  return `SP${Date.now().toString(36).toUpperCase()}`;
}

export default async function NewProductPage() {
  await requireAdmin();
  await connection();
  const categories = await listAdminCategories();
  const suggestedId = suggestProductId();

  return (
    <>
      <PageHeader back={{ href: "/admin/san-pham", label: "Sản phẩm" }} title="Thêm sản phẩm" />
      {categories.length === 0 ? (
        <EmptyState
          title="Chưa có danh mục"
          description="Cần tạo ít nhất một danh mục trước khi thêm sản phẩm."
          action={
            <Link href="/admin/danh-muc/moi" className={buttonVariants({ size: "sm" })}>
              Tạo danh mục
            </Link>
          }
        />
      ) : (
        <ProductForm categories={categories} suggestedId={suggestedId} />
      )}
    </>
  );
}
