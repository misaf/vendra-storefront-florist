import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";

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
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;

  return (
    <section className="store-scroll-anchor overflow-hidden bg-background">
      <div className="store-container store-section-lg grid items-center gap-10 min-[43.75rem]:grid-cols-12 min-[43.75rem]:gap-12 lg:gap-16">
        <div className="organic-arch-tall relative mx-auto aspect-[4/5] w-full max-w-xl overflow-hidden bg-secondary min-[43.75rem]:col-span-5 min-[43.75rem]:mx-0">
          <Image
            src="/hero-florist-studio-storefront.webp"
            alt={t("home.storyImageAlt")}
            fill
            sizes="(min-width: 43.75rem) 42vw, 100vw"
            className="object-cover"
          />
        </div>

        <div className="relative min-[43.75rem]:col-span-7 min-[43.75rem]:ps-3 lg:ps-10">
          <span className="font-display absolute -start-2 -top-16 hidden text-[9rem] leading-none text-rose/12 lg:block" aria-hidden="true">&ldquo;</span>
          <p className="store-eyebrow">{t("home.storyEyebrow")}</p>
          <h2 className="font-display mt-5 max-w-2xl text-[clamp(2.35rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.045em] text-foreground [.locale-fa_&]:leading-[1.5] [.locale-fa_&]:tracking-normal">
            {t("home.storyTitle")}
          </h2>
          <p className="store-lede mt-6 max-w-xl text-base text-muted-foreground sm:text-lg">
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
