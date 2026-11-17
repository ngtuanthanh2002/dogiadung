import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Kết nối Neon PostgreSQL qua HTTP (driver serverless) — mỗi truy vấn là một request HTTPS,
 * không giữ kết nối mở nên hợp với Vercel/serverless và gói Free của Neon.
 *
 * Biến môi trường: DATABASE_URL (xem docs/setup.md).
 */
let client: NeonQueryFunction<false, false> | undefined;

export function db() {
  if (!client) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("Thiếu biến môi trường DATABASE_URL — xem docs/setup.md");
    }
    client = neon(url);
  }
  return client;
}
