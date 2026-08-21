import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { getProperty } from "@/shared/property";

/**
 * The about page's opening.
 *
 * It borrows the home hero's geometry on purpose — the same rounded split
 * panel, the same shared display scale, the same copy-then-image stacking on a
 * phone — so the two pages read as one storefront, and it inverts the surface
 * so they are never mistaken for each other. It carries no buttons: an about page that opens by asking you to leave
 * has not earned the scroll yet, and the page closes with the one CTA pair it
 * needs. The old masthead's pair was identical to the closing pair, which meant
 * the same two buttons were offered twice on one page.
 */
export async function AboutMasthead({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const property = getProperty();

  return (
    <section className="store-section-sm bg-background">
      <div className="store-container">
        <div className="grid overflow-hidden rounded-3xl bg-storefront-brand text-storefront-brand-foreground shadow-panel dark:bg-storefront-surface dark:text-foreground lg:grid-cols-[1.05fr_0.95fr]">
          <div className="flex items-center px-6 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-16 xl:px-16">
            <div className="max-w-xl">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-storefront-brand-foreground/70 dark:text-muted-foreground [.locale-fa_&]:tracking-normal">
                <span
                  className="h-px w-7 bg-storefront-brand-foreground/45 dark:bg-muted-foreground"
                  aria-hidden="true"
                />
                {t("common.storeTagline")}
              </p>
              <h1 className="store-page-title mt-5">{t("about.heroTitle")}</h1>
              <p className="store-lede mt-5 max-w-lg text-base text-storefront-brand-foreground/78 dark:text-muted-foreground sm:text-lg">
                {t("about.heroSubtitle")}
              </p>
            </div>
          </div>

          <div className="relative min-h-72 overflow-hidden bg-storefront-brand-soft sm:min-h-96 lg:min-h-[28rem]">
            <Image
              src={property.aboutImage ?? "/hero-florist-studio.webp"}
              alt={t("about.heroImageAlt")}
              fill
              preload
              sizes="(min-width: 1024px) 46vw, calc(100vw - 2rem)"
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
