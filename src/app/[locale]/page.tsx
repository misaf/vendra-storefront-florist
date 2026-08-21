import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  BrandStory,
  CategoryDiscovery,
  FreshArrivals,
  Hero,
  OrderHelp,
  ServicePromises,
  loadInitialBlog,
  loadInitialHomeCatalogue,
} from "@/modules/home";
import { BlogSection } from "@/modules/blog";
import { PageShell } from "@/shared/components/layout/page-shell";
import { buildMetadata } from "@/shared/seo";


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
 * Composition only; every section reads its own translations, so the page root
 * stays on the server and only the genuinely interactive sections — the product
 * rail and the journal — ship as islands.
 *
 * The order is one journey, not a stack of blocks:
 *
 *   Hero            what this shop sells, and one way in
 *   CategoryDiscovery  every collection it sells, so "what for?" is answerable
 *   ServicePromises    a thin rule: why buy here, read just before prices
 *   FreshArrivals      the one product surface — newest, buyable, today
 *   BrandStory         the editorial turn, in its own words
 *   BlogSection        what the shop knows, secondary to what it sells
 *   OrderHelp          the second conversion path, for the order that needs a
 *                      conversation rather than a cart
 */
export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Blog and product data are independent — load them concurrently.
  const [blog, catalogue] = await Promise.all([
    loadInitialBlog(locale),
    loadInitialHomeCatalogue(locale),
  ]);

  return (
    <PageShell>
      <Hero
        locale={locale}
        inStockTotal={catalogue.inStockTotal}
        collectionCount={catalogue.categories.length}
      />
      <CategoryDiscovery categories={catalogue.categories} locale={locale} />
      <ServicePromises locale={locale} />
      <FreshArrivals products={catalogue.arrivals} />
      <BrandStory locale={locale} />
      <BlogSection
        allPosts={blog.initialBlogPosts}
        category={blog.initialBlogCategory}
      />
      <OrderHelp locale={locale} />
    </PageShell>
  );
}
