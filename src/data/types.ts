export type Category = {
  slug: string;
  name: string;
  description: string;
  image: string;
  /** slug danh mục cha — để trống với danh mục cấp 1 */
  parent?: string;
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
  createdAt: string;
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
