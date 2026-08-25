import { getTranslations } from "next-intl/server";
import { Flower2, PackageCheck, Palette, Truck } from "lucide-react";

/**
 * How this shop works, as its own band on the warm surface.
 *
 * The Organic system gives this shape to the "and then what happens" band: the
 * page's ground steps to `--card`, the heading is held to a 22ch measure so it
 * reads as a sentence rather than a banner, and each item opens with a round
 * medallion cut from the page colour behind it.
 *
 * The medallion carries the promise's icon rather than an ordinal. The source
 * design numbers its four items because they are sequential steps; these four
 * are qualities that hold simultaneously, and numbering them would claim an
 * order the shop does not work in.
 *
 * A list rather than four sibling `<h2>`s: these are supporting facts under one
 * heading, and headings here would pad the outline a screen-reader user
 * navigates by. The same strings caption the product detail page's assurances,
 * so they stay phrased for both places. Static copy and static icons, so it
 * renders on the server.
 */
export async function ServicePromises({ locale }: { locale: string }) {
  const t = await getTranslations({ locale });

  const promises = [
    {
      Icon: Flower2,
      title: t("home.serviceFreshnessTitle"),
      description: t("home.serviceFreshnessText"),
    },
    {
      Icon: Palette,
      title: t("home.serviceDesignTitle"),
      description: t("home.serviceDesignText"),
    },
    {
      Icon: PackageCheck,
      title: t("home.servicePreparationTitle"),
      description: t("home.servicePreparationText"),
    },
    {
      Icon: Truck,
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
        <ul className="mt-10 grid gap-8 sm:grid-cols-2 lg:mt-12 lg:grid-cols-4 lg:gap-7">
          {promises.map(({ Icon, title, description }) => (
            <li key={title}>
              <span
                className="flex size-14 items-center justify-center rounded-full bg-background text-rose"
                aria-hidden="true"
              >
                <Icon className="size-6" />
              </span>
              <p className="font-display mt-5 text-lg leading-snug text-card-foreground">
                {title}
              </p>
              <p className="store-lede mt-2 text-sm text-muted-foreground">
                {description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
