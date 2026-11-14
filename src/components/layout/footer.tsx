import Link from "next/link";
import { Banknote, Mail, MapPin, Phone, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { siteConfig } from "@/config/site";
import { topCategories } from "@/data/categories";
import { policies } from "@/data/policies";
import { FacebookIcon, TiktokIcon, ZaloIcon } from "@/components/icons/social-icons";
import { Logo } from "./logo";

const services = [
  { icon: ShieldCheck, title: "Hàng chính hãng", desc: "Chất lượng được kiểm định" },
  { icon: Banknote, title: "Thanh toán khi nhận hàng", desc: "Kiểm tra hàng rồi mới trả tiền" },
  { icon: Truck, title: "Giao hàng toàn quốc", desc: "Miễn phí cho đơn từ 499.000₫" },
  { icon: RotateCcw, title: "Đổi trả 7 ngày", desc: "Thủ tục đơn giản, nhanh chóng" },
];

export function Footer() {
  const { contact, legal } = siteConfig;

  return (
    <footer className="mt-28 border-t border-line bg-sand/60" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Thông tin {siteConfig.name}
      </h2>

      <ul className="container-page grid grid-cols-2 gap-x-6 gap-y-8 border-b border-line py-12 lg:grid-cols-4">
        {services.map(({ icon: Icon, title, desc }) => (
          <li key={title} className="flex flex-col items-center text-center lg:flex-row lg:items-start lg:gap-4 lg:text-left">
            <Icon className="h-6 w-6 shrink-0 text-ink" strokeWidth={1.3} aria-hidden />
            <span className="mt-3 lg:mt-0">
              <span className="block text-[14px] font-medium text-ink">{title}</span>
              <span className="mt-0.5 block text-[13px] text-muted">{desc}</span>
            </span>
          </li>
        ))}
      </ul>

      <div className="container-page grid gap-12 py-16 lg:grid-cols-12">
        <div className="lg:col-span-5">
          <Logo />
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted">{siteConfig.description}</p>
          <ul className="mt-6 flex gap-2">
            {[
              { label: "Facebook", href: siteConfig.social.facebook, Icon: FacebookIcon },
              { label: "TikTok", href: siteConfig.social.tiktok, Icon: TiktokIcon },
              { label: "Zalo", href: siteConfig.social.zalo, Icon: ZaloIcon },
            ].map(({ label, href, Icon }) => (
              <li key={label}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink hover:text-ink"
                >
                  <Icon className="h-[18px] w-[18px]" />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
          <div>
            <h3 className="eyebrow">Mua sắm</h3>
            <ul className="mt-5 space-y-3 text-sm">
              <li>
                <Link href="/san-pham" className="text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline">
                  Tất cả sản phẩm
                </Link>
              </li>
              {topCategories.map((c) => (
                <li key={c.slug}>
                  <Link href={`/danh-muc/${c.slug}`} className="text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="eyebrow">Hỗ trợ</h3>
            <ul className="mt-5 space-y-3 text-sm">
              {policies.map((p) => (
                <li key={p.slug}>
                  <Link href={`/chinh-sach/${p.slug}`} className="text-ink-soft underline-offset-4 transition-colors hover:text-ink hover:underline">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <h3 className="eyebrow">Liên hệ</h3>
            <address className="mt-5 space-y-3 text-sm not-italic text-ink-soft">
              <p className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
                {contact.address}
              </p>
              <p className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
                <a href={contact.hotlineHref} className="transition-colors hover:text-ink">
                  {contact.hotline}
                </a>
              </p>
              <p className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-muted" strokeWidth={1.5} aria-hidden />
                <a href={`mailto:${contact.email}`} className="transition-colors hover:text-ink">
                  {contact.email}
                </a>
              </p>
            </address>
          </div>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-1.5 py-6 text-[12px] text-muted md:flex-row md:items-center md:justify-between">
          <p>
            © {siteConfig.copyrightYear} {siteConfig.legalName}
          </p>
          <p>
            MST {legal.taxCode} · {legal.license}
          </p>
        </div>
      </div>
    </footer>
  );
}
