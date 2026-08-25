import type { MetadataRoute } from "next";
import { getTranslations } from "next-intl/server";
import { SITE_NAME } from "@/shared/seo";
import { routing } from "@/shared/i18n/routing";
import { getDirection } from "@/shared/lib/locale";

export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  // Description and direction follow the active store, not the florist that
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
    // The Organic palette's page ground and brand band. Neither can read a
    // CSS variable — the OS paints the splash and the browser tints its chrome
    // before any stylesheet loads — so both are restated from `globals.css`
    // (`--background`, `--storefront-brand`) and must be changed with it.
    background_color: "#f5ead8",
    theme_color: "#2e2b25",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
