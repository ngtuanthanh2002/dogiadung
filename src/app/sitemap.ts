import type { MetadataRoute } from "next";
import { categories } from "@/data/categories";
import { policies } from "@/data/policies";
import { products } from "@/data/products";
import { absoluteUrl } from "@/lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: absoluteUrl("/"), changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/san-pham"), changeFrequency: "daily", priority: 0.9 },
    ...categories.map((c) => ({
      url: absoluteUrl(`/danh-muc/${c.slug}`),
      changeFrequency: "daily" as const,
      priority: c.parent ? 0.7 : 0.8,
      images: [absoluteUrl(c.image)],
    })),
    ...products.map((p) => ({
      url: absoluteUrl(`/san-pham/${p.slug}`),
      lastModified: p.createdAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.map((src) => absoluteUrl(src)),
    })),
    { url: absoluteUrl("/gioi-thieu"), changeFrequency: "monthly", priority: 0.5 },
    { url: absoluteUrl("/lien-he"), changeFrequency: "monthly", priority: 0.5 },
    ...policies.map((p) => ({
      url: absoluteUrl(`/chinh-sach/${p.slug}`),
      lastModified: p.updatedAt,
      changeFrequency: "yearly" as const,
      priority: 0.3,
    })),
  ];
}
