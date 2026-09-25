import { getTranslations } from "next-intl/server";

/**
 * How this shop works, as its own band on the warm surface.
 *
 * The Organic system gives this shape to the "and then what happens" band: the
 * page's ground steps to `--card`, the heading is held to a 22ch measure so it
 * reads as a sentence rather than a banner, and each item opens with a round
 * medallion cut from the page colour behind it.
 *
 * The medallion carries the step's number. These four are a sequence — the
 * stems are chosen, the arrangement is designed, it is prepared, it is
 * delivered — so numbering them states the order the shop actually works in
 * rather than inventing one. (An earlier edit set an icon here instead, on the
 * grounds that the four were simultaneous qualities; read in order they are
 * not, and four unnumbered medallions gave the band no reading direction.)
 *
 * A list rather than four sibling `<h2>`s: these are supporting facts under one
 * heading, and headings here would pad the outline a screen-reader user
 * navigates by. The same strings caption the product detail page's assurances,
 * so they stay phrased for both places. Static copy, so it renders on the
 * server.
 */
export async function ServicePromises({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });
  const formatCount = new Intl.NumberFormat(locale);

  const steps = [
    {
      title: t("home.serviceFreshnessTitle"),
      description: t("home.serviceFreshnessText"),
    },
    {
      title: t("home.serviceDesignTitle"),
      description: t("home.serviceDesignText"),
    },
    {
      title: t("home.servicePreparationTitle"),
      description: t("home.servicePreparationText"),
    },
    {
      title: t("home.serviceDeliveryTitle"),
      description: t("home.serviceDeliveryText"),
    },
  ];

  return (
    <section className="bg-card text-card-foreground">
      <div className="store-container store-section-lg">
        <h2 className="store-section-title max-w-[22ch] text-card-foreground">
          {t("home.servicesTitle")}
        </h2>
        <ul className="mt-[2.875rem] grid gap-[1.875rem] sm:grid-cols-[repeat(auto-fit,minmax(min(100%,12.5rem),1fr))]">
          {steps.map(({ title, description }, index) => (
            <li key={title}>
              <span
                className="font-display flex size-[3.375rem] items-center justify-center rounded-full bg-background text-[1.3125rem] leading-none text-rose"
                aria-hidden="true"
              >
                {formatCount.format(index + 1)}
              </span>
              <p className="font-display mt-[1.125rem] text-[1.1875rem] leading-snug text-card-foreground">
                {title}
              </p>
              <p className="store-lede mt-2 text-sm text-card-foreground/72">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
