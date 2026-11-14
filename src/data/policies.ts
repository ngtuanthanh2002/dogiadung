import { siteConfig } from "@/config/site";
import type { Policy } from "./types";

const { name, contact, legalName } = siteConfig;

export const policies: Policy[] = [
  {
    slug: "huong-dan-mua-hang",
    title: "Hướng dẫn mua hàng",
    description: `Các bước đặt hàng đơn giản tại ${name}.`,
    updatedAt: "2026-11-01",
    content: [
      { type: "p", text: `Bạn có thể đặt hàng trực tuyến bất cứ lúc nào hoặc gọi hotline ${contact.hotline} để được hỗ trợ.` },
      { type: "h2", text: "Bước 1: Tìm sản phẩm" },
      { type: "p", text: "Dùng ô tìm kiếm hoặc duyệt theo danh mục Hàng gia dụng, Quần áo, Vải. Bạn có thể sắp xếp theo hàng mới, bán chạy hoặc giá." },
      { type: "h2", text: "Bước 2: Chọn phân loại và thêm vào giỏ hàng" },
      { type: "p", text: "Chọn màu sắc, kích cỡ (nếu có) và số lượng, sau đó bấm “Thêm vào giỏ hàng” để tiếp tục mua sắm, hoặc “Mua ngay” để chuyển thẳng đến trang thanh toán." },
      { type: "h2", text: "Bước 3: Điền thông tin nhận hàng" },
      { type: "p", text: "Nhập họ tên, số điện thoại, email và địa chỉ nhận hàng. Nếu người khác nhận hàng, bạn có thể nhập thông tin người nhận riêng và ghi chú thời gian giao mong muốn." },
      { type: "h2", text: "Bước 4: Đặt hàng và thanh toán khi nhận hàng" },
      { type: "p", text: `${name} áp dụng hình thức thanh toán khi nhận hàng (COD). Sau khi bấm “Đặt hàng”, nhân viên sẽ gọi điện xác nhận trước khi giao. Bạn kiểm tra hàng rồi thanh toán tiền mặt cho nhân viên giao hàng.` },
    ],
  },
  {
    slug: "chinh-sach-thanh-toan",
    title: "Chính sách thanh toán",
    description: `${name} áp dụng hình thức thanh toán khi nhận hàng (COD).`,
    updatedAt: "2026-11-01",
    content: [
      { type: "p", text: `Hiện tại ${name} áp dụng duy nhất hình thức thanh toán khi nhận hàng (COD) — bạn chỉ trả tiền sau khi đã nhận và kiểm tra sản phẩm.` },
      { type: "h2", text: "1. Thanh toán khi nhận hàng (COD)" },
      {
        type: "ul",
        items: [
          "Sau khi đặt hàng, nhân viên gọi điện xác nhận đơn và thời gian giao.",
          "Bạn được kiểm tra tình trạng, số lượng sản phẩm trước khi thanh toán.",
          "Thanh toán bằng tiền mặt cho nhân viên giao hàng theo đúng số tiền trên đơn.",
          "Không phát sinh phụ phí ngoài phí vận chuyển đã thông báo khi đặt hàng.",
        ],
      },
      { type: "h2", text: "2. Hóa đơn" },
      { type: "p", text: "Mỗi đơn hàng đều kèm phiếu bán hàng. Nếu cần hóa đơn điện tử, vui lòng ghi chú thông tin xuất hóa đơn khi đặt hàng." },
      { type: "note", text: `Mọi thắc mắc về thanh toán, vui lòng liên hệ ${contact.email} hoặc hotline ${contact.hotline}.` },
    ],
  },
  {
    slug: "chinh-sach-van-chuyen",
    title: "Chính sách vận chuyển & kiểm hàng",
    description: "Phạm vi, thời gian, phí giao hàng và quy định kiểm hàng khi nhận.",
    updatedAt: "2026-11-01",
    content: [
      { type: "h2", text: "1. Phạm vi giao hàng" },
      { type: "p", text: "Giao hàng đến tất cả tỉnh thành trên toàn quốc." },
      { type: "h2", text: "2. Thời gian giao hàng" },
      {
        type: "ul",
        items: [
          "Nội thành TP. Hồ Chí Minh: 1 – 2 ngày.",
          "Các tỉnh thành khác: 3 – 5 ngày làm việc.",
        ],
      },
      { type: "h2", text: "3. Phí vận chuyển" },
      {
        type: "ul",
        items: [
          "Miễn phí vận chuyển cho đơn hàng từ 499.000₫.",
          "Đơn hàng dưới 499.000₫: phí đồng giá 30.000₫.",
        ],
      },
      { type: "note", text: "Thời gian giao hàng mang tính dự kiến và có thể thay đổi tùy điều kiện thời tiết, giao thông." },
      { type: "h2", text: "4. Kiểm hàng khi nhận" },
      { type: "p", text: "Bạn được kiểm tra tình trạng bên ngoài và số lượng sản phẩm trước khi thanh toán. Nếu hàng hư hỏng hoặc sai mẫu, bạn có quyền từ chối nhận và liên hệ ngay với chúng tôi để được giao lại." },
    ],
  },
  {
    slug: "chinh-sach-bao-hanh-doi-tra",
    title: "Chính sách bảo hành & đổi trả",
    description: "Điều kiện bảo hành, đổi trả và cách gửi yêu cầu hỗ trợ.",
    updatedAt: "2026-11-01",
    content: [
      { type: "h2", text: "1. Bảo hành" },
      { type: "p", text: "Thiết bị gia dụng được bảo hành theo chính sách của nhà sản xuất (thời hạn ghi tại trang sản phẩm). Chúng tôi tiếp nhận và hỗ trợ gửi bảo hành mọi lỗi thuộc về sản xuất." },
      {
        type: "ul",
        items: [
          "Sản phẩm còn trong thời hạn bảo hành, còn tem và phiếu mua hàng.",
          "Không áp dụng với hư hỏng do rơi vỡ, va đập, vào nước hoặc tự ý sửa chữa.",
        ],
      },
      { type: "h2", text: "2. Đổi trả trong 7 ngày" },
      {
        type: "ul",
        items: [
          "Đổi trả miễn phí trong 7 ngày nếu sản phẩm lỗi, hư hỏng khi vận chuyển hoặc không đúng mô tả.",
          "Quần áo được đổi size một lần nếu còn nguyên tem mác, chưa qua sử dụng.",
          "Vải đã cắt theo mét không áp dụng đổi trả, trừ trường hợp lỗi dệt.",
        ],
      },
      { type: "h2", text: "3. Cách gửi yêu cầu" },
      { type: "p", text: `Liên hệ hotline ${contact.hotline} hoặc email ${contact.email}, kèm mã đơn hàng và hình ảnh sản phẩm. Chúng tôi sẽ phản hồi trong vòng 24 giờ.` },
    ],
  },
  {
    slug: "chinh-sach-bao-mat",
    title: "Chính sách bảo mật thông tin",
    description: `Cách ${name} thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng.`,
    updatedAt: "2026-11-01",
    content: [
      { type: "h2", text: "1. Thông tin thu thập" },
      { type: "p", text: "Họ tên, số điện thoại, email và địa chỉ nhận hàng bạn cung cấp khi đặt hàng." },
      { type: "h2", text: "2. Mục đích sử dụng" },
      {
        type: "ul",
        items: [
          "Xác nhận, xử lý và giao đơn hàng.",
          "Hỗ trợ đổi trả, bảo hành và giải đáp thắc mắc.",
        ],
      },
      { type: "h2", text: "3. Chia sẻ thông tin" },
      { type: "p", text: "Thông tin chỉ được chia sẻ cho đơn vị vận chuyển (tên, số điện thoại, địa chỉ) để giao hàng, hoặc cơ quan nhà nước khi có yêu cầu theo quy định pháp luật." },
      { type: "h2", text: "4. Thời gian lưu trữ & quyền của khách hàng" },
      { type: "p", text: "Dữ liệu được lưu trữ đến khi bạn yêu cầu xóa. Bạn có thể yêu cầu xem, chỉnh sửa hoặc xóa thông tin bất cứ lúc nào qua hotline hoặc email." },
      { type: "h2", text: "5. Đơn vị quản lý thông tin" },
      { type: "p", text: `${legalName} — ${contact.address}. Hotline: ${contact.hotline}. Email: ${contact.email}.` },
    ],
  },
  {
    slug: "dieu-khoan-su-dung",
    title: "Điều khoản sử dụng",
    description: `Quy định khi truy cập và mua sắm tại website ${name}.`,
    updatedAt: "2026-11-01",
    content: [
      { type: "p", text: `Khi truy cập và đặt hàng tại ${name}, bạn đồng ý với các điều khoản dưới đây.` },
      { type: "h2", text: "1. Đặt hàng" },
      { type: "p", text: "Khi đặt hàng, bạn đồng ý với giá, thông tin sản phẩm và điều kiện giao hàng được công bố tại thời điểm đặt. Đơn hàng chỉ được xác nhận sau khi nhân viên liên hệ thành công." },
      { type: "h2", text: "2. Hủy đơn" },
      {
        type: "ul",
        items: [
          "Bạn có thể hủy đơn miễn phí trước khi hàng được bàn giao cho đơn vị vận chuyển.",
          "Đơn hàng có thể bị hủy nếu không liên lạc được để xác nhận hoặc khách không nhận hàng.",
        ],
      },
      { type: "h2", text: "3. Quyền sở hữu trí tuệ" },
      { type: "p", text: `Nội dung, hình ảnh và thiết kế trên website thuộc quyền sở hữu của ${legalName}. Không sao chép khi chưa được cho phép.` },
      { type: "h2", text: "4. Giải quyết tranh chấp" },
      { type: "p", text: "Mọi tranh chấp được ưu tiên giải quyết bằng thương lượng. Nếu không đạt được thỏa thuận, tranh chấp sẽ được giải quyết tại Tòa án có thẩm quyền theo pháp luật Việt Nam." },
    ],
  },
];

export function getPolicy(slug: string) {
  return policies.find((p) => p.slug === slug);
}
