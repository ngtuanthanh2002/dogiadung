import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink, Trash } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { getAdminProduct, listAdminCategories } from "@/lib/admin/queries";
import { formatDateTime } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Notice, PageHeader, param } from "@/components/admin/ui";
import { DangerButton } from "@/components/admin/form-controls";
import { deleteProduct } from "../actions";
import { ProductForm } from "../product-form";

export const metadata: Metadata = { title: "Sửa sản phẩm" };

export default async function EditProductPage({ params, searchParams }: PageProps<"/admin/san-pham/[id]">) {
  await requireAdmin();
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const [product, categories] = await Promise.all([getAdminProduct(decodeURIComponent(id)), listAdminCategories()]);
  if (!product) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/san-pham", label: "Sản phẩm" }}
        title={product.name}
        description={`Mã ${product.id} · cập nhật ${formatDateTime(product.updatedAt ?? product.createdAt)}`}
        actions={
          product.published && (
            <Link href={`/san-pham/${product.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
              <ExternalLink className="h-4 w-4" aria-hidden /> Xem trên cửa hàng
            </Link>
          )
        }
      />
      {param(sp.saved) && <Notice>Đã lưu sản phẩm. Cửa hàng đã được cập nhật.</Notice>}

      <ProductForm key={product.updatedAt} product={product} categories={categories} suggestedId={product.id} />

      <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white px-5 py-4">
        <div>
          <p className="text-[14px] font-medium text-ink">Xóa sản phẩm</p>
          <p className="text-[13px] text-muted">Xóa vĩnh viễn cả ảnh. Đơn hàng cũ vẫn giữ tên & giá. Muốn tạm ngừng bán, hãy bỏ chọn “Đang bán”.</p>
        </div>
        <form action={deleteProduct}>
          <input type="hidden" name="id" value={product.id} />
          <DangerButton confirmMessage={`Xóa vĩnh viễn “${product.name}”? Không thể hoàn tác.`} className="border border-brand-100">
            <Trash className="h-4 w-4" aria-hidden /> Xóa sản phẩm
          </DangerButton>
        </form>
      </div>
    </>
  );
}
