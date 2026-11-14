import { serializeJsonLd } from "@/lib/seo";

/** Chèn dữ liệu có cấu trúc schema.org (JSON-LD) vào trang. */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
