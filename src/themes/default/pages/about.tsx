import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { AboutUs } from "@/modules/about";
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

export default function AboutPage() {
  return <AboutUs />;
}
