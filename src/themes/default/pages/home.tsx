import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { Hero, ServicePromises, loadInitialBlog, loadInitialHomeProductCategories } from "@/modules/home";
import { BlogSection } from "@/modules/blog";
import { HomeProductsSection } from "@/modules/products";
import { Newsletter } from "@/modules/newsletter";
import { PageShell } from "@/shared/components/layout/page-shell";
import { buildMetadata } from "@/shared/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "home" });

  return buildMetadata({
    locale,
    path: "",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

/**
 * Composition only. The page used to hand off to a single client component that
 * existed to call `useTranslations()` and pass `t` down; each section now reads
 * its own translations, so the page root and the service promises stay on the
 * server and only the genuinely interactive sections ship as islands.
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Blog and product data are independent — load them concurrently.
  const [blog, initialHomeProductCategories] = await Promise.all([
    loadInitialBlog(locale),
    loadInitialHomeProductCategories(locale),
  ]);

  return (
    <PageShell showFooterNewsletter={false}>
      <Hero showButtons />
      <ServicePromises locale={locale} />
      <HomeProductsSection categories={initialHomeProductCategories} />
      <BlogSection
        allPosts={blog.initialBlogPosts}
        category={blog.initialBlogCategory}
      />
      <Newsletter />
    </PageShell>
  );
}
