import Image from "next/image";
import Link from "next/link";
import { getCategory } from "@/data/categories";
import type { Product } from "@/data/types";
import { cn, discountPercent } from "@/lib/utils";
import { Price } from "./price";

export function ProductCard({
  product,
  className,
  eager = false,
  sizes = "(min-width: 1280px) 250px, (min-width: 1024px) 23vw, (min-width: 768px) 31vw, 50vw",
}: {
  product: Product;
  className?: string;
  eager?: boolean;
  sizes?: string;
}) {
  const category = getCategory(product.categorySlug);
  const pct = discountPercent(product.price, product.originalPrice);

  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <Image
          src={product.images[0]}
          alt={product.name}
          fill
          sizes={sizes}
          loading={eager ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
        />
        {product.images[1] && (
          <Image
            src={product.images[1]}
            alt=""
            fill
            sizes={sizes}
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
            aria-hidden
          />
        )}
        {pct > 0 && (
          <span className="absolute left-3 top-3 bg-ivory px-2 py-0.5 text-[11px] font-medium tracking-wide text-brand-600">
            −{pct}%
          </span>
        )}
      </div>
      <div className="pt-4">
        {category && <p className="text-[12px] tracking-wide text-muted">{category.name}</p>}
        <h3 className="mt-1 text-[15px] leading-snug text-ink decoration-ink/30 underline-offset-4 group-hover:underline">
          <Link href={`/san-pham/${product.slug}`} className="after:absolute after:inset-0">
            {product.name}
          </Link>
        </h3>
        <Price price={product.price} originalPrice={product.originalPrice} unit={product.unit} className="mt-2" />
      </div>
    </article>
  );
}

export function ProductGrid({ products, eagerCount = 0, className }: { products: Product[]; eagerCount?: number; className?: string }) {
  return (
    <ul className={cn("grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-5 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12 xl:grid-cols-5", className)}>
      {products.map((p, i) => (
        <li key={p.id}>
          <ProductCard product={p} eager={i < eagerCount} />
        </li>
      ))}
    </ul>
  );
}
