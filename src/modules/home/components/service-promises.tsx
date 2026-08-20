import { getTranslations } from "next-intl/server";
import { Flower2, PackageCheck, Truck } from "lucide-react";

/**
 * The three standing promises under the hero. Static copy and static icons, so
 * this renders on the server — it used to sit inside the home page's client
 * root purely because that root held the `t` function.
 *
 * A list rather than three sibling `<h2>`s: these are supporting facts, not
 * sections, and headings here would pad the outline a screen-reader user
 * navigates by.
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
      className="border-b border-border/70 bg-secondary/45"
      aria-label={t("home.servicesTitle")}
    >
      <ul className="store-container grid divide-y divide-border/70 py-2 md:grid-cols-3 md:divide-x md:divide-y-0 rtl:md:divide-x-reverse">
        {promises.map(({ Icon, title, description }) => (
          <li
            key={title}
            className="flex gap-4 py-6 md:px-7 md:first:ps-0 md:last:pe-0"
          >
            <Icon className="mt-0.5 size-5 shrink-0 text-rose" aria-hidden="true" />
            <div>
              <p className="text-sm font-bold text-foreground">{title}</p>
              <p className="store-lede mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
