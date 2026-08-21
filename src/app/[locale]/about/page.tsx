import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  AboutApproach,
  AboutCatalogue,
  AboutMasthead,
  AboutStory,
  loadAboutCategories,
} from "@/modules/about";
import { PageShell } from "@/shared/components/layout/page-shell";
import { buildMetadata } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });

  return buildMetadata({
    locale,
    path: "/about",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

/**
 * Composition only, like the home page it sits beside.
 *
 *   AboutMasthead   who this shop is, in the home hero's geometry, inverted
 *   AboutStory      why it exists — the piece the home page teases
 *   AboutApproach   what it holds itself to, once, instead of three times
 *   AboutCatalogue  the work itself, and the way back into the shop
 *
 * The footer newsletter stays off: the page already closes on a call to
 * action, and a second one under it would be the third on the page.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const categories = await loadAboutCategories(locale);

  return (
    <PageShell showFooterNewsletter={false}>
      <AboutMasthead locale={locale} />
      <AboutStory locale={locale} />
      <AboutApproach locale={locale} />
      <AboutCatalogue categories={categories} locale={locale} />
    </PageShell>
  );
}
