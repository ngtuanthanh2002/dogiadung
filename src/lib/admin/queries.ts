import "server-only";
import type { Category, Order, OrderItem, OrderStatus, Product } from "@/data/types";
import { toCategory, toProduct, type CategoryRow, type ProductRow } from "@/lib/catalog";
import { db } from "@/lib/db";

/**
 * Truy vấn cho trang ADMIN — đọc thẳng DB, không cache (luôn thấy dữ liệu mới nhất).
 * Mọi trang gọi các hàm này đều phải gọi requireAdmin() trước.
 */

export const PAGE_SIZE = 20;
export const LOW_STOCK = 5;

const iso = (v: Date | string) => (v instanceof Date ? v.toISOString() : String(v));

// ───────────── Tổng quan ─────────────

export async function getDashboardStats() {
  const sql = db();
  const [[counts], recent, lowStock] = await Promise.all([
    sql`
      SELECT
        count(*) FILTER (WHERE status = 'new')::int                                              AS new_orders,
        count(*) FILTER (WHERE status IN ('confirmed', 'shipping'))::int                         AS processing_orders,
        count(*) FILTER (WHERE created_at >= date_trunc('day', now() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh')::int AS today_orders,
        COALESCE(sum(total) FILTER (
          WHERE status = 'completed'
            AND created_at >= date_trunc('month', now() AT TIME ZONE 'Asia/Ho_Chi_Minh') AT TIME ZONE 'Asia/Ho_Chi_Minh'
        ), 0)::bigint                                                                            AS month_revenue,
        COALESCE(sum(total) FILTER (
          WHERE status NOT IN ('cancelled', 'completed')
        ), 0)::bigint                                                                            AS pending_revenue,
        (SELECT count(*)::int FROM products WHERE published)                                     AS published_products,
        (SELECT count(*)::int FROM products)                                                     AS total_products,
        (SELECT count(*)::int FROM categories)                                                   AS categories,
        (SELECT count(DISTINCT phone)::int FROM orders)                                          AS customers
      FROM orders
    `,
    sql`
      SELECT o.id, o.code, o.status, o.customer_name, o.phone, o.total, o.created_at,
             (SELECT COALESCE(sum(quantity), 0)::int FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      ORDER BY o.created_at DESC
      LIMIT 6
    `,
    sql`
      SELECT id, name, stock, images
      FROM products
      WHERE published AND stock <= ${LOW_STOCK}
      ORDER BY stock, name
      LIMIT 8
    `,
  ]);

  return {
    newOrders: counts.new_orders as number,
    processingOrders: counts.processing_orders as number,
    todayOrders: counts.today_orders as number,
    monthRevenue: Number(counts.month_revenue),
    pendingRevenue: Number(counts.pending_revenue),
    publishedProducts: counts.published_products as number,
    totalProducts: counts.total_products as number,
    categories: counts.categories as number,
    customers: counts.customers as number,
    recentOrders: recent.map((r) => ({
      id: Number(r.id),
      code: r.code as string,
      status: r.status as OrderStatus,
      customerName: r.customer_name as string,
      phone: r.phone as string,
      total: r.total as number,
      itemCount: r.item_count as number,
      createdAt: iso(r.created_at),
    })),
    lowStock: lowStock.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      stock: r.stock as number,
      image: (r.images as string[])[0] ?? "",
    })),
  };
}

// ───────────── Đơn hàng ─────────────

type OrderRow = Record<string, unknown>;

function toOrder(r: OrderRow): Order {
  return {
    id: Number(r.id),
    code: r.code as string,
    status: r.status as OrderStatus,
    customerName: r.customer_name as string,
    phone: r.phone as string,
    email: r.email as string,
    province: r.province as string,
    ward: r.ward as string,
    address: r.address as string,
    receiverName: (r.receiver_name as string | null) ?? null,
    receiverPhone: (r.receiver_phone as string | null) ?? null,
    note: r.note as string,
    adminNote: r.admin_note as string,
    paymentMethod: r.payment_method as string,
    subtotal: r.subtotal as number,
    shippingFee: r.shipping_fee as number,
    total: r.total as number,
    itemCount: (r.item_count as number | undefined) ?? 0,
    createdAt: iso(r.created_at as Date | string),
    updatedAt: iso(r.updated_at as Date | string),
  };
}

export async function listOrders({ status, q, page }: { status?: OrderStatus; q?: string; page: number }) {
  const sql = db();
  const search = q?.trim() ? q.trim().toLowerCase() : null;
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }], statusCounts] = await Promise.all([
    sql`
      SELECT o.*, (SELECT COALESCE(sum(quantity), 0)::int FROM order_items WHERE order_id = o.id) AS item_count
      FROM orders o
      WHERE (${status ?? null}::text IS NULL OR o.status = ${status ?? null})
        AND (${search}::text IS NULL
             OR position(${search} IN lower(o.code)) > 0
             OR position(${search} IN o.phone) > 0
             OR position(${search} IN lower(o.customer_name)) > 0
             OR position(${search} IN lower(o.email)) > 0)
      ORDER BY o.created_at DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    sql`
      SELECT count(*)::int AS total FROM orders o
      WHERE (${status ?? null}::text IS NULL OR o.status = ${status ?? null})
        AND (${search}::text IS NULL
             OR position(${search} IN lower(o.code)) > 0
             OR position(${search} IN o.phone) > 0
             OR position(${search} IN lower(o.customer_name)) > 0
             OR position(${search} IN lower(o.email)) > 0)
    `,
    sql`SELECT status, count(*)::int AS n FROM orders GROUP BY status`,
  ]);

  return {
    orders: rows.map(toOrder),
    total: total as number,
    pages: Math.max(1, Math.ceil((total as number) / PAGE_SIZE)),
    counts: Object.fromEntries(statusCounts.map((r) => [r.status, r.n])) as Partial<Record<OrderStatus, number>>,
  };
}

export async function getOrder(id: number) {
  const sql = db();
  const [[row], items] = await Promise.all([
    sql`SELECT * FROM orders WHERE id = ${id}`,
    sql`SELECT * FROM order_items WHERE order_id = ${id} ORDER BY id`,
  ]);
  if (!row) return null;
  const orderItems: OrderItem[] = items.map((r) => ({
    id: Number(r.id),
    productId: r.product_id,
    sku: r.sku,
    productName: r.product_name,
    productSlug: r.product_slug,
    image: r.image,
    color: r.color,
    size: r.size,
    unit: r.unit,
    unitPrice: r.unit_price,
    quantity: r.quantity,
  }));
  return { ...toOrder({ ...row, item_count: orderItems.reduce((n, i) => n + i.quantity, 0) }), items: orderItems };
}

/** Số đơn khác của cùng số điện thoại (để nhận biết khách quen). */
export async function countOrdersByPhone(phone: string) {
  const [{ n }] = await db()`SELECT count(*)::int AS n FROM orders WHERE phone = ${phone}`;
  return n as number;
}

// ───────────── Khách hàng (gom theo số điện thoại) ─────────────

export type Customer = {
  phone: string;
  name: string;
  email: string;
  province: string;
  orders: number;
  completedOrders: number;
  cancelledOrders: number;
  spent: number;
  lastOrderAt: string;
};

export async function listCustomers({ q, page }: { q?: string; page: number }) {
  const sql = db();
  const search = q?.trim() ? q.trim().toLowerCase() : null;
  const offset = (page - 1) * PAGE_SIZE;

  const [rows, [{ total }]] = await Promise.all([
    sql`
      SELECT phone,
             (array_agg(customer_name ORDER BY created_at DESC))[1] AS name,
             (array_agg(email ORDER BY created_at DESC))[1]         AS email,
             (array_agg(province ORDER BY created_at DESC))[1]      AS province,
             count(*)::int                                          AS orders,
             count(*) FILTER (WHERE status = 'completed')::int      AS completed_orders,
             count(*) FILTER (WHERE status = 'cancelled')::int      AS cancelled_orders,
             COALESCE(sum(total) FILTER (WHERE status = 'completed'), 0)::bigint AS spent,
             max(created_at)                                        AS last_order_at
      FROM orders
      GROUP BY phone
      HAVING ${search}::text IS NULL
          OR position(${search} IN phone) > 0
          OR bool_or(position(${search} IN lower(customer_name)) > 0)
          OR bool_or(position(${search} IN lower(email)) > 0)
      ORDER BY max(created_at) DESC
      LIMIT ${PAGE_SIZE} OFFSET ${offset}
    `,
    sql`
      SELECT count(*)::int AS total FROM (
        SELECT phone FROM orders GROUP BY phone
        HAVING ${search}::text IS NULL
            OR position(${search} IN phone) > 0
            OR bool_or(position(${search} IN lower(customer_name)) > 0)
            OR bool_or(position(${search} IN lower(email)) > 0)
      ) t
    `,
  ]);

  const customers: Customer[] = rows.map((r) => ({
    phone: r.phone,
    name: r.name,
    email: r.email,
    province: r.province,
    orders: r.orders,
    completedOrders: r.completed_orders,
    cancelledOrders: r.cancelled_orders,
    spent: Number(r.spent),
    lastOrderAt: iso(r.last_order_at),
  }));
  return { customers, total: total as number, pages: Math.max(1, Math.ceil((total as number) / PAGE_SIZE)) };
}

// ───────────── Sản phẩm ─────────────

const PRODUCT_COLUMNS = `p.id, p.slug, p.name, p.category_slug, c.name AS category_name, p.price, p.original_price,
  p.unit, p.sold, p.stock, p.images, p.short_description, p.highlights, p.specs, p.colors, p.sizes,
  p.featured, p.published, p.created_at, p.updated_at`;

/** Tất cả sản phẩm (kể cả đang ẩn) — danh sách nhỏ nên lọc / tìm kiếm ở phía trang. */
export async function listAdminProducts(): Promise<Product[]> {
  const rows = (await db().query(
    `SELECT ${PRODUCT_COLUMNS} FROM products p LEFT JOIN categories c ON c.slug = p.category_slug ORDER BY p.created_at DESC`,
  )) as ProductRow[];
  return rows.map(toProduct);
}

export async function getAdminProduct(id: string): Promise<Product | null> {
  const rows = (await db().query(
    `SELECT ${PRODUCT_COLUMNS} FROM products p LEFT JOIN categories c ON c.slug = p.category_slug WHERE p.id = $1`,
    [id],
  )) as ProductRow[];
  return rows[0] ? toProduct(rows[0]) : null;
}

// ───────────── Danh mục ─────────────

export type AdminCategory = Category & { productCount: number; childCount: number };

export async function listAdminCategories(): Promise<AdminCategory[]> {
  const rows = await db()`
    SELECT c.slug, c.name, c.description, c.image, c.parent_slug, c.sort_order,
           (SELECT count(*)::int FROM products p WHERE p.category_slug = c.slug) AS product_count,
           (SELECT count(*)::int FROM categories ch WHERE ch.parent_slug = c.slug) AS child_count
    FROM categories c
    ORDER BY c.sort_order, c.name
  `;
  return rows.map((r) => ({
    ...toCategory(r as CategoryRow),
    productCount: r.product_count,
    childCount: r.child_count,
  }));
}

export async function getAdminCategory(slug: string) {
  const rows = (await db()`
    SELECT slug, name, description, image, parent_slug, sort_order FROM categories WHERE slug = ${slug}
  `) as CategoryRow[];
  return rows[0] ? toCategory(rows[0]) : null;
}
