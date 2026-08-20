import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  HandHeart,
  Leaf,
  PackageCheck,
  ScanHeart,
  Sparkles,
} from "lucide-react";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { Link } from "@/shared/i18n/navigation";
import { isRtlLocale } from "@/shared/lib/locale";
import { cn } from "@/shared/lib/utils";
import { getProperty } from "@/shared/property";
import { getBrandIcon } from "@/shared/property/brand-icon";

const valueKeys = ["valueFreshness", "valueCraft", "valueService", "valueDetail"];
const processKeys = [
  "processStep1",
  "processStep2",
  "processStep3",
  "processStep4",
  "processStep5",
];

const BrandIcon = getBrandIcon(getProperty().businessType);

const valueIcons = [Leaf, BrandIcon, HandHeart, ScanHeart];
const trustKeys = ["trustPoint1", "trustPoint2", "trustPoint3"];
const trustIcons = [BrandIcon, Sparkles, PackageCheck];

// Shared brand-band CTA button styles, used by the hero and final-CTA pairs.
// Height comes from the global 44px button floor in globals.css.
const ctaPrimaryClass =
  "bg-storefront-brand-foreground text-storefront-brand shadow-none hover:bg-storefront-brand-foreground/90 dark:bg-primary dark:text-primary-foreground dark:hover:bg-primary/90";
const ctaOutlineClass =
  "border-storefront-brand-foreground/40 bg-transparent text-storefront-brand-foreground shadow-none hover:bg-storefront-brand-foreground/10 hover:text-storefront-brand-foreground dark:border-foreground/35 dark:text-foreground dark:hover:bg-foreground/10";

function SectionLabel({
  children,
  onDark = false,
  centered = false,
  as: Tag = "p",
}: {
  children: React.ReactNode;
  onDark?: boolean;
  centered?: boolean;
  as?: "p" | "h2";
}) {
  // On the dark brand bands, ink-coloured `--primary` collapses into the
  // background (light mode); use the band's light foreground token instead.
  const tone = onDark
    ? "text-storefront-brand-foreground dark:text-primary"
    : "text-primary";
  const rule = onDark
    ? "bg-storefront-brand-foreground/60 dark:bg-primary"
    : "bg-primary";

  return (
    <Tag
      className={cn(
        "flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em]",
        centered && "justify-center",
        tone
      )}
    >
      <span className={`h-px w-7 ${rule}`} />
      {children}
    </Tag>
  );
}

export default async function AboutUs() {
  const [t, locale] = await Promise.all([getTranslations(), getLocale()]);
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;
  // Localized, zero-padded step numbers (Persian digits for fa, etc.).
  const stepNumberFormat = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
  });

  return (
    <PageShell showFooterNewsletter={false}>
      <div className="bg-background text-foreground">
        <section className="overflow-hidden bg-storefront-brand text-storefront-brand-foreground dark:bg-storefront-surface dark:text-foreground">
          <div className="store-container store-section grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
            <div className="max-w-xl">
              <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.24em] text-storefront-brand-foreground/70 dark:text-storefront-text-muted">
                <span className="h-px w-7 bg-storefront-brand-foreground/45 dark:bg-storefront-text-muted" />
                {t("common.storeTagline")}
              </p>
              <h1 className="store-page-title mt-5">
                {t("about.heroTitle")}
              </h1>
              <p className="mt-5 max-w-lg text-sm leading-7 text-storefront-brand-foreground/75 dark:text-storefront-text-muted sm:text-base sm:leading-8">
                {t("about.heroSubtitle")}
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Button asChild className={ctaPrimaryClass}>
                  <Link href="/products">
                    {t("about.heroCtaPrimary")}
                    <ArrowIcon className="size-4" aria-hidden />
                  </Link>
                </Button>
                <Button asChild variant="outline" className={ctaOutlineClass}>
                  <Link href="/contact">{t("about.heroCtaSecondary")}</Link>
                </Button>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-[28rem] lg:mx-0 lg:justify-self-end">
              {/* an elegant offset frame — stylish, monochrome */}
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-storefront-brand-soft shadow-2xl shadow-black/20 sm:aspect-[5/4] lg:aspect-[4/5]">
                <Image
                  src={getProperty().aboutImage ?? "/hero-florist-studio.webp"}
                  alt={t("about.heroImageAlt")}
                  fill
                  preload
                  sizes="(min-width: 1024px) 36vw, 100vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="store-container store-section-lg grid gap-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
            <div>
              <SectionLabel>{t("about.storyEyebrow")}</SectionLabel>
              <h2 className="store-section-title mt-5 max-w-2xl">
                {t("about.storyTitle")}
              </h2>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-foreground dark:text-foreground sm:text-xl">
                {t("about.storyBody1")}
              </p>
              <p className="mt-5 max-w-2xl text-base leading-8 text-storefront-text-muted dark:text-storefront-text-muted">
                {t("about.storyBody2")}
              </p>
            </div>
            <figure className="lg:pt-8">
              <div className="relative aspect-[5/4] overflow-hidden rounded-lg bg-storefront-brand-soft dark:bg-storefront-surface sm:aspect-[4/3] lg:aspect-[4/5]">
                <Image
                  src="/contact-consultation.webp"
                  alt={t("about.missionImageAlt")}
                  fill
                  sizes="(min-width: 1024px) 38vw, 100vw"
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-storefront-text-muted">
                {t("about.plate2")}
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="bg-storefront-brand-soft text-foreground dark:bg-storefront-brand-soft dark:text-foreground">
          <div className="store-container store-section-lg max-w-5xl text-center">
            <SectionLabel centered as="h2">{t("about.missionTitle")}</SectionLabel>
            <p className="mx-auto mt-7 max-w-4xl text-2xl font-light leading-[1.45] sm:text-[2rem]">
              {t("about.missionBody")}
            </p>
          </div>
        </section>

        <section className="bg-storefront-brand text-storefront-brand-foreground dark:bg-storefront-surface dark:text-foreground">
          <div className="store-container store-section-lg grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionLabel onDark>{t("about.valuesTitle")}</SectionLabel>
              <h2 className="store-section-title mt-5 max-w-xl">
                {t("about.valuesSubtitle")}
              </h2>
            </div>
            <dl className="grid gap-4 sm:grid-cols-2">
              {valueKeys.map((key, index) => {
                const Icon = valueIcons[index];

                return (
                <div
                  key={key}
                  className="rounded-lg border border-storefront-brand-foreground/14 bg-storefront-brand-foreground/[0.04] p-5 dark:border-white/10 dark:bg-white/[0.04]"
                >
                  <dt className="flex items-center gap-3 text-lg font-semibold sm:text-xl">
                    <span className="flex size-10 items-center justify-center rounded-md bg-storefront-brand-foreground/12 text-storefront-brand-foreground dark:bg-primary/12 dark:text-primary">
                      <Icon className="size-5" aria-hidden />
                    </span>
                    {t(`about.${key}Title`)}
                  </dt>
                  <dd className="mt-4 text-sm leading-7 text-storefront-brand-foreground/78 dark:text-storefront-text-muted">
                    {t(`about.${key}Desc`)}
                  </dd>
                </div>
                );
              })}
            </dl>
          </div>
        </section>

        <section>
          <div className="store-container store-section-lg grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:gap-16">
            <div>
              <SectionLabel>{t("about.processTitle")}</SectionLabel>
              <h2 className="store-section-title mt-5 max-w-xl">
                {t("about.processSubtitle")}
              </h2>
              <figure className="mt-9">
                <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-storefront-brand-soft dark:bg-storefront-surface">
                  <Image
                    src="/contact-delivery-prep.webp"
                    alt={t("about.trustImageAlt")}
                    fill
                    sizes="(min-width: 1024px) 42vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="mt-3 text-xs uppercase tracking-[0.18em] text-storefront-text-muted">
                  {t("about.plate3")}
                </figcaption>
              </figure>
            </div>
            <ol className="self-center border-y border-border">
              {processKeys.map((key, index) => {
                const isLast = index === processKeys.length - 1;

                return (
                  <li
                    key={key}
                    className={`grid grid-cols-[auto_1fr] gap-5 py-6 sm:gap-8 ${
                      isLast ? "" : "border-b border-border"
                    }`}
                  >
                    <span className="flex size-11 items-center justify-center rounded-md bg-storefront-brand-soft text-base font-semibold tabular-nums text-primary dark:bg-storefront-brand-soft dark:text-primary">
                      {stepNumberFormat.format(index + 1)}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold sm:text-xl">
                        {t(`about.${key}Title`)}
                      </h3>
                      <p className="mt-2 max-w-xl text-sm leading-7 text-storefront-text-muted">
                        {t(`about.${key}Desc`)}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        <section className="bg-storefront-brand-soft/70 dark:bg-storefront-brand-soft">
          <div className="store-container store-section-lg grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <SectionLabel as="h2">{t("about.trustTitle")}</SectionLabel>
              <p className="mt-5 max-w-md text-xl leading-8 text-foreground">
                {t("about.trustBody")}
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {trustKeys.map((key, index) => {
                const Icon = trustIcons[index];

                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-card p-5 text-card-foreground"
                  >
                    <Icon className="size-5 text-primary" aria-hidden />
                    <p className="mt-5 text-sm leading-7 text-storefront-text-muted">
                      {t(`about.${key}`)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-storefront-brand text-storefront-brand-foreground dark:bg-storefront-surface dark:text-foreground">
          <div className="store-container store-section-lg grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h2 className="store-section-title max-w-3xl">
              {t("about.finalCtaTitle")}
              </h2>
              <p className="mt-5 max-w-xl text-base leading-8 text-storefront-brand-foreground/78 dark:text-storefront-text-muted">
                {t("about.finalCtaSubtitle")}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className={ctaPrimaryClass}>
                <Link href="/products">
                  {t("about.finalCtaPrimary")}
                  <ArrowIcon className="size-4" aria-hidden />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className={ctaOutlineClass}
              >
                <Link href="/contact">{t("about.finalCtaSecondary")}</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </PageShell>
  );
}
