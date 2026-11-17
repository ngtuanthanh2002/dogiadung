/**
 * Thông tin thương hiệu & liên hệ dùng chung toàn website.
 * Thay các giá trị dưới đây bằng thông tin thật của doanh nghiệp trước khi triển khai.
 */
export const siteConfig = {
  name: "Phú Ngọ",
  legalName: "Công ty TNHH MTV Phú Ngọ Group",
  shortName: "Phú Ngọ",
  slogan: "Hàng gia dụng, quần áo & vải chọn lọc",
  description:
    "Phú Ngọ — cửa hàng hàng gia dụng, quần áo và vải chất lượng. Thiết bị nấu nướng, làm mát, vệ sinh nhà cửa, thời trang và vải may mặc. Thanh toán khi nhận hàng, giao hàng toàn quốc.",
  // TODO: đặt NEXT_PUBLIC_SITE_URL = tên miền thật (dùng cho sitemap, canonical, Open Graph)
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://phungo.vn",
  locale: "vi_VN",
  language: "vi",
  keywords: ["hàng gia dụng", "thiết bị nấu nướng", "quạt", "máy hút bụi", "quần áo", "váy đầm", "vải may mặc", "vải linen", "Phú Ngọ"],
  contact: {
    hotline: "0368 174 500",
    hotlineHref: "tel:0368174500",
    // TODO: thay bằng email thật của doanh nghiệp
    email: "cskh@phungo.vn",
    address: "Số 75 Đường 11, Phường Thủ Đức, Thành phố Hồ Chí Minh",
    streetAddress: "Số 75 Đường 11",
    addressLocality: "Phường Thủ Đức",
    addressRegion: "Thành phố Hồ Chí Minh",
    postalCode: "700000",
    workingHours: "9:00 – 22:00, tất cả các ngày",
  },
  // TODO: cập nhật số giấy phép kinh doanh thật
  legal: {
    taxCode: "0300000000",
    license: "GPĐKKD số 0300000000 do Sở KH&ĐT TP. Hồ Chí Minh cấp",
  },
  social: {
    facebook: "https://facebook.com/",
    tiktok: "https://tiktok.com/",
    zalo: "https://zalo.me/",
  },
  freeShippingThreshold: 499000,
  shippingFee: 30000,
  copyrightYear: 2026,
} as const;

/** Từ khóa gợi ý trong ô tìm kiếm ("Tìm kiếm phổ biến" như site gốc). */
export const hotKeywords = ["Nồi gang", "Quạt", "Máy hút bụi", "Váy", "Sơ mi", "Vải linen"] as const;
