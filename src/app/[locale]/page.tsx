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
import { Newsletter } from "@/modules/newsletter";
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
 *   FreshArrivals      the one product surface — newest, buyable, today
 *   ServicePromises    how the shop works, on its own band
 *   BrandStory         the editorial turn, in its own words
 *   BlogSection        what the shop knows, secondary to what it sells
 *   OrderHelp          the second conversion path, for the order that needs a
 *                      conversation rather than a cart
 *   Newsletter         the standing invitation, for the visitor who is not
 *                      buying today
 *
 * Commerce leads and the assurances follow it, which is the source design's
 * order: a shopper who has just been told what the shop sells is ready to be
 * told how buying works, whereas the same strip placed directly under the hero
 * interrupts the one journey the page exists to start.
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
      <FreshArrivals products={catalogue.arrivals} />
      <ServicePromises locale={locale} />
      <BrandStory locale={locale} />
      <BlogSection
        allPosts={blog.initialBlogPosts}
        category={blog.initialBlogCategory}
      />
      <OrderHelp locale={locale} />
      <Newsletter />
    </PageShell>
  );
}
