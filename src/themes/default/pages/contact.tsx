import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactClient } from "@/modules/contact";
import { getContactInfo } from "@/shared/lib/config";
import { buildMetadata } from "@/shared/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });

  return buildMetadata({
    locale,
    path: "/contact",
    title: t("metadataTitle"),
    description: t("metadataDescription"),
  });
}

export default function ContactPage() {
  return <ContactClient contactInfo={getContactInfo()} />;
}
