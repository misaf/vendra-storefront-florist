import { getTranslations } from "next-intl/server";
import { Badge } from "@/shared/components/ui/badge";

/**
 * The about page's opening.
 *
 * Words on the page's own ground, held to a reading measure — the shape the
 * design system gives an editorial masthead. It replaces a rounded ink panel
 * with the headline reversed out of it beside a photograph, which was the last
 * full-bleed dark slab in the storefront and read as a different site's hero
 * dropped onto this page: nothing else here inverts the surface, and the
 * photograph it framed is the same studio shot the home page already opens on.
 *
 * No image of its own, and no buttons. The story band directly below carries
 * the portrait, and an about page that opens by asking you to leave has not
 * earned the scroll yet — the page closes with the one CTA pair it needs.
 */
export async function AboutMasthead({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  return (
    <section className="bg-background">
      <div className="store-container store-section-head">
        <div className="max-w-3xl">
          <Badge variant="sage" className="px-3.5 py-1.5 text-xs">
            {t("common.storeTagline")}
          </Badge>
          <h1 className="store-page-title mt-5">{t("about.heroTitle")}</h1>
          <p className="store-lede mt-6 max-w-[52ch] text-base text-muted-foreground sm:text-lg">
            {t("about.heroSubtitle")}
          </p>
        </div>
      </div>
    </section>
  );
}
