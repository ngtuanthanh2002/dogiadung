/**
 * Công cụ dòng lệnh cho Neon:
 *   npm run db:check   — kiểm tra kết nối + đếm dữ liệu
 *   npm run db:setup   — tạo / cập nhật bảng (chạy lại nhiều lần không sao, không xóa dữ liệu)
 *   npm run db:seed    — nạp danh mục + sản phẩm mẫu (bỏ qua dòng đã có)
 *
 * Đọc DATABASE_URL từ .env.local (qua cờ --env-file trong package.json).
 */
import { neon } from "@neondatabase/serverless";
import { schemaStatements } from "../src/db/schema";
import { seedCategories } from "../src/db/seed-categories";
import { seedProducts } from "../src/db/seed-products";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("✗ Thiếu DATABASE_URL trong .env.local — xem docs/setup.md");
  process.exit(1);
}
const sql = neon(url);

async function check() {
  const [row] = await sql`SELECT version() AS version, current_database() AS db`;
  console.log("✓ Kết nối Neon thành công");
  console.log(`  Database : ${row.db}`);
  console.log(`  Phiên bản: ${String(row.version).split(" on ")[0]}`);
  for (const table of ["categories", "products", "orders", "media"]) {
    const [t] = await sql`SELECT to_regclass(${`public.${table}`}) IS NOT NULL AS exists`;
    if (!t.exists) {
      console.log(`  Bảng ${table}: chưa có — chạy "npm run db:setup"`);
      continue;
    }
    const [c] = await sql.query(`SELECT count(*)::int AS n FROM ${table}`);
    console.log(`  Bảng ${table}: ${c.n} dòng`);
  }
}

async function setup() {
  // Chạy tuần tự trong một giao dịch: lỗi ở câu nào thì không câu nào được áp dụng
  await sql.transaction(schemaStatements.map((s) => sql.query(s)));
  console.log(`✓ Đã tạo / cập nhật cấu trúc cơ sở dữ liệu (${schemaStatements.length} câu lệnh)`);
}

async function seed() {
  const categoryQueries = seedCategories.map(
    (c, i) => sql`
      INSERT INTO categories (slug, name, description, image, parent_slug, sort_order)
      VALUES (${c.slug}, ${c.name}, ${c.description}, ${c.image}, ${c.parent ?? null}, ${i * 10})
      ON CONFLICT (slug) DO NOTHING
      RETURNING slug
    `,
  );
  const productQueries = seedProducts.map(
    (p) => sql`
      INSERT INTO products (id, slug, name, category_slug, price, original_price, unit, sold, stock, images,
                            short_description, highlights, specs, colors, sizes, featured, published, created_at)
      VALUES (${p.id}, ${p.slug}, ${p.name}, ${p.categorySlug}, ${p.price}, ${p.originalPrice ?? null}, ${p.unit ?? null},
              ${p.sold}, ${p.stock}, ${p.images}, ${p.shortDescription}, ${p.highlights},
              ${JSON.stringify(p.specs)}::jsonb, ${JSON.stringify(p.colors ?? [])}::jsonb, ${p.sizes ?? []},
              ${p.featured ?? false}, true, ${p.createdAt})
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `,
  );
  // Danh mục cha đứng trước danh mục con trong file mẫu nên thứ tự chèn luôn hợp lệ
  const results = await sql.transaction([...categoryQueries, ...productQueries]);
  const newCategories = results.slice(0, categoryQueries.length).filter((r) => r.length > 0).length;
  const newProducts = results.slice(categoryQueries.length).filter((r) => r.length > 0).length;
  console.log(`✓ Danh mục: thêm ${newCategories} (bỏ qua ${seedCategories.length - newCategories} đã có)`);
  console.log(`✓ Sản phẩm: thêm ${newProducts} (bỏ qua ${seedProducts.length - newProducts} đã có)`);
}

const commands: Record<string, () => Promise<void>> = { check, setup, seed };
const command = process.argv[2] ?? "check";
const run = commands[command];
if (!run) {
  console.error(`Lệnh không hợp lệ: ${command}. Dùng: check | setup | seed`);
  process.exit(1);
}

run().catch((error: unknown) => {
  console.error("✗ Lỗi:", error instanceof Error ? error.message : error);
  process.exit(1);
});
