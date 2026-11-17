import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";

export const metadata: Metadata = pageMetadata({
  title: "Về Phú Ngọ",
  description: `${siteConfig.legalName} — cửa hàng hàng gia dụng, quần áo và vải chọn lọc. Thanh toán khi nhận hàng, giao hàng toàn quốc.`,
  path: "/gioi-thieu",
  image: "/images/about/cua-hang.jpg",
});

const values = [
  { title: "Chọn lọc kỹ lưỡng", desc: "Mỗi sản phẩm đều được kiểm tra chất liệu, độ hoàn thiện trước khi lên kệ." },
  { title: "Mua sắm an tâm", desc: "Thanh toán khi nhận hàng, được kiểm tra hàng trước và đổi trả trong 7 ngày." },
  { title: "Phục vụ tận tình", desc: "Đội ngũ tư vấn luôn sẵn sàng hỗ trợ bạn chọn đúng sản phẩm cần thiết." },
];

export default function AboutPage() {
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: "Giới thiệu" }]} />

      <header className="max-w-3xl pb-16 pt-6 md:pb-24 md:pt-10">
        <p className="eyebrow">Về chúng tôi</p>
        <h1 className="mt-5 font-serif text-4xl leading-[1.1] md:text-[64px]">
          Những vật dụng tốt cho một cuộc sống <em className="italic text-brand-600">dễ chịu</em>
        </h1>
      </header>

      <div className="relative aspect-[21/9] overflow-hidden bg-sand">
        <Image src="/images/about/cua-hang.jpg" alt="Không gian cửa hàng Phú Ngọ" fill preload sizes="100vw" className="object-cover" />
      </div>

      <section className="grid gap-10 py-24 md:grid-cols-2 md:gap-20 md:py-32" aria-labelledby="story-heading">
        <h2 id="story-heading" className="font-serif text-3xl leading-tight md:text-[40px]">
          Câu chuyện của Phú Ngọ
        </h2>
        <div className="space-y-5 leading-relaxed text-ink-soft">
          <p>
            {siteConfig.legalName} bắt đầu với một mong muốn giản dị: giúp mỗi gia đình dễ dàng sở hữu những món đồ bền đẹp, an
            toàn và hợp lý về giá — từ thiết bị trong căn bếp, bộ quần áo mặc hằng ngày đến từng mét vải may đo.
          </p>
          <p>
            Chúng tôi làm việc trực tiếp với các nhà sản xuất và xưởng dệt uy tín, kiểm tra từng lô hàng và chỉ giữ lại những gì
            chính mình muốn dùng. Mỗi đơn hàng đều được đóng gói cẩn thận và giao tận tay bạn.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-24 md:py-32" aria-labelledby="values-heading">
        <h2 id="values-heading" className="sr-only">
          Giá trị của chúng tôi
        </h2>
        <ol className="grid gap-12 md:grid-cols-3 md:gap-16">
          {values.map((v, i) => (
            <li key={v.title}>
              <span className="font-serif text-lg text-muted">0{i + 1}</span>
              <h3 className="mt-4 font-serif text-2xl">{v.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-soft">{v.desc}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="grid items-center gap-12 border-t border-line pt-24 md:grid-cols-2 md:gap-20 md:pt-32" aria-labelledby="company-heading">
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">
          <Image src="/images/about/kho-hang.jpg" alt="Kho hàng của Phú Ngọ" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <h2 id="company-heading" className="font-serif text-3xl md:text-[40px]">
            Thông tin doanh nghiệp
          </h2>
          <dl className="mt-10 divide-y divide-line border-y border-line text-[15px]">
            {[
              ["Tên doanh nghiệp", siteConfig.legalName],
              ["Mã số thuế", siteConfig.legal.taxCode],
              ["Địa chỉ", siteConfig.contact.address],
              ["Hotline", siteConfig.contact.hotline],
              ["Email", siteConfig.contact.email],
            ].map(([k, v]) => (
              <div key={k} className="grid grid-cols-[140px_1fr] gap-4 py-4">
                <dt className="text-muted">{k}</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
          <Link href="/san-pham" className={buttonVariants({ className: "mt-10" })}>
            Khám phá sản phẩm
          </Link>
        </div>
      </section>
    </div>
  );
}
