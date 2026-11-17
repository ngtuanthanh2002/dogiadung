import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Banknote, RotateCcw, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { findCategory, rootOf } from "@/data/categories";
import { getAllProducts, getCategories, getProduct, getRelatedProducts } from "@/lib/catalog";
import { absoluteUrl, pageMetadata } from "@/lib/seo";
import { formatCompact, formatPrice, truncate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/ui/json-ld";
import { Tabs } from "@/components/ui/tabs";
import { Price } from "@/components/product/price";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductGrid } from "@/components/product/product-card";
import { PurchasePanel } from "@/components/product/purchase-panel";

export async function generateStaticParams() {
  const slugs = (await getAllProducts()).map((p) => ({ slug: p.slug }));
  // Cache Components bắt buộc ít nhất 1 tham số — DB trống thì dùng slug giữ chỗ (trang sẽ báo 404)
  return slugs.length > 0 ? slugs : [{ slug: "__trong__" }];
}

export async function generateMetadata({ params }: PageProps<"/san-pham/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Không tìm thấy sản phẩm" };
  const unit = product.unit ? `/${product.unit}` : "";
  return pageMetadata({
    title: product.name,
    description: truncate(`${product.name} — ${formatPrice(product.price)}${unit}. ${product.shortDescription}`, 158),
    path: `/san-pham/${product.slug}`,
    image: product.images[0],
    imageAlt: product.name,
  });
}

const assurances = [
  { icon: Banknote, text: "Thanh toán khi nhận hàng (COD)" },
  { icon: Truck, text: `Miễn phí giao hàng cho đơn từ ${formatPrice(siteConfig.freeShippingThreshold)}` },
  { icon: RotateCcw, text: "Đổi trả trong 7 ngày" },
];

export default async function ProductPage({ params }: PageProps<"/san-pham/[slug]">) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [categories, related] = await Promise.all([getCategories(), getRelatedProducts(product, 5)]);
  const category = findCategory(categories, product.categorySlug);
  const root = rootOf(categories, product.categorySlug);
  const url = absoluteUrl(`/san-pham/${product.slug}`);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: product.name,
    description: product.shortDescription,
    sku: product.id,
    image: product.images.map((src) => absoluteUrl(src)),
    brand: { "@type": "Brand", name: siteConfig.name },
    category: [root?.name, category?.name].filter(Boolean).join(" > "),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "VND",
      price: product.price,
      priceValidUntil: `${siteConfig.copyrightYear}-12-31`,
      itemCondition: "https://schema.org/NewCondition",
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      acceptedPaymentMethod: "https://schema.org/COD",
      seller: { "@id": absoluteUrl("/#organization") },
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: {
          "@type": "MonetaryAmount",
          value: product.price >= siteConfig.freeShippingThreshold ? 0 : siteConfig.shippingFee,
          currency: "VND",
        },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "VN" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 5, unitCode: "DAY" },
        },
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: "VN",
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 7,
        returnMethod: "https://schema.org/ReturnByMail",
        returnFees: "https://schema.org/FreeReturn",
      },
    },
  };

  return (
    <div className="container-page">
      <JsonLd data={productJsonLd} />
      <Breadcrumbs
        items={[
          ...(root ? [{ label: root.name, href: `/danh-muc/${root.slug}` }] : []),
          ...(category && category.slug !== root?.slug ? [{ label: category.name, href: `/danh-muc/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="grid gap-10 pt-2 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16">
        <ProductGallery images={product.images} name={product.name} />

        <div className="lg:sticky lg:top-28 lg:self-start">
          {category && (
            <Link href={`/danh-muc/${category.slug}`} className="eyebrow hover:text-ink">
              {category.name}
            </Link>
          )}
          <h1 className="mt-3 font-serif text-[32px] leading-tight text-ink md:text-[40px]">{product.name}</h1>
          <Price price={product.price} originalPrice={product.originalPrice} unit={product.unit} size="lg" className="mt-5" />
          <p className="mt-2 text-[13px] text-muted">
            Đã bán {formatCompact(product.sold)} · Mã sản phẩm {product.id}
          </p>

          <p className="mt-7 leading-relaxed text-ink-soft">{product.shortDescription}</p>

          <div className="mt-8 border-t border-line pt-8">
            <PurchasePanel
              id={product.id}
              unit={product.unit}
              stock={product.stock}
              colors={product.colors}
              sizes={product.sizes}
            />
          </div>

          <ul className="mt-8 space-y-3 border-t border-line pt-8">
            {assurances.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-[13px] text-ink-soft">
                <Icon className="h-[18px] w-[18px] shrink-0 text-muted" strokeWidth={1.4} aria-hidden />
                {text}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className="mx-auto mt-24 max-w-3xl md:mt-32" aria-label="Thông tin sản phẩm">
        <Tabs
          ariaLabel="Thông tin sản phẩm"
          items={[
            {
              value: "chi-tiet",
              label: "Chi tiết sản phẩm",
              content: (
                <div className="prose-content">
                  <p>{product.shortDescription}</p>
                  <h2>Đặc điểm nổi bật</h2>
                  <ul>
                    {product.highlights.map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                  {product.images[1] && (
                    <figure className="my-10">
                      <Image
                        src={product.images[1]}
                        alt={`${product.name} — hình ảnh thực tế`}
                        width={900}
                        height={900}
                        sizes="(min-width: 768px) 768px, 100vw"
                        className="aspect-[16/10] w-full object-cover"
                      />
                    </figure>
                  )}
                </div>
              ),
            },
            {
              value: "thong-so",
              label: "Thông số chi tiết",
              content: (
                <dl className="divide-y divide-line border-y border-line text-[15px]">
                  {[...product.specs, { label: "Mã sản phẩm", value: product.id }].map((s) => (
                    <div key={s.label} className="grid grid-cols-[40%_1fr] gap-4 py-4">
                      <dt className="text-muted">{s.label}</dt>
                      <dd className="text-ink">{s.value}</dd>
                    </div>
                  ))}
                </dl>
              ),
            },
          ]}
        />
      </section>

      <section className="mt-24 md:mt-32" aria-labelledby="related-heading">
        <h2 id="related-heading" className="mb-10 font-serif text-3xl md:mb-14 md:text-[40px]">
          Có thể bạn cũng thích
        </h2>
        <ProductGrid products={related} />
      </section>
    </div>
  );
}
