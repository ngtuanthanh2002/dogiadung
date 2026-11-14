# Đại Kiều — Website bán hàng (Next.js)

Website bán hàng gia dụng, quần áo và vải. Giao diện tối giản, sang trọng; chức năng tương tự daikieu.com:
tìm kiếm, xem theo danh mục, trang sản phẩm (chọn màu / kích cỡ / số lượng), giỏ hàng và đặt hàng
**thanh toán khi nhận hàng (COD)**.

## Chạy dự án

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm run start   # bản production
```

Đặt domain thật cho sitemap, canonical, Open Graph:

```bash
NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban.com
```

## Các trang

| Đường dẫn | Nội dung |
| --- | --- |
| `/` | Trang chủ: banner, dải danh mục con, 10 sản phẩm nổi bật, khối theo từng danh mục lớn, 15 sản phẩm gợi ý |
| `/san-pham` | Tất cả sản phẩm: bộ lọc bên trái (danh mục, khoảng giá `?min=&max=`, đang giảm giá `?sale=1`), tìm kiếm `?q=`, sắp xếp `?sort=` |
| `/danh-muc/[slug]` | Hàng gia dụng (nấu nướng, làm mát & sưởi, vệ sinh nhà cửa, nhà bếp, chăn ga gối, đèn & trang trí, nội thất), Quần áo, Vải |
| `/san-pham/[slug]` | Chi tiết sản phẩm, thêm vào giỏ / mua ngay |
| `/thanh-toan` | Giỏ hàng + thông tin nhận hàng + đặt hàng COD |
| `/dang-nhap`, `/tai-khoan` | Đăng nhập bằng Google, trang tài khoản (đăng xuất) |
| `/gioi-thieu`, `/lien-he`, `/chinh-sach/[slug]` | Giới thiệu, liên hệ, chính sách |

## Chức năng

- **Tìm kiếm**: thanh tìm kiếm giữa header, hiện "Tìm kiếm phổ biến" khi bấm vào; menu danh mục nằm ngay bên dưới.
- **Giỏ hàng**: lưu trong trình duyệt (`src/lib/cart-store.ts`), mở dạng ngăn kéo từ biểu tượng túi.
- **Đặt hàng**: server action `src/app/thanh-toan/actions.ts` kiểm tra dữ liệu và **tự tính lại tổng tiền** từ dữ liệu sản phẩm.
  Đơn hàng hiện **chưa được lưu** — cần nối hàm `saveOrder()` với API / cơ sở dữ liệu / email.
- Vải bán theo mét (`unit` trong dữ liệu sản phẩm), quần áo có chọn kích cỡ.

## Đăng nhập Google (Auth.js)

1. Vào [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials), tạo **OAuth client ID** loại *Web application*.
2. Thêm *Authorized redirect URI*: `http://localhost:3000/api/auth/callback/google` (và `https://<domain>/api/auth/callback/google` khi chạy thật).
3. Điền vào `.env.local` (đã có sẵn `AUTH_SECRET`):

```bash
AUTH_GOOGLE_ID=...apps.googleusercontent.com
AUTH_GOOGLE_SECRET=...
```

4. Chạy lại `npm run dev` (hoặc build lại). Chưa điền thì trang đăng nhập sẽ báo "chưa được bật".

Phiên đăng nhập lưu trong cookie (JWT), không cần cơ sở dữ liệu. Khi đăng nhập, họ tên & email được điền sẵn ở trang thanh toán.

## SEO

- Metadata riêng từng trang (title, description, canonical, Open Graph, Twitter) — `src/lib/seo.ts`
- JSON-LD: `OnlineStore`, `WebSite` + ô tìm kiếm, `Product`/`Offer` (COD, phí giao hàng, đổi trả), `BreadcrumbList`, `CollectionPage`, `FAQPage`
- `sitemap.xml`, `robots.txt`, manifest, favicon, ảnh chia sẻ; trang thanh toán `noindex`
- Trang tĩnh prerender sẵn; slug không tồn tại trả về 404 thật (`src/proxy.ts`)

## Cần chỉnh trước khi chạy thật

1. Thông tin doanh nghiệp (hotline, email, địa chỉ, MST, giấy phép) trong `src/config/site.ts` — đang là giá trị mẫu.
2. Sản phẩm trong `src/data/products.ts` là dữ liệu mẫu — thay bằng dữ liệu / API thật.
3. Kết nối lưu đơn hàng trong `saveOrder()`.
4. Ảnh trong `public/images` lấy từ [Unsplash](https://unsplash.com/license) (miễn phí sử dụng thương mại).

## Cấu trúc

```
src/
  app/              # các trang (App Router), sitemap, robots, manifest, icon
    thanh-toan/actions.ts   # server action đặt hàng
  components/
    layout/         # header, menu, tìm kiếm, footer
    cart/           # nút giỏ hàng, ngăn kéo giỏ hàng
    checkout/       # form thanh toán
    product/ listing/ content/ ui/ icons/
  config/site.ts    # thông tin thương hiệu
  data/             # danh mục, sản phẩm, chính sách, tỉnh thành
  lib/              # cart-store, SEO, tiện ích
  proxy.ts          # trả 404 cho slug không tồn tại
```
