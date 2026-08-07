import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_NAME } from "@/shared/seo";
import { routing } from "@/shared/i18n/routing";
import { getDirection } from "@/shared/lib/locale";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Description and direction follow the active property, not the florist that
  // happened to be bundled: one image serves the whole fleet.
  const t = await getTranslations({ locale: routing.defaultLocale });

  return {
    name: SITE_NAME[routing.defaultLocale],
    short_name: SITE_NAME[routing.defaultLocale],
    description: t("home.metadataDescription"),
    start_url: `/${routing.defaultLocale}`,
    display: "standalone",
    lang: routing.defaultLocale,
    dir: getDirection(routing.defaultLocale),
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
