import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Trang thanh toán / tài khoản không cần index. URL có tham số (?sort, ?page, ?q) đã có canonical về trang gốc.
        disallow: ["/thanh-toan", "/admin", "/dang-nhap", "/api/"],
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
