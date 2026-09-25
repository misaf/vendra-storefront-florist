import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import {
  AboutApproach,
  AboutMasthead,
  AboutStory,
  loadAboutStats,
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
 *   AboutMasthead  who this shop is
 *   AboutStory     why it exists — the piece the home page teases — and the
 *                  figures the storefront can actually count
 *   AboutApproach  what it holds itself to, once, instead of three times
 *
 * Three bands, and the page closes on the last of them. It used to end on a
 * fourth carrying four category tiles and a pair of buttons; the design ends
 * on the commitments, and every way onward is already in the bar above and
 * the foot below.
 */
export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const stats = await loadAboutStats(locale);

  return (
    <PageShell>
      <AboutMasthead locale={locale} />
      <AboutStory locale={locale} stats={stats} />
      <AboutApproach locale={locale} />
    </PageShell>
  );
}
