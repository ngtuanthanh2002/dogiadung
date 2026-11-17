import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin/auth";
import { listAdminCategories } from "@/lib/admin/queries";
import { PageHeader } from "@/components/admin/ui";
import { CategoryForm } from "../category-form";

export const metadata: Metadata = { title: "Thêm danh mục" };

export default async function NewCategoryPage() {
  await requireAdmin();
  const categories = await listAdminCategories();
  return (
    <>
      <PageHeader back={{ href: "/admin/danh-muc", label: "Danh mục" }} title="Thêm danh mục" />
      <CategoryForm parents={categories.filter((c) => !c.parent)} />
    </>
  );
}
