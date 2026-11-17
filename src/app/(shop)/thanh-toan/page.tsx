import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { CheckoutView } from "@/components/checkout/checkout-view";

export const metadata: Metadata = pageMetadata({
  title: "Thanh toán",
  description: `Hoàn tất đơn hàng tại ${siteConfig.name} — thanh toán khi nhận hàng.`,
  path: "/thanh-toan",
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: "Thanh toán" }]} />
      <h1 className="pb-12 pt-6 font-serif text-4xl md:pb-16 md:pt-10 md:text-[56px]">Thanh toán</h1>
      <CheckoutView />
    </div>
  );
}
