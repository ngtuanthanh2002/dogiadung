import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, getCategory, getRootCategory } from "@/data/categories";
import { getProductsInCategory } from "@/data/products";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/ui/json-ld";
import { ListingHeader } from "@/components/listing/listing-header";
import { ListingResults, ListingResultsSkeleton } from "@/components/listing/listing-results";

export function generateStaticParams() {
  return categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/danh-muc/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) return { title: "Không tìm thấy danh mục" };
  return pageMetadata({
    title: category.name,
    description: `${category.description} Thanh toán khi nhận hàng, giao hàng toàn quốc.`,
    path: `/danh-muc/${category.slug}`,
    image: category.image,
    imageAlt: category.name,
  });
}

export default async function CategoryPage({ params, searchParams }: PageProps<"/danh-muc/[slug]">) {
  const { slug } = await params;
  const category = getCategory(slug);
  if (!category) notFound();

  const root = getRootCategory(slug) ?? category;
  const items = getProductsInCategory(category.slug);

  const breadcrumbs = [
    { label: "Sản phẩm", href: "/san-pham" },
    ...(category.parent ? [{ label: root.name, href: `/danh-muc/${root.slug}` }] : []),
    { label: category.name, href: `/danh-muc/${category.slug}` },
  ];

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: category.name,
    description: category.description,
    url: absoluteUrl(`/danh-muc/${category.slug}`),
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: absoluteUrl(`/san-pham/${p.slug}`),
        name: p.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <ListingHeader
        title={category.name}
        description={category.description}
        breadcrumbs={breadcrumbs}
      />
      <div className="container-page">
        <Suspense fallback={<ListingResultsSkeleton />}>
          <ListingResults searchParams={searchParams} basePath={`/danh-muc/${category.slug}`} categorySlug={category.slug} />
        </Suspense>
      </div>
    </>
  );
}
