import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Playfair_Display } from "next/font/google";
import { siteConfig } from "@/config/site";
import { DEFAULT_OG_IMAGE, absoluteUrl } from "@/lib/seo";
import { JsonLd } from "@/components/ui/json-ld";
import "./globals.css";

const beVietnam = Be_Vietnam_Pro({
  variable: "--font-be-vietnam",
  subsets: ["vietnamese", "latin"],
  weight: ["300", "400", "500", "600"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["vietnamese", "latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} - ${siteConfig.slogan}`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  applicationName: siteConfig.name,
  authors: [{ name: siteConfig.legalName, url: siteConfig.url }],
  creator: siteConfig.legalName,
  publisher: siteConfig.legalName,
  category: "shopping",
  alternates: { canonical: "/" },
  formatDetection: { telephone: false, email: false, address: false },
  openGraph: {
    type: "website",
    locale: siteConfig.locale,
    url: "/",
    siteName: siteConfig.name,
    title: `${siteConfig.name} - ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - ${siteConfig.slogan}`,
    description: siteConfig.description,
    images: [DEFAULT_OG_IMAGE.url],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
};

export const viewport: Viewport = {
  themeColor: "#faf8f5",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": absoluteUrl("/#organization"),
  name: siteConfig.name,
  legalName: siteConfig.legalName,
  url: siteConfig.url,
  logo: absoluteUrl("/icon.svg"),
  description: siteConfig.description,
  email: siteConfig.contact.email,
  telephone: siteConfig.contact.hotline,
  taxID: siteConfig.legal.taxCode,
  address: {
    "@type": "PostalAddress",
    streetAddress: siteConfig.contact.streetAddress,
    addressLocality: siteConfig.contact.addressLocality,
    addressRegion: siteConfig.contact.addressRegion,
    postalCode: siteConfig.contact.postalCode,
    addressCountry: "VN",
  },
  contactPoint: {
    "@type": "ContactPoint",
    telephone: siteConfig.contact.hotline,
    contactType: "customer service",
    areaServed: "VN",
    availableLanguage: ["Vietnamese"],
  },
  sameAs: Object.values(siteConfig.social),
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": absoluteUrl("/#website"),
  name: siteConfig.name,
  url: siteConfig.url,
  inLanguage: "vi-VN",
  publisher: { "@id": absoluteUrl("/#organization") },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: absoluteUrl("/san-pham?q={search_term_string}") },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="vi" className={`${beVietnam.variable} ${playfair.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        <a
          href="#main-content"
          className="sr-only z-[100] rounded-full bg-ink px-5 py-2.5 text-sm text-ivory focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Bỏ qua đến nội dung chính
        </a>
        <JsonLd data={[organizationJsonLd, websiteJsonLd]} />
        {/* Header/Footer cửa hàng nằm ở app/(shop)/layout.tsx; trang quản trị có layout riêng ở app/admin */}
        {children}
      </body>
    </html>
  );
}
