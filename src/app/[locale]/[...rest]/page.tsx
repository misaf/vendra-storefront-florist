import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildMetadata } from "@/shared/seo";

type CatchAllPageProps = {
  params: Promise<{ locale: string; rest: string[] }>;
};

export async function generateMetadata({
  params,
}: CatchAllPageProps): Promise<Metadata> {
  const { locale, rest } = await params;
  const t = await getTranslations({ locale, namespace: "errors" });
  const path = `/${rest.map(encodeURIComponent).join("/")}`;

  return {
    ...buildMetadata({
      locale,
      path,
      title: t("notFoundTitle"),
      description: t("notFoundDescription"),
    }),
    robots: { index: false, follow: false },
  };
}

export default function LocalizedCatchAllPage() {
  notFound();
}
