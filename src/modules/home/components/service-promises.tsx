import { getTranslations } from "next-intl/server";
import { Flower2, PackageCheck, Truck } from "lucide-react";

/**
 * Three quiet assurances, set as a thin rule across the page between the
 * category wall and the product rail — the point where a shopper has decided
 * what they are looking for and is about to look at prices. It used to sit a
 * band later, after the products, where it read as an afterthought rather than
 * as an answer to "why buy here".
 *
 * Deliberately a strip and not a band: three cards here would be the third grid
 * of cards in as many screens. Static copy and static icons, so it renders on
 * the server.
 *
 * A list rather than three sibling `<h2>`s: these are supporting facts, not
 * sections, and headings here would pad the outline a screen-reader user
 * navigates by. The same six strings caption the product detail page's
 * assurances, so they stay phrased for both places.
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
    <section
      className="bg-storefront-brand text-storefront-brand-foreground dark:bg-storefront-surface dark:text-foreground"
      aria-label={t("home.servicesTitle")}
    >
      <ul className="store-container grid divide-y divide-white/14 py-2 min-[43.75rem]:grid-cols-3 min-[43.75rem]:divide-x min-[43.75rem]:divide-y-0">
        {promises.map(({ Icon, title, description }) => (
          <li
            key={title}
            className="flex gap-4 py-5 min-[43.75rem]:px-5 min-[43.75rem]:first:ps-0 min-[43.75rem]:last:pe-0 lg:px-7"
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-white/75 dark:text-primary" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-storefront-brand-foreground dark:text-foreground">{title}</p>
              <p className="store-lede mt-1 text-sm text-storefront-brand-foreground/68 dark:text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
