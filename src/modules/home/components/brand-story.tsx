import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";
import { getProperty } from "@/shared/property";

/**
 * The editorial pause between the shop's commerce bands and its journal.
 *
 * Its copy is its own. This section used to render `about.storyEyebrow`,
 * `about.storyTitle` and `about.storyBody1` — the same three strings the about
 * page opened its story with — so a shopper who followed "learn more" arrived
 * at a paragraph they had just finished reading. A teaser and the piece it
 * teases cannot be the same sentence: this one says why the shop exists, and
 * the about page is where that answer is actually given.
 */
export async function BrandStory({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const property = getProperty();
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  return (
    <section className="store-scroll-anchor bg-background">
      <div className="store-container store-section-lg grid items-center gap-9 min-[43.75rem]:grid-cols-12 min-[43.75rem]:gap-10 lg:gap-14">
        <div className="relative aspect-[5/4] overflow-hidden rounded-2xl bg-secondary sm:aspect-[16/10] min-[43.75rem]:col-span-7 min-[43.75rem]:aspect-[7/5]">
          <Image
            src={property.aboutImage ?? "/hero-florist-studio.webp"}
            alt={t("home.storyImageAlt")}
            fill
            sizes="(min-width: 43.75rem) 58vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="min-[43.75rem]:col-span-5 min-[43.75rem]:ps-3">
          <p className="store-eyebrow">{t("home.storyEyebrow")}</p>
          <h2 className="store-section-title mt-4 max-w-xl text-foreground">
            {t("home.storyTitle")}
          </h2>
          <p className="store-lede mt-5 max-w-xl text-base text-muted-foreground">
            {t("home.storyBody")}
          </p>
          <Link
            href="/about"
            className="group mt-7 inline-flex min-h-11 items-center gap-2 rounded-sm text-sm font-bold text-foreground underline decoration-border underline-offset-8 transition-colors hover:text-primary hover:decoration-primary"
          >
            {t("home.storyLink")}
            <ArrowIcon
              className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>
    </section>
  );
}
