import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/shared/lib/config";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        // Keep the image proxy crawlable so OG / product-image rich results
        // resolve (the longer, more specific allow overrides the /api/ block).
        allow: ["/", "/api/storage/"],
        // Transactional / non-indexable routes (any locale prefix).
        disallow: ["/api/", "/*/checkout", "/*/checkout/success"],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
