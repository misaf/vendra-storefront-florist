import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { CollectionsIndex } from "@/modules/products";
import { fetchProductCategories, type ProductCategory } from "@/modules/products/server";
import { PageShell } from "@/shared/components/layout/page-shell";
import { JsonLd } from "@/shared/components/seo/json-ld";
import { breadcrumbSchema, buildMetadata } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "collections" });

  return buildMetadata({
    locale,
    path: "/collections",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

/**
 * The way in by occasion, on its own page.
 *
 * The catalogue answers "which of these 560 do I want"; this page answers the
 * question a shopper actually arrives with — "what is it for" — and every card
 * is a filtered catalogue. It is the one page in the source design the
 * storefront had no route for: the header's "all collections" and the home
 * band's link both pointed at the unfiltered catalogue, which is the answer to
 * a different question.
 *
 * Composition only. A failure leaves the masthead standing over an empty grid
 * rather than a broken page — the categories are the illustration here, and
 * the way on to the catalogue is in the bar above.
 */
export default async function CollectionsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale });

  let categories: ProductCategory[] = [];

  try {
    categories = await fetchProductCategories(locale);
  } catch (error) {
    console.error("Error loading collections:", error);
  }

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbSchema(locale, [
          { name: t("common.home"), path: "" },
          { name: t("collections.title"), path: "/collections" },
        ])}
      />
      <CollectionsIndex categories={categories} locale={locale} />
    </PageShell>
  );
}
