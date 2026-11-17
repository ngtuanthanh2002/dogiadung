import type { Metadata } from "next";
import { ChevronDown } from "lucide-react";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { JsonLd } from "@/components/ui/json-ld";

export const metadata: Metadata = pageMetadata({
  title: "Liên hệ",
  description: `Liên hệ ${siteConfig.name}: hotline ${siteConfig.contact.hotline}, email ${siteConfig.contact.email}. Hỗ trợ ${siteConfig.contact.workingHours}.`,
  path: "/lien-he",
});

const faqs = [
  {
    q: "Phú Ngọ có những hình thức thanh toán nào?",
    a: "Hiện tại chúng tôi áp dụng thanh toán khi nhận hàng (COD). Bạn kiểm tra hàng rồi thanh toán tiền mặt cho nhân viên giao hàng.",
  },
  {
    q: "Bao lâu tôi nhận được hàng?",
    a: "Nội thành TP. Hồ Chí Minh từ 1 – 2 ngày, các tỉnh thành khác từ 3 – 5 ngày làm việc. Miễn phí giao hàng cho đơn từ 499.000₫.",
  },
  {
    q: "Tôi có thể đổi trả sản phẩm không?",
    a: "Có. Bạn được đổi trả trong 7 ngày nếu sản phẩm lỗi, hư hỏng khi vận chuyển hoặc không đúng mô tả. Quần áo được đổi size một lần khi còn nguyên tem mác.",
  },
  {
    q: "Vải được bán theo đơn vị nào?",
    a: "Vải được bán theo mét (len sợi bán theo cuộn). Bạn chọn số lượng mét cần mua ở trang sản phẩm.",
  },
];

export default function ContactPage() {
  const { contact } = siteConfig;
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
  };

  const items = [
    { label: "Hotline", value: contact.hotline, href: contact.hotlineHref },
    { label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { label: "Địa chỉ", value: contact.address },
    { label: "Giờ làm việc", value: contact.workingHours },
  ];

  return (
    <div className="container-page">
      <JsonLd data={faqJsonLd} />
      <Breadcrumbs items={[{ label: "Liên hệ" }]} />

      <div className="grid gap-16 pt-6 md:pt-10 lg:grid-cols-2 lg:gap-24">
        <div>
          <h1 className="font-serif text-4xl leading-tight md:text-[56px]">Liên hệ</h1>
          <p className="mt-5 max-w-md leading-relaxed text-ink-soft">
            Bạn cần tư vấn sản phẩm hay hỗ trợ đơn hàng? Hãy gọi hoặc gửi email cho chúng tôi — Phú Ngọ luôn sẵn lòng lắng nghe.
          </p>
          <dl className="mt-12 divide-y divide-line border-y border-line">
            {items.map((item) => (
              <div key={item.label} className="grid grid-cols-[120px_1fr] gap-4 py-5">
                <dt className="text-[13px] text-muted">{item.label}</dt>
                <dd className="text-[15px]">
                  {item.href ? (
                    <a href={item.href} className="underline-offset-4 hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-block text-sm text-ink underline underline-offset-4"
          >
            Xem bản đồ chỉ đường
          </a>
        </div>

        <section aria-labelledby="faq-heading">
          <h2 id="faq-heading" className="font-serif text-3xl">
            Câu hỏi thường gặp
          </h2>
          <div className="mt-8 border-t border-line">
            {faqs.map((f) => (
              <details key={f.q} className="group border-b border-line">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 text-[15px] transition-colors hover:text-brand-600 [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted transition-transform duration-300 group-open:rotate-180" aria-hidden />
                </summary>
                <p className="pb-6 pr-10 leading-relaxed text-ink-soft">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
