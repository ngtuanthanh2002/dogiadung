import type { NextConfig } from "next";

/** Cho phép next/image hiển thị ảnh từ ImageKit (domain lấy từ IMAGEKIT_URL_ENDPOINT). */
function imageKitPattern() {
  const value = process.env.IMAGEKIT_URL_ENDPOINT;
  if (!value) return [];
  try {
    const url = new URL(value);
    const path = url.pathname.replace(/\/+$/, "");
    return [{ protocol: "https" as const, hostname: url.hostname, pathname: `${path}/**` }];
  } catch {
    throw new Error(`IMAGEKIT_URL_ENDPOINT không hợp lệ: ${value}`);
  }
}

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: imageKitPattern(),
  },
  experimental: {
    // Ảnh tải lên từ trang admin đi qua Server Action (đã được thu nhỏ ở trình duyệt, tối đa 4 MB)
    serverActions: { bodySizeLimit: "5mb" },
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
