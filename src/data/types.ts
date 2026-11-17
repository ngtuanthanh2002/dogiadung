export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  /** slug danh mục cha — để trống với danh mục cấp 1 */
  parent?: string;
  /** Thứ tự hiển thị (nhỏ đứng trước) */
  sortOrder?: number;
};

export type ProductColor = { name: string; hex: string };

export type Product = {
  id: string;
  slug: string;
  name: string;
  /** slug danh mục con */
  categorySlug: string;
  price: number;
  originalPrice?: number;
  /** Đơn vị bán, ví dụ "mét" với vải. Mặc định là sản phẩm. */
  unit?: string;
  sold: number;
  stock: number;
  images: string[];
  shortDescription: string;
  highlights: string[];
  specs: { label: string; value: string }[];
  colors?: ProductColor[];
  sizes?: string[];
  featured?: boolean;
  /** false = đang ẩn, không hiện trên cửa hàng */
  published?: boolean;
  /** Tên danh mục (lấy kèm khi đọc từ DB) */
  categoryName?: string;
  createdAt: string;
  updatedAt?: string;
};

export const ORDER_STATUSES = ["new", "confirmed", "shipping", "completed", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  new: "Mới",
  confirmed: "Đã xác nhận",
  shipping: "Đang giao",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

export type OrderItem = {
  id: number;
  productId: string | null;
  sku: string;
  productName: string;
  productSlug: string;
  image: string;
  color: string | null;
  size: string | null;
  unit: string | null;
  unitPrice: number;
  quantity: number;
};

export type Order = {
  id: number;
  code: string;
  status: OrderStatus;
  customerName: string;
  phone: string;
  email: string;
  province: string;
  ward: string;
  address: string;
  receiverName: string | null;
  receiverPhone: string | null;
  note: string;
  adminNote: string;
  paymentMethod: string;
  subtotal: number;
  shippingFee: number;
  total: number;
  itemCount: number;
  createdAt: string;
  updatedAt: string;
};

/** Thông tin rút gọn trả về từ /api/cart cho các sản phẩm trong giỏ hàng. */
export type CartProduct = Pick<Product, "id" | "slug" | "name" | "price" | "unit" | "stock"> & {
  image: string;
};

export type ContentBlock =
  | { type: "h2"; text: string }
  | { type: "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export type Policy = {
  slug: string;
  title: string;
  description: string;
  updatedAt: string;
  content: ContentBlock[];
};
