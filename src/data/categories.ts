import type { Category } from "./types";

const P = "/images/products";

export const categories: Category[] = [
  // ───── Hàng gia dụng ─────
  {
    slug: "hang-gia-dung",
    name: "Hàng gia dụng",
    description: "Thiết bị nấu nướng, làm mát, vệ sinh nhà cửa, đồ dùng nhà bếp, đèn trang trí và nội thất — bền bỉ, tiện dụng cho mọi gia đình.",
    image: "/images/banners/cat-gia-dung.jpg",
  },
  {
    slug: "thiet-bi-nau-nuong",
    parent: "hang-gia-dung",
    name: "Thiết bị nấu nướng",
    description: "Nồi gang, nồi áp suất, lò nướng, máy xay, máy pha cà phê và dụng cụ bếp chất lượng cao.",
    image: `${P}/noi-gang-trang-men.jpg`,
  },
  {
    slug: "thiet-bi-lam-mat-va-suoi",
    parent: "hang-gia-dung",
    name: "Thiết bị làm mát và sưởi",
    description: "Quạt đứng, quạt bàn tích điện — làm mát êm ái, tiết kiệm điện cho mọi không gian.",
    image: `${P}/quat-ban-tich-dien.jpg`,
  },
  {
    slug: "thiet-bi-ve-sinh-nha-cua",
    parent: "hang-gia-dung",
    name: "Thiết bị vệ sinh nhà cửa",
    description: "Robot hút bụi, máy giặt, bàn ủi hơi nước và dụng cụ làm sạch giúp việc nhà nhẹ nhàng hơn.",
    image: `${P}/robot-hut-bui.jpg`,
  },
  {
    slug: "do-dung-nha-bep",
    parent: "hang-gia-dung",
    name: "Đồ dùng nhà bếp",
    description: "Chén bát gốm, cốc sứ, thớt gỗ và bình giữ nhiệt cho bữa ăn gia đình thêm trọn vẹn.",
    image: `${P}/bo-chen-gom.jpg`,
  },
  {
    slug: "chan-ga-goi",
    parent: "hang-gia-dung",
    name: "Chăn ga gối",
    description: "Bộ chăn ga cotton, Tencel và gối lông vũ cho giấc ngủ êm ái mỗi đêm.",
    image: `${P}/bo-chan-ga-cotton.jpg`,
  },
  {
    slug: "den-trang-tri",
    parent: "hang-gia-dung",
    name: "Đèn & trang trí",
    description: "Đèn cây, đèn thả, nến thơm và chậu cây xanh giúp không gian sống ấm áp, có hồn hơn.",
    image: `${P}/den-tha-tran.jpg`,
  },
  {
    slug: "noi-that",
    parent: "hang-gia-dung",
    name: "Nội thất",
    description: "Ghế ăn, ghế bành, ghế đẩu và sofa thiết kế tối giản, chất liệu bền đẹp.",
    image: `${P}/ghe-banh-boc-ni.jpg`,
  },

  // ───── Quần áo ─────
  {
    slug: "quan-ao",
    name: "Quần áo",
    description: "Trang phục tối giản, chất liệu tự nhiên, đường may chỉn chu — dễ mặc, dễ phối mỗi ngày.",
    image: "/images/banners/cat-quan-ao.jpg",
  },
  {
    slug: "ao",
    parent: "quan-ao",
    name: "Áo",
    description: "Áo thun, sơ mi, áo nỉ và áo khoác từ cotton, linen thoáng mát.",
    image: `${P}/ao-so-mi-cham-bi.jpg`,
  },
  {
    slug: "quan",
    parent: "quan-ao",
    name: "Quần",
    description: "Quần kaki, jean, jogger và quần short phom dáng chuẩn, thoải mái vận động.",
    image: `${P}/quan-jean.jpg`,
  },
  {
    slug: "vay-dam",
    parent: "quan-ao",
    name: "Váy đầm",
    description: "Đầm nhung, đầm xòe, đầm hoa nữ tính cho dạo phố và những dịp đặc biệt.",
    image: `${P}/dam-nhung.jpg`,
  },

  // ───── Vải ─────
  {
    slug: "vai",
    name: "Vải",
    description: "Vải may mặc bán theo mét: linen, cotton, lụa, nhung, denim, kaki và len sợi chọn lọc.",
    image: "/images/banners/cat-vai.jpg",
  },
  {
    slug: "vai-linen-cotton",
    parent: "vai",
    name: "Vải linen & cotton",
    description: "Chất liệu tự nhiên thoáng khí, thấm hút tốt — lý tưởng cho áo sơ mi, váy mùa hè.",
    image: `${P}/vai-cotton-trang.jpg`,
  },
  {
    slug: "vai-lua-nhung",
    parent: "vai",
    name: "Vải lụa & nhung",
    description: "Lụa mềm rủ, nhung tăm sang trọng cho đầm dự tiệc và áo dài.",
    image: `${P}/vai-lua-do.jpg`,
  },
  {
    slug: "vai-denim-kaki",
    parent: "vai",
    name: "Vải denim & kaki",
    description: "Denim, kaki dày dặn, bền màu — may quần, áo khoác, túi xách.",
    image: `${P}/vai-denim.jpg`,
  },
  {
    slug: "len-tho-cam",
    parent: "vai",
    name: "Len & thổ cẩm",
    description: "Len sợi cotton đan móc và vải thổ cẩm dệt hoa văn truyền thống.",
    image: `${P}/len-soi-cotton.jpg`,
  },
];

export const topCategories = categories.filter((c) => !c.parent);

export function getCategory(slug: string) {
  return categories.find((c) => c.slug === slug);
}

export function getChildren(slug: string) {
  return categories.filter((c) => c.parent === slug);
}

/** Danh mục cấp 1 chứa danh mục này (hoặc chính nó nếu đã là cấp 1). */
export function getRootCategory(slug: string) {
  const category = getCategory(slug);
  return category?.parent ? getCategory(category.parent) : category;
}

/** Tất cả slug thuộc danh mục (bao gồm chính nó và danh mục con). */
export function getCategoryTree(slug: string) {
  return [slug, ...getChildren(slug).map((c) => c.slug)];
}
