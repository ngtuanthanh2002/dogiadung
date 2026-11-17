# Hướng dẫn cài đặt & sử dụng (Neon + ImageKit + trang quản trị)

Website lưu **sản phẩm, danh mục, đơn hàng** trên **Neon** (PostgreSQL) và **ảnh** trên **ImageKit**.
Cả hai đều dùng gói **miễn phí**, không cần thẻ thanh toán.

> Các thông tin bí mật (mật khẩu DB, Private key ImageKit, mật khẩu admin) chỉ để trong file `.env.local` trên máy
> và trong Environment Variables của nơi deploy (Vercel…). **Không** commit lên git, **không** gửi qua chat.

---

## ✅ Việc bạn cần làm (theo thứ tự)

| # | Việc | Mất khoảng | Chi tiết |
| --- | --- | --- | --- |
| 1 | Tạo file `.env.local` từ `.env.example` | 1 phút | [Mục 1](#1-tạo-file-envlocal) |
| 2 | Tạo tài khoản + project **Neon**, dán `DATABASE_URL` | 5 phút | [Mục 2](#2-neon-postgresql) |
| 3 | Chạy `npm run db:setup` rồi `npm run db:seed` | 1 phút | [Mục 2.3](#23-tạo-bảng--nạp-dữ-liệu-mẫu) |
| 4 | Tạo tài khoản **ImageKit**, dán `IMAGEKIT_PRIVATE_KEY` + `IMAGEKIT_URL_ENDPOINT` | 5 phút | [Mục 3](#3-imagekit) |
| 5 | Chạy `npm run imagekit:check` | 1 phút | [Mục 3.3](#33-kiểm-tra) |
| 6 | Đặt `AUTH_SECRET`, `ADMIN_USERNAME`, `ADMIN_PASSWORD` | 2 phút | [Mục 4](#4-tài-khoản-quản-trị) |
| 7 | **Khởi động lại** `npm run dev` (bắt buộc sau khi sửa `.env.local`) → vào `/dang-nhap` | 1 phút | [Mục 5](#5-chạy-thử-trên-máy) |
| 8 | Đặt thử 1 đơn trên website → kiểm tra trong `/admin/don-hang` | 2 phút | [Mục 5](#5-chạy-thử-trên-máy) |
| 9 | Khi deploy: thêm **cùng các biến** vào Vercel → Redeploy | 5 phút | [Mục 6](#6-deploy-lên-vercel) |
| 10 | (Tùy chọn) Xóa sản phẩm mẫu, đăng sản phẩm thật | — | [Mục 7](#7-hướng-dẫn-dùng-trang-quản-trị) |

---

## 1. Tạo file `.env.local`

Ở thư mục gốc dự án:

```bash
cp .env.example .env.local
```

Website **không dùng đăng nhập Google**. Nếu `.env.local` cũ còn các dòng `AUTH_GOOGLE_*` hoặc `R2_*` thì xóa đi.
Nội dung cuối cùng cần có:

```env
NEXT_PUBLIC_SITE_URL=https://phungo.vn
DATABASE_URL=postgresql://...            # mục 2
IMAGEKIT_PRIVATE_KEY=private_...         # mục 3
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/tencuaban
AUTH_SECRET=...                          # mục 4
ADMIN_USERNAME=admin
ADMIN_PASSWORD=...                       # ≥ 12 ký tự
```

---

## 2. Neon PostgreSQL

### 2.1. Tạo tài khoản & project

1. Vào <https://neon.com> → **Sign up** bằng email (đây là tài khoản Neon của riêng bạn, không liên quan tới website). Gói Free không cần thẻ.
2. Bấm **New Project**:
   - **Project name**: `webbanhang`
   - **Postgres version**: để mặc định
   - **Cloud provider**: **AWS**
   - **Region**: **Asia Pacific (Singapore)** — `ap-southeast-1`, gần Việt Nam nhất
   - **Create project**
3. Neon tạo sẵn database `neondb`, user `neondb_owner`, branch `production` (hoặc `main`). Dùng luôn.

### 2.2. Lấy `DATABASE_URL`

1. Trong trang project bấm nút **Connect** (góc trên phải).
2. Chọn Branch `production`, Database `neondb`, Role `neondb_owner`, **bật Connection pooling**.
3. Bấm **Show password** → **Copy snippet**. Chuỗi có dạng:

   ```
   postgresql://neondb_owner:AbCd123@ep-cool-name-a1b2c3-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
   ```

4. Dán vào `.env.local` sau `DATABASE_URL=`.

> Lộ mật khẩu? Neon → **Branches → production → Roles & Databases → neondb_owner → Reset password**, rồi cập nhật lại ở mọi nơi.

### 2.3. Tạo bảng & nạp dữ liệu mẫu

```bash
npm run db:setup    # tạo bảng: categories, products, orders, order_items, media + hàm place_order
npm run db:seed     # nạp 17 danh mục + 53 sản phẩm mẫu (đã có thì bỏ qua)
npm run db:check    # kiểm tra
```

Kết quả `db:check` mong đợi:

```
✓ Kết nối Neon thành công
  Bảng categories: 17 dòng
  Bảng products: 53 dòng
  Bảng orders: 0 dòng
  Bảng media: 0 dòng
```

- `db:setup` chạy lại bao nhiêu lần cũng được (không xóa dữ liệu) — **chạy lại mỗi khi cập nhật code mới** có thay đổi bảng.
- `db:seed` là tùy chọn. Không muốn dữ liệu mẫu thì bỏ qua và tự tạo danh mục / sản phẩm trong trang admin.

---

## 3. ImageKit

### 3.1. Tạo tài khoản

1. Vào <https://imagekit.io> → **Sign up free** bằng email (tài khoản ImageKit của riêng bạn). Gói Free không cần thẻ.
2. Khi được hỏi:
   - **ImageKit ID**: tên ngắn, viết liền, ví dụ `phungo` → địa chỉ ảnh sẽ là `https://ik.imagekit.io/phungo/...`
     (không đổi được sau này, nên chọn cẩn thận).
   - **Region / Storage location**: chọn **Singapore** (hoặc gần Việt Nam nhất có trong danh sách).
3. Hoàn tất các bước giới thiệu (có thể bỏ qua).

### 3.2. Lấy khóa API

1. Trong Dashboard, menu trái chọn **Developer options** (biểu tượng `</>`; một số giao diện ghi là **Developer → API keys**).
2. Bạn sẽ thấy 3 giá trị:

   | Trên ImageKit | Dán vào `.env.local` | Ghi chú |
   | --- | --- | --- |
   | **URL-endpoint** — `https://ik.imagekit.io/phungo` | `IMAGEKIT_URL_ENDPOINT` | Không có `/` ở cuối |
   | **Private key** — bắt đầu bằng `private_` | `IMAGEKIT_PRIVATE_KEY` | Bấm biểu tượng con mắt / copy. **Bí mật!** |
   | Public key — bắt đầu bằng `public_` | (không cần) | |

```env
IMAGEKIT_PRIVATE_KEY=private_AbCdEf1234567890=
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/phungo
```

> Private key cho phép xóa / ghi đè mọi ảnh của bạn. Lộ key: Developer options → **Regenerate** private key, rồi cập nhật lại ở mọi nơi.

### 3.3. Kiểm tra

```bash
npm run imagekit:check
```

Kết quả mong đợi:

```
✓ Tải ảnh thử lên ImageKit thành công
✓ Mở được ảnh qua URL công khai: https://ik.imagekit.io/phungo
✓ Đã xóa ảnh thử
```

Ảnh website tải lên nằm trong thư mục `/webbanhang/products` và `/webbanhang/categories` ở **Media Library** của ImageKit.

---

## 4. Tài khoản quản trị

Chỉ có **một** tài khoản — tài khoản quản trị. Khách mua hàng **không cần** tài khoản.

```env
# Tạo bằng: npx auth secret   (tự ghi vào .env.local), hoặc:
#   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
AUTH_SECRET=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=mot-mat-khau-dai-kho-doan-2026
```

- Mật khẩu **ít nhất 12 ký tự** (ngắn hơn → hệ thống từ chối mọi lần đăng nhập).
- Đăng nhập: bấm **icon người dùng** ở góc phải header (hoặc vào `/dang-nhap`). Tích **Ghi nhớ đăng nhập** (mặc định) → giữ đăng nhập 30 ngày và tự điền tên đăng nhập lần sau; bỏ tích → tự đăng xuất sau 8 giờ. Mật khẩu không lưu trong trình duyệt của website — hãy để trình duyệt (Chrome, Safari…) ghi nhớ khi được hỏi.
- Đổi mật khẩu: sửa `ADMIN_PASSWORD` → khởi động lại / deploy lại. Đăng xuất mọi thiết bị: đổi `AUTH_SECRET`.

---

## 5. Chạy thử trên máy

```bash
npm install
npm run dev          # nếu đang chạy, Ctrl+C rồi chạy lại để nhận .env.local mới
```

Kiểm tra theo thứ tự:

1. <http://localhost:3000> hiện sản phẩm → đọc Neon thành công.
2. Thêm sản phẩm vào giỏ → **Tiến hành thanh toán** → điền thông tin → **Đặt hàng**.
3. <http://localhost:3000/dang-nhap> → đăng nhập → tự chuyển sang **/admin**.
4. Mục **Đơn hàng** thấy đơn vừa đặt; mục **Khách hàng** thấy người vừa đặt; tồn kho sản phẩm đã giảm.
5. **Sản phẩm → Thêm sản phẩm** → tải thử 1 ảnh → lưu → mở trang sản phẩm trên cửa hàng.

> `npm run build` **cần** `DATABASE_URL` hợp lệ: lúc build, Next.js đọc DB để tạo sẵn trang sản phẩm / danh mục.

---

## 6. Deploy lên Vercel

1. Vercel → Project → **Settings → Environment Variables** → thêm **tất cả** biến ở mục 1 (Production + Preview).
2. **Settings → Functions → Function Region** → **Singapore (sin1)** (cùng khu vực với Neon).
3. **Deployments → ⋯ → Redeploy** để biến mới có hiệu lực.
4. Khi cập nhật code có thay đổi bảng: chạy `npm run db:setup` trên máy (trỏ cùng `DATABASE_URL`) **trước** khi deploy.

---

## 7. Hướng dẫn dùng trang quản trị

Địa chỉ: **`/admin`** (ghi rõ "Chỉ dành cho nhà quản trị"). Menu bên trái:

### Tổng quan
- Số **đơn mới** cần gọi xác nhận, đơn đang xử lý, doanh thu tháng (đơn đã hoàn thành), đơn hôm nay.
- **Đơn mới nhất** và **sản phẩm sắp hết hàng** (≤ 5).
- Nút **Dọn ảnh không dùng**: xóa trên ImageKit ảnh đã tải lên nhưng không sản phẩm / danh mục nào dùng (giải phóng dung lượng).

### Đơn hàng — quy trình xử lý
Khách đặt hàng trên website (COD, không cần tài khoản) → đơn tự lưu vào hệ thống với trạng thái **Mới** và **tồn kho tự trừ**.

| Trạng thái | Việc cần làm | Nút trong trang chi tiết |
| --- | --- | --- |
| **Mới** | Gọi điện cho khách xác nhận (nút **Gọi** có sẵn) | **Xác nhận đơn** |
| **Đã xác nhận** | Đóng gói, giao cho đơn vị vận chuyển | **Đã giao cho vận chuyển** |
| **Đang giao** | Chờ khách nhận & trả tiền | **Đã giao & thu tiền** |
| **Hoàn thành** | Xong — được tính vào doanh thu | |
| **Đã hủy** | Tồn kho **tự cộng lại**. Không mở lại được. Có thể xóa hẳn đơn (đơn rác / thử) | |

- Lọc theo trạng thái, tìm theo **mã đơn, số điện thoại, tên, email**.
- **Ghi chú nội bộ**: chỉ admin thấy (mã vận đơn, giờ hẹn giao…).
- Nhãn **Khách quen** cho biết số điện thoại này đã từng đặt bao nhiêu đơn.

### Sản phẩm
- **Thêm sản phẩm**: tên (đường dẫn tự tạo), danh mục, giá bán, giá gốc (để hiện % giảm), tồn kho, ảnh (chọn nhiều ảnh cùng lúc; ảnh đầu = ảnh đại diện; dùng mũi tên để đổi thứ tự), mô tả, đặc điểm nổi bật (mỗi dòng 1 ý), thông số, màu sắc, kích cỡ.
- Ảnh tự **thu nhỏ** (cạnh dài 1600px, WebP) trước khi tải lên → tiết kiệm dung lượng ImageKit.
- **Đang bán** (bỏ chọn = ẩn khỏi cửa hàng, giữ dữ liệu) · **Nổi bật** (hiện ở trang chủ).
- **Mã sản phẩm (SKU)** không đổi được sau khi tạo (giỏ hàng của khách lưu theo mã này).
- Xóa sản phẩm: xóa luôn ảnh trên ImageKit; đơn hàng cũ vẫn giữ tên & giá lúc đặt.
- Mọi thay đổi hiện **ngay lập tức** trên cửa hàng.

### Danh mục
- 2 cấp: **danh mục cấp 1** (hiện trên menu, mỗi danh mục một "tầng" ở trang chủ) và **danh mục con**.
- **Thứ tự**: số nhỏ đứng trước. Đổi đường dẫn → sản phẩm tự theo.
- Chỉ xóa được danh mục **trống** (không còn sản phẩm và danh mục con).

### Khách hàng
- Danh sách những người đã đặt hàng, **gom theo số điện thoại**: số đơn, số đơn hủy (cảnh báo khách "bom hàng"), tổng đã mua, lần đặt gần nhất.
- Bấm vào khách → xem toàn bộ đơn của họ.

---

## 8. Hạn mức gói Free & mẹo tiết kiệm

### Neon Free (theo tài liệu Neon, 10/2026)

| Hạng mục | Hạn mức |
| --- | --- |
| Dung lượng | 1 GB / project (≈ hàng chục nghìn sản phẩm + đơn hàng; ảnh nằm ở ImageKit) |
| Compute | 100 CU-giờ / project / tháng |
| Tự "ngủ" | Sau 5 phút không có truy vấn |

Website giữ DB "ngủ" phần lớn thời gian: dữ liệu cửa hàng được **cache 1 giờ**, trang sản phẩm tạo sẵn lúc build,
chỉ khi khách **đặt hàng** hoặc admin **thao tác** mới chạm DB. Truy vấn đầu tiên sau khi DB ngủ chậm thêm ~0,5 giây.

### ImageKit Free

Theo các nguồn tổng hợp (11/2026): khoảng **20 GB băng thông / tháng** và **~3 GB lưu trữ** — xem con số chính xác
tại **Dashboard → Usage** hoặc trang Pricing của ImageKit, vì hạn mức có thể thay đổi.

- Ảnh đã được thu nhỏ trước khi tải lên (thường 100–300 KB/ảnh) → 3 GB ≈ 10.000+ ảnh.
- Website hiển thị ảnh qua bộ tối ưu của Next.js (Vercel) nên ImageKit chỉ bị đọc khi bộ nhớ đệm hết hạn → tiết kiệm băng thông.
- Thỉnh thoảng bấm **Dọn ảnh không dùng** ở trang Tổng quan.

---

## 9. Xử lý lỗi thường gặp

| Triệu chứng | Cách xử lý |
| --- | --- |
| `Thiếu DATABASE_URL` | Chưa có `.env.local` ở thư mục gốc, hoặc sai tên biến. |
| `password authentication failed` | Copy thiếu mật khẩu (chưa bấm *Show password*). Copy lại chuỗi. |
| `relation "categories" does not exist` / trang trắng | Chưa chạy `npm run db:setup`. |
| Trang chủ không có sản phẩm | DB trống — chạy `npm run db:seed` hoặc thêm sản phẩm trong admin. |
| Sửa `.env.local` nhưng không có tác dụng | Phải tắt & chạy lại `npm run dev`. |
| `imagekit:check` báo HTTP 401/403 | Sai `IMAGEKIT_PRIVATE_KEY` (hay nhầm với Public key). |
| Ảnh ImageKit không hiện, lỗi `hostname ... is not configured` | `IMAGEKIT_URL_ENDPOINT` sai / chưa khởi động lại / chưa deploy lại. |
| Tải ảnh trong admin báo "Chưa cấu hình ImageKit" | Thiếu một trong hai biến `IMAGEKIT_*`. |
| Đăng nhập báo sai dù gõ đúng | `ADMIN_PASSWORD` < 12 ký tự, hoặc chưa khởi động lại. |
| Khách báo "sản phẩm vừa hết hàng" khi đặt | Tồn kho không đủ — tăng tồn kho trong trang sửa sản phẩm. |
| `npm run build` lỗi ở `/san-pham/[slug]` | Máy build không có / sai `DATABASE_URL`. |

---

## 10. Kiến trúc tóm tắt (cho lập trình viên)

```
Cửa hàng (app/(shop))                      Quản trị (app/admin) — requireAdmin() ở mọi trang & action
  ├─ đọc qua src/lib/catalog.ts              ├─ đọc qua src/lib/admin/queries.ts (không cache)
  │   "use cache" + tag products/categories  ├─ actions.ts trong từng mục: lưu → updateTag(...) → cửa hàng cập nhật ngay
  ├─ giỏ hàng: localStorage [{id, qty,...}]  └─ ảnh: uploadImage → ImageKit (src/lib/imagekit.ts) → bảng media
  │   → GET /api/cart?ids=… lấy giá/tồn kho
  └─ đặt hàng: thanh-toan/actions.ts → SELECT place_order(...)  (tạo đơn + trừ kho, 1 giao dịch)

src/db/schema.ts        cấu trúc DB (npm run db:setup)
src/db/seed-*.ts        dữ liệu mẫu (npm run db:seed)
src/auth.ts             Auth.js Credentials — 1 tài khoản từ ADMIN_USERNAME / ADMIN_PASSWORD
src/proxy.ts            chặn /admin khi chưa có cookie phiên; 404 cho trang chính sách sai
scripts/db.ts           db:check | db:setup | db:seed
scripts/imagekit-check.ts  imagekit:check
```
