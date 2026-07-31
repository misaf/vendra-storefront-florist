import type { MetadataRoute } from "next";
import { SITE_NAME } from "@/shared/seo";
import { routing } from "@/shared/i18n/routing";

export const dynamic = "force-dynamic";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME[routing.defaultLocale],
    short_name: SITE_NAME[routing.defaultLocale],
    description: "Fresh flowers, premium plants, and arrangements for every occasion.",
    start_url: `/${routing.defaultLocale}`,
    display: "standalone",
    lang: routing.defaultLocale,
    dir: "rtl",
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
