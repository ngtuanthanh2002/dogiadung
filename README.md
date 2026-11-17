# Phú Ngọ — Website bán hàng (Next.js)

Website bán hàng gia dụng, quần áo và vải. Giao diện tối giản, sang trọng; gồm:
tìm kiếm, xem theo danh mục, trang sản phẩm (chọn màu / kích cỡ / số lượng), giỏ hàng và đặt hàng
**thanh toán khi nhận hàng (COD)**. Khách **không cần tài khoản** — không có đăng nhập Google hay đăng ký.

Dữ liệu (sản phẩm, danh mục, đơn hàng) lưu trên **Neon PostgreSQL**, ảnh lưu trên **ImageKit**.
👉 **Hướng dẫn cài đặt từng bước & cách dùng trang quản trị: [docs/setup.md](docs/setup.md)**

## Chạy dự án

```bash
npm install
cp .env.example .env.local      # rồi điền giá trị theo docs/setup.md
npm run db:setup && npm run db:seed
npm run dev                     # http://localhost:3000
```

| Lệnh | Việc |
| --- | --- |
| `npm run db:check` | Kiểm tra kết nối Neon, đếm dữ liệu |
| `npm run db:setup` | Tạo / cập nhật bảng (an toàn khi chạy lại) |
| `npm run db:seed` | Nạp danh mục + sản phẩm mẫu |
| `npm run imagekit:check` | Kiểm tra kết nối ImageKit |
| `npm run build && npm run start` | Bản production (build cần `DATABASE_URL`) |

## Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ: banner, dải danh mục con, sản phẩm nổi bật, khối theo từng danh mục lớn, sản phẩm gợi ý |
| `/san-pham` | Tất cả sản phẩm: bộ lọc bên trái (danh mục, khoảng giá, đang giảm giá), tìm kiếm `?q=`, sắp xếp `?sort=` |
| `/danh-muc/[slug]` | Sản phẩm theo danh mục |
| `/san-pham/[slug]` | Chi tiết sản phẩm, thêm vào giỏ / mua ngay |
| `/thanh-toan` | Giỏ hàng + thông tin nhận hàng + đặt hàng COD |
| `/gioi-thieu`, `/lien-he`, `/chinh-sach/[slug]` | Giới thiệu, liên hệ, chính sách |
| `/dang-nhap` | Đăng nhập **quản trị** (1 tài khoản duy nhất, khai báo trong `.env.local`) — mở từ icon người dùng ở góc phải header |
| `/admin` | Trang quản trị: tổng quan, đơn hàng, sản phẩm, danh mục, khách hàng |

## Chức năng

- **Giỏ hàng**: lưu trong trình duyệt, chỉ lưu mã sản phẩm + số lượng (`src/lib/cart-store.ts`); thông tin & giá lấy mới từ `/api/cart`.
- **Đặt hàng**: `src/app/(shop)/thanh-toan/actions.ts` → hàm DB `place_order` tạo đơn và trừ tồn kho trong một giao dịch, giá tính lại từ DB.
- **Quản trị**: đăng sản phẩm (tải ảnh lên ImageKit), quản lý danh mục, xử lý đơn (hủy đơn tự hoàn kho), xem khách đã đặt hàng.
- Vải bán theo mét (`unit`), quần áo có chọn kích cỡ / màu.

## SEO

- Metadata riêng từng trang (title, description, canonical, Open Graph, Twitter) — `src/lib/seo.ts`
- JSON-LD: `OnlineStore`, `WebSite` + ô tìm kiếm, `Product`/`Offer` (COD, phí giao hàng, đổi trả), `BreadcrumbList`, `CollectionPage`, `FAQPage`
- `sitemap.xml` (đọc từ DB), `robots.txt` (chặn `/admin`, `/dang-nhap`, `/thanh-toan`), manifest, favicon, ảnh chia sẻ

## Cần chỉnh trước khi chạy thật

1. Thông tin doanh nghiệp (hotline, email, địa chỉ, MST, giấy phép) trong `src/config/site.ts` — đang là giá trị mẫu.
2. Sản phẩm mẫu: xóa / sửa trong trang `/admin/san-pham` (hoặc không chạy `db:seed`).
3. Ảnh mẫu trong `public/images` lấy từ [Unsplash](https://unsplash.com/license) (miễn phí sử dụng thương mại).

## Cấu trúc

```
src/
  app/
    (shop)/           # các trang cửa hàng (dùng header/footer chung)
    admin/            # trang quản trị (layout riêng) + Server Actions
    api/cart/         # thông tin sản phẩm cho giỏ hàng
  auth.ts             # đăng nhập quản trị (Auth.js, 1 tài khoản từ biến môi trường)
  components/         # layout, cart, checkout, product, listing, admin, ui
  db/                 # schema.ts (cấu trúc DB), seed-*.ts (dữ liệu mẫu)
  lib/
    catalog.ts        # đọc sản phẩm / danh mục cho cửa hàng (có cache)
    admin/            # truy vấn & quyền cho trang quản trị
    db.ts, imagekit.ts
  proxy.ts            # chặn /admin khi chưa đăng nhập; 404 trang chính sách sai
scripts/              # db.ts, imagekit-check.ts
docs/setup.md         # hướng dẫn cài đặt & sử dụng
```
