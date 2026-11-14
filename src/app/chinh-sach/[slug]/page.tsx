import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { siteConfig } from "@/config/site";
import { getPolicy, policies } from "@/data/policies";
import { pageMetadata } from "@/lib/seo";
import { cn, formatDate } from "@/lib/utils";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContentRenderer } from "@/components/content/content-renderer";

export function generateStaticParams() {
  return policies.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/chinh-sach/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) return { title: "Không tìm thấy trang" };
  return pageMetadata({ title: policy.title, description: policy.description, path: `/chinh-sach/${policy.slug}` });
}

export default async function PolicyPage({ params }: PageProps<"/chinh-sach/[slug]">) {
  const { slug } = await params;
  const policy = getPolicy(slug);
  if (!policy) notFound();

  return (
    <div className="container-page">
      <Breadcrumbs items={[{ label: "Hỗ trợ" }, { label: policy.title }]} />

      <div className="grid gap-12 pt-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-24 lg:pt-10">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <nav aria-label="Chính sách & hỗ trợ">
            <p className="eyebrow">Hỗ trợ khách hàng</p>
            <ul className="mt-5 space-y-1 border-l border-line">
              {policies.map((p) => {
                const active = p.slug === policy.slug;
                return (
                  <li key={p.slug}>
                    <Link
                      href={`/chinh-sach/${p.slug}`}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "-ml-px block border-l py-2 pl-4 text-sm transition-colors",
                        active ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink",
                      )}
                    >
                      {p.title}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <p className="mt-10 text-sm text-muted">
            Cần hỗ trợ thêm?
            <br />
            <a href={siteConfig.contact.hotlineHref} className="text-ink underline underline-offset-4">
              {siteConfig.contact.hotline}
            </a>
          </p>
        </aside>

        <article className="max-w-2xl">
          <h1 className="font-serif text-4xl leading-tight md:text-5xl">{policy.title}</h1>
          <p className="mt-4 text-muted">{policy.description}</p>
          <p className="mt-2 text-[13px] text-muted">
            Cập nhật <time dateTime={policy.updatedAt}>{formatDate(policy.updatedAt)}</time>
          </p>
          <div className="mt-10 border-t border-line pt-4">
            <ContentRenderer blocks={policy.content} />
          </div>
        </article>
      </div>
    </div>
  );
}
