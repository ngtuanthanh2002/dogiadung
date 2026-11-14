import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { siteConfig } from "@/config/site";
import { categories, getCategory, getChildren, topCategories } from "@/data/categories";
import { getProductsInCategory, products, sortProducts } from "@/data/products";
import type { Product } from "@/data/types";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { ProductCard, ProductGrid } from "@/components/product/product-card";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — ${siteConfig.slogan}` },
  alternates: { canonical: "/" },
};

function SectionHeader({ eyebrow, title, href, id }: { eyebrow: string; title: string; href?: string; id: string }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 md:mb-10">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 id={id} className="mt-2.5 font-serif text-[28px] leading-tight text-ink md:text-4xl">
          {title}
        </h2>
      </div>
      {href && (
        <Link href={href} className="group flex shrink-0 items-center gap-2 text-sm text-ink transition-colors hover:text-brand-600">
          Xem tất cả
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden />
        </Link>
      )}
    </div>
  );
}

/**
 * Khối "tầng" theo danh mục: banner dọc + lưới sản phẩm.
 * Số sản phẩm hiển thị được ẩn bớt theo breakpoint để luôn lấp đầy hàng.
 */
function CategoryFloor({
  slug,
  title,
  tagline,
  banner,
  items,
  rows,
}: {
  slug: string;
  title: string;
  tagline: string;
  banner: string;
  items: Product[];
  rows: 1 | 2;
}) {
  const category = getCategory(slug);
  if (!category) return null;
  const children = getChildren(slug);
  const headingId = `floor-${slug}`;
  // Ở lg (4 cột) và md (3 cột) chỉ hiện đủ số sản phẩm lấp kín hàng
  const visibleAtLg = rows === 2 ? 6 : 3;
  const visibleAtMd = rows === 2 ? 6 : 3;

  return (
    <section className="container-page pt-20 md:pt-24" aria-labelledby={headingId}>
      <SectionHeader id={headingId} eyebrow={category.name} title={title} href={`/danh-muc/${slug}`} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-5">
        <li className={cn("col-span-full lg:col-span-1", rows === 2 && "lg:row-span-2")}>
          <div className="group relative h-full min-h-[240px] overflow-hidden bg-sand md:min-h-[300px]">
            <Image
              src={banner}
              alt={category.name}
              fill
              sizes="(min-width: 1024px) 25vw, 100vw"
              className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.05]"
            />
            <div className="absolute inset-0 bg-linear-to-t from-ink/80 via-ink/25 to-transparent" />
            <Link href={`/danh-muc/${slug}`} className="absolute inset-0" aria-label={`Xem tất cả ${category.name}`} />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6 text-ivory">
              <p className="font-serif text-2xl">{category.name}</p>
              <p className="mt-1.5 text-sm text-ivory/80">{tagline}</p>
              <ul className="pointer-events-auto relative mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px]">
                {children.map((c) => (
                  <li key={c.slug}>
                    <Link href={`/danh-muc/${c.slug}`} className="text-ivory/90 underline-offset-4 hover:text-white hover:underline">
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </li>
        {items.map((p, i) => (
          <li
            key={p.id}
            className={cn(
              i >= visibleAtLg && "lg:max-xl:hidden",
              i >= visibleAtMd && "md:max-lg:hidden",
              rows === 2 && i >= 6 && "max-md:hidden",
            )}
          >
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

export default function HomePage() {
  // Tránh lặp sản phẩm giữa các khối để trưng bày được nhiều mặt hàng nhất
  const used = new Set<string>();
  const take = (list: Product[], n: number) => {
    const out: Product[] = [];
    for (const p of list) {
      if (out.length >= n) break;
      if (!used.has(p.id)) {
        out.push(p);
        used.add(p.id);
      }
    }
    return out;
  };

  // Nổi bật: xen kẽ giữa các danh mục lớn
  const featuredBuckets = topCategories.map((c) => getProductsInCategory(c.slug).filter((p) => p.featured));
  const featured = take(
    Array.from({ length: Math.max(...featuredBuckets.map((b) => b.length)) }).flatMap((_, i) =>
      featuredBuckets.map((b) => b[i]).filter((p): p is Product => !!p),
    ),
    10,
  );
  const giaDung = take(sortProducts(getProductsInCategory("hang-gia-dung"), "ban-chay"), 8);
  const quanAo = take(sortProducts(getProductsInCategory("quan-ao"), "ban-chay"), 4);
  const vai = take(sortProducts(getProductsInCategory("vai"), "ban-chay"), 4);
  const recommended = take(sortProducts(products, "moi-nhat"), 15);

  const subcategories = categories.filter((c) => c.parent);

  return (
    <>
      {/* ───── Banner ───── */}
      <section className="container-page pt-5 lg:pt-6" aria-labelledby="hero-heading">
        <div className="grid gap-3 md:gap-4 lg:h-[540px] lg:grid-cols-3">
          <div className="relative min-h-[440px] overflow-hidden bg-sand lg:col-span-2 lg:min-h-0">
            <Image
              src="/images/banners/hero-main.jpg"
              alt="Phòng khách tông màu trung tính ấm áp"
              fill
              preload
              sizes="(min-width: 1024px) 66vw, 100vw"
              className="object-cover object-[70%_center]"
            />
            <div className="absolute inset-0 bg-linear-to-r from-ivory via-ivory/75 to-transparent" />
            <div className="relative flex h-full max-w-lg flex-col justify-center p-7 md:p-12">
              <p className="eyebrow text-ink-soft">Hàng đa dụng cho mọi nhà</p>
              <h1 id="hero-heading" className="mt-4 font-serif text-[40px] leading-[1.08] text-ink md:text-[56px]">
                Sống đẹp từ những điều <em className="italic text-brand-600">giản dị</em>
              </h1>
              <p className="mt-5 max-w-sm text-[15px] leading-relaxed text-ink-soft">
                Thiết bị gia dụng, đồ dùng nhà bếp, nội thất, quần áo và vải — hàng trăm sản phẩm chọn lọc, thanh toán khi nhận hàng.
              </p>
              <div className="mt-8">
                <Link href="/san-pham" className={buttonVariants({ size: "lg" })}>
                  Mua sắm ngay
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-1 lg:grid-rows-2">
            {[
              { href: "/danh-muc/thiet-bi-nau-nuong", image: "/images/lifestyle/bep-2.jpg", eyebrow: "Bếp đẹp mỗi ngày", title: "Thiết bị nấu nướng" },
              { href: "/danh-muc/quan-ao", image: "/images/lifestyle/ao-treo-xanh.jpg", eyebrow: "Mùa mới", title: "Quần áo tối giản" },
            ].map((tile) => (
              <Link key={tile.href} href={tile.href} className="group relative block aspect-square overflow-hidden bg-sand lg:aspect-auto">
                <Image
                  src={tile.image}
                  alt={tile.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, 50vw"
                  className="object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
                />
                <span className="absolute inset-0 bg-linear-to-t from-ink/70 via-ink/10 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 p-4 text-ivory md:p-6">
                  <span className="hidden text-[11px] uppercase tracking-[0.16em] text-ivory/80 md:block">{tile.eyebrow}</span>
                  <span className="mt-1 flex items-center justify-between gap-2 font-serif text-lg md:text-2xl">
                    {tile.title}
                    <ArrowRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.5} aria-hidden />
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Danh mục ───── */}
      <section className="container-page pt-20 md:pt-24" aria-labelledby="categories-heading">
        <SectionHeader id="categories-heading" eyebrow="Danh mục" title="Mua sắm theo danh mục" href="/san-pham" />
        <ul className="scrollbar-none -mx-5 flex snap-x gap-4 overflow-x-auto px-5 lg:mx-0 lg:grid lg:grid-cols-8 lg:gap-x-5 lg:gap-y-8 lg:overflow-visible lg:px-0">
          {subcategories.map((c) => (
            <li key={c.slug} className="w-[30%] shrink-0 snap-start sm:w-[22%] lg:w-auto">
              <Link href={`/danh-muc/${c.slug}`} className="group block text-center">
                <span className="relative block aspect-square overflow-hidden bg-sand">
                  <Image
                    src={c.image}
                    alt={c.name}
                    fill
                    sizes="(min-width: 1024px) 140px, 30vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </span>
                <span className="mt-3 block text-[13px] leading-snug text-ink-soft group-hover:text-ink">{c.name}</span>
              </Link>
            </li>
          ))}
          <li className="w-[30%] shrink-0 snap-start sm:w-[22%] lg:w-auto">
            <Link href="/san-pham" className="group block text-center">
              <span className="flex aspect-square items-center justify-center border border-line transition-colors duration-300 group-hover:border-ink group-hover:bg-ink">
                <ArrowRight className="h-6 w-6 text-ink transition-all duration-300 group-hover:translate-x-1 group-hover:text-ivory" strokeWidth={1.3} aria-hidden />
              </span>
              <span className="mt-3 block text-[13px] text-ink-soft group-hover:text-ink">Tất cả sản phẩm</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* ───── Sản phẩm nổi bật ───── */}
      <section className="container-page pt-20 md:pt-24" aria-labelledby="featured-heading">
        <SectionHeader id="featured-heading" eyebrow="Chọn lọc" title="Sản phẩm nổi bật" href="/san-pham" />
        <ProductGrid products={featured} />
      </section>

      {/* ───── Theo từng danh mục lớn ───── */}
      <CategoryFloor
        slug="hang-gia-dung"
        title="Tiện nghi cho mọi góc nhà"
        tagline="Từ căn bếp, phòng khách đến phòng ngủ."
        banner="/images/banners/cat-gia-dung.jpg"
        items={giaDung}
        rows={2}
      />
      <CategoryFloor
        slug="quan-ao"
        title="Mặc đẹp mỗi ngày"
        tagline="Chất liệu tự nhiên, phom dáng dễ mặc."
        banner="/images/banners/cat-quan-ao.jpg"
        items={quanAo}
        rows={1}
      />
      <CategoryFloor
        slug="vai"
        title="Vải may mặc chọn lọc"
        tagline="Bán theo mét — linen, lụa, denim, len."
        banner="/images/banners/cat-vai.jpg"
        items={vai}
        rows={1}
      />

      {/* ───── Gợi ý cho bạn ───── */}
      <section className="container-page pt-20 md:pt-24" aria-labelledby="recommend-heading">
        <SectionHeader id="recommend-heading" eyebrow="Dành cho bạn" title="Gợi ý hôm nay" />
        <ProductGrid products={recommended} />
        <div className="mt-14 flex justify-center">
          <Link href="/san-pham" className={buttonVariants({ variant: "outline" })}>
            Xem thêm sản phẩm
          </Link>
        </div>
      </section>
    </>
  );
}
