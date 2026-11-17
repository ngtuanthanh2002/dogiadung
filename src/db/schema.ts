/**
 * Cấu trúc cơ sở dữ liệu trên Neon. Chạy `npm run db:setup` để tạo / cập nhật
 * (mọi câu lệnh đều an toàn khi chạy lại nhiều lần, không xóa dữ liệu).
 *
 * Bảng:
 *   categories   danh mục (2 cấp: cha → con)
 *   products     sản phẩm
 *   orders       đơn hàng (khách không cần tài khoản — mỗi lần đặt là một dòng)
 *   order_items  sản phẩm trong đơn (lưu bản sao tên/giá tại thời điểm đặt)
 *   media        ảnh đã tải lên ImageKit (để xóa ảnh khi không còn dùng)
 * Hàm:
 *   place_order  tạo đơn + trừ tồn kho trong MỘT giao dịch (hết hàng → hủy toàn bộ)
 */
export const schemaStatements = [
  // ───────────── Danh mục ─────────────
  `CREATE TABLE IF NOT EXISTS categories (
    slug        text PRIMARY KEY CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name        text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
    description text NOT NULL DEFAULT '',
    image       text NOT NULL DEFAULT '',
    parent_slug text REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT,
    sort_order  integer NOT NULL DEFAULT 0,
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now(),
    CHECK (parent_slug IS NULL OR parent_slug <> slug)
  )`,
  `CREATE INDEX IF NOT EXISTS categories_parent_idx ON categories (parent_slug)`,

  // ───────────── Sản phẩm ─────────────
  `CREATE TABLE IF NOT EXISTS products (
    id                text PRIMARY KEY CHECK (id ~ '^[A-Za-z0-9_-]{1,40}$'),
    slug              text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    name              text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
    category_slug     text NOT NULL,
    price             integer NOT NULL CHECK (price >= 0),
    original_price    integer CHECK (original_price IS NULL OR original_price > price),
    unit              text,
    sold              integer NOT NULL DEFAULT 0 CHECK (sold >= 0),
    stock             integer NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images            text[] NOT NULL DEFAULT '{}',
    short_description text NOT NULL DEFAULT '',
    highlights        text[] NOT NULL DEFAULT '{}',
    specs             jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(specs) = 'array'),
    colors            jsonb NOT NULL DEFAULT '[]'::jsonb CHECK (jsonb_typeof(colors) = 'array'),
    sizes             text[] NOT NULL DEFAULT '{}',
    featured          boolean NOT NULL DEFAULT false,
    published         boolean NOT NULL DEFAULT true,
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now()
  )`,
  // Bảng products tạo ở phiên bản trước chưa có cột published / khóa ngoại danh mục
  `ALTER TABLE products ADD COLUMN IF NOT EXISTS published boolean NOT NULL DEFAULT true`,
  `DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'products_category_slug_fkey') THEN
      ALTER TABLE products ADD CONSTRAINT products_category_slug_fkey FOREIGN KEY (category_slug)
        REFERENCES categories(slug) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;
    END IF;
  END $$`,
  `CREATE INDEX IF NOT EXISTS products_category_slug_idx ON products (category_slug)`,

  // ───────────── Đơn hàng ─────────────
  `CREATE TABLE IF NOT EXISTS orders (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code           text NOT NULL UNIQUE,
    status         text NOT NULL DEFAULT 'new'
                   CHECK (status IN ('new', 'confirmed', 'shipping', 'completed', 'cancelled')),
    customer_name  text NOT NULL,
    phone          text NOT NULL,
    email          text NOT NULL,
    province       text NOT NULL,
    ward           text NOT NULL,
    address        text NOT NULL,
    receiver_name  text,
    receiver_phone text,
    note           text NOT NULL DEFAULT '',
    admin_note     text NOT NULL DEFAULT '',
    payment_method text NOT NULL DEFAULT 'COD',
    subtotal       integer NOT NULL DEFAULT 0 CHECK (subtotal >= 0),
    shipping_fee   integer NOT NULL DEFAULT 0 CHECK (shipping_fee >= 0),
    total          integer NOT NULL DEFAULT 0 CHECK (total >= 0),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now()
  )`,
  `CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status, created_at DESC)`,
  `CREATE INDEX IF NOT EXISTS orders_phone_idx ON orders (phone)`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id           bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    order_id     bigint NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id   text REFERENCES products(id) ON DELETE SET NULL,
    sku          text NOT NULL,
    product_name text NOT NULL,
    product_slug text NOT NULL,
    image        text NOT NULL DEFAULT '',
    color        text,
    size         text,
    unit         text,
    unit_price   integer NOT NULL CHECK (unit_price >= 0),
    quantity     integer NOT NULL CHECK (quantity > 0)
  )`,
  `CREATE INDEX IF NOT EXISTS order_items_order_idx ON order_items (order_id)`,
  `CREATE INDEX IF NOT EXISTS order_items_product_idx ON order_items (product_id)`,

  // ───────────── Ảnh trên ImageKit ─────────────
  `CREATE TABLE IF NOT EXISTS media (
    file_id    text PRIMARY KEY,
    url        text NOT NULL UNIQUE,
    file_path  text NOT NULL,
    size_bytes integer NOT NULL DEFAULT 0,
    width      integer,
    height     integer,
    created_at timestamptz NOT NULL DEFAULT now()
  )`,

  // ───────────── Đặt hàng: tạo đơn + trừ kho, nguyên tử ─────────────
  // Giá lấy từ bảng products tại thời điểm đặt (không tin giá từ trình duyệt).
  // Thiếu hàng → RAISE 'OUT_OF_STOCK' (DETAIL = mã sản phẩm) → toàn bộ giao dịch bị hủy.
  `CREATE OR REPLACE FUNCTION place_order(
    p_order jsonb, p_items jsonb, p_free_threshold integer, p_shipping_fee integer
  ) RETURNS TABLE (out_id bigint, out_code text, out_total integer, out_count integer)
  LANGUAGE plpgsql AS $fn$
  DECLARE
    v_item     jsonb;
    v_qty      integer;
    v_prod     products%ROWTYPE;
    v_id       bigint;
    v_subtotal integer := 0;
    v_count    integer := 0;
    v_shipping integer;
  BEGIN
    INSERT INTO orders (code, customer_name, phone, email, province, ward, address, receiver_name, receiver_phone, note)
    VALUES (p_order->>'code', p_order->>'customerName', p_order->>'phone', p_order->>'email', p_order->>'province',
            p_order->>'ward', p_order->>'address', p_order->>'receiverName', p_order->>'receiverPhone',
            COALESCE(p_order->>'note', ''))
    RETURNING id INTO v_id;

    FOR v_item IN SELECT value FROM jsonb_array_elements(p_items) LOOP
      v_qty := (v_item->>'quantity')::integer;
      IF v_qty IS NULL OR v_qty <= 0 THEN
        RAISE EXCEPTION 'INVALID_QUANTITY';
      END IF;

      UPDATE products SET stock = stock - v_qty, sold = sold + v_qty, updated_at = now()
       WHERE id = v_item->>'id' AND published AND stock >= v_qty
       RETURNING * INTO v_prod;
      IF NOT FOUND THEN
        RAISE EXCEPTION 'OUT_OF_STOCK' USING DETAIL = COALESCE(v_item->>'id', '');
      END IF;

      INSERT INTO order_items (order_id, product_id, sku, product_name, product_slug, image, color, size, unit, unit_price, quantity)
      VALUES (v_id, v_prod.id, v_prod.id, v_prod.name, v_prod.slug, COALESCE(v_prod.images[1], ''),
              v_item->>'color', v_item->>'size', v_prod.unit, v_prod.price, v_qty);

      v_subtotal := v_subtotal + v_prod.price * v_qty;
      v_count := v_count + v_qty;
    END LOOP;

    IF v_count = 0 THEN
      RAISE EXCEPTION 'EMPTY_ORDER';
    END IF;

    v_shipping := CASE WHEN v_subtotal >= p_free_threshold THEN 0 ELSE p_shipping_fee END;
    UPDATE orders SET subtotal = v_subtotal, shipping_fee = v_shipping, total = v_subtotal + v_shipping
     WHERE id = v_id;

    RETURN QUERY SELECT v_id, p_order->>'code', v_subtotal + v_shipping, v_count;
  END
  $fn$`,
];
