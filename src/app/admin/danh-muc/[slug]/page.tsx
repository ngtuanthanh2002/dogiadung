import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminCategories } from "@/lib/admin/queries";
import { buttonVariants } from "@/components/ui/button";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Sửa danh mục" };

export default async function EditCategoryPage({ params }: PageProps<"/admin/danh-muc/[slug]">) {
  await requireAdmin();
  const { slug } = await params;
  const categories = await listAdminCategories();
  const category = categories.find((c) => c.slug === decodeURIComponent(slug));
  if (!category) notFound();

  return (
    <>
      <PageHeader
        back={{ href: "/admin/danh-muc", label: "Danh mục" }}
        title={category.name}
        description={`${category.productCount} sản phẩm · ${category.childCount} danh mục con`}
        actions={
          <Link href={`/danh-muc/${category.slug}`} target="_blank" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink className="h-4 w-4" aria-hidden /> Xem trên cửa hàng
          </Link>
        }
      />
      <CategoryForm category={category} parents={categories.filter((c) => !c.parent)} hasChildren={category.childCount > 0} />
    </>
  );
}
