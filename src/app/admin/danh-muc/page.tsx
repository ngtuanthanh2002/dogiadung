import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Pencil, Plus, Trash } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminCategories, type AdminCategory } from "@/lib/admin/queries";
import { cn, PLACEHOLDER_IMAGE } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState, Notice, PageHeader, param } from "@/components/admin/ui";
import { DangerButton } from "@/components/admin/form-controls";
import { deleteCategory } from "./actions";

export const metadata: Metadata = { title: "Danh mục" };

function Row({ c, child = false }: { c: AdminCategory; child?: boolean }) {
  const removable = c.productCount === 0 && c.childCount === 0;
  return (
    <li className={cn("flex items-center gap-4 px-5 py-3", child && "bg-sand/20 pl-10 sm:pl-14")}>
      <span className={cn("relative shrink-0 overflow-hidden rounded-md bg-sand", child ? "h-10 w-10" : "h-12 w-12")}>
        <Image src={c.image || PLACEHOLDER_IMAGE} alt="" fill sizes="48px" className="object-cover" />
      </span>
      <div className="min-w-0 flex-1">
        <Link href={`/admin/danh-muc/${c.slug}`} className={cn("text-ink hover:text-brand-600", child ? "text-[14px]" : "text-[15px] font-medium")}>
          {c.name}
        </Link>
        <p className="text-[12px] text-muted">
          /danh-muc/{c.slug} · {c.productCount} sản phẩm{!child && ` · ${c.childCount} danh mục con`} · thứ tự {c.sortOrder}
        </p>
      </div>
      <div className="flex shrink-0 gap-1">
        <Link href={`/admin/danh-muc/${c.slug}`} className={buttonVariants({ variant: "ghost", size: "sm", className: "h-9 px-3" })}>
          <Pencil className="h-4 w-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Sửa</span>
        </Link>
        {removable && (
          <form action={deleteCategory}>
            <input type="hidden" name="slug" value={c.slug} />
            <DangerButton confirmMessage={`Xóa danh mục “${c.name}”?`}>
              <Trash className="h-4 w-4" aria-hidden /> <span className="sr-only sm:not-sr-only">Xóa</span>
            </DangerButton>
          </form>
        )}
      </div>
    </li>
  );
}

export default async function AdminCategoriesPage({ searchParams }: PageProps<"/admin/danh-muc">) {
  await requireAdmin();
  const sp = await searchParams;
  const categories = await listAdminCategories();
  const tops = categories.filter((c) => !c.parent);
  const error = param(sp.error);

  return (
    <>
      <PageHeader
        title="Danh mục"
        description="Danh mục cấp 1 hiện trên menu cửa hàng; danh mục con nằm bên trong. Chỉ xóa được danh mục không còn sản phẩm."
        actions={
          <Link href="/admin/danh-muc/moi" className={buttonVariants({ size: "sm" })}>
            <Plus className="h-4 w-4" aria-hidden /> Thêm danh mục
          </Link>
        }
      />
      {param(sp.saved) && <Notice>Đã lưu danh mục. Menu cửa hàng đã được cập nhật.</Notice>}
      {param(sp.deleted) && <Notice>Đã xóa danh mục.</Notice>}
      {error && <Notice tone="error">{error}</Notice>}

      {tops.length === 0 ? (
        <EmptyState title="Chưa có danh mục" description="Tạo danh mục để phân loại sản phẩm." />
      ) : (
        <div className="space-y-4">
          {tops.map((top) => (
            <ul key={top.slug} className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-white">
              <Row c={top} />
              {categories
                .filter((c) => c.parent === top.slug)
                .map((c) => (
                  <Row key={c.slug} c={c} child />
                ))}
            </ul>
          ))}
        </div>
      )}
    </>
  );
}
