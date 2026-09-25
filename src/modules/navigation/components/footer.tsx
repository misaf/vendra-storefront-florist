"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { useStorefrontName } from "@/shared/config/storefront-context";
import {
  InstagramIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/shared/components/ui/social-icons";
import {
  instagramProfileUrl,
  telegramProfileUrl,
  whatsappUrl,
} from "@/shared/lib/social-url";
import { formatBusinessHours, toLocaleDigits } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";
import { useProductCategories } from "@/modules/products";
import { DynamicText } from "@/shared/components/dynamic-text";

const footerLink =
  "store-focus-invert -my-1.5 inline-flex min-h-11 items-start rounded-sm py-1.5 text-start text-sm text-white/75 transition-colors hover:text-white";

/** The design marks each address line with a glyph rather than an icon: a
 *  ring for a place, a clock face for an hour. They sit in a fixed 22px
 *  gutter so the values beside them start on one line. */
const PLACE_GLYPH = "◉";
const HOURS_GLYPH = "◷";

/**
 * The ink foot of every page, in the design system's two-part composition: the
 * shop on one side, the site's map on the other.
 *
 * The left column is the shop as a person would give it — mark, name, a line
 * about what it is, then the phone set large enough to dial from across the
 * room, then where and when, then the accounts it answers on. The right column
 * is three link lists on their own measure.
 *
 * The bar itself carries four links; every other destination is here, which is
 * why the Shop column reaches into the catalogue by collection rather than
 * stopping at "all products". Those rows are the shop's real categories, so a
 * shop that renames a collection renames it here too — and one that has none
 * simply shows a shorter column.
 */
export function Footer() {
  const { t, locale } = useTranslations();
  const storefront = useStorefrontConfig();
  const storeName = useStorefrontName();
  const { contact, social, address } = storefront;
  const { data: categories = [] } = useProductCategories(locale);

  const socialLinks = [
    ["WhatsApp", whatsappUrl(social.whatsappPhone), WhatsAppIcon],
    ["Telegram", telegramProfileUrl(social.telegramUsername), TelegramIcon],
    ["Instagram", instagramProfileUrl(social.instagramUsername), InstagramIcon],
  ] as const;

  // Every row here is store configuration; a shop that has not set one simply
  // does not draw it, rather than drawing an empty line with a glyph beside it.
  const addressLine = [address.locality, address.country]
    .filter(Boolean)
    .join(", ");
  const detailRows = [
    addressLine ? { glyph: PLACE_GLYPH, value: addressLine } : null,
    contact.hoursOpen && contact.hoursClose
      ? {
          glyph: HOURS_GLYPH,
          value: formatBusinessHours(
            contact.hoursOpen,
            contact.hoursClose,
            locale
          ),
        }
      : null,
  ].filter((row): row is { glyph: string; value: string } => row !== null);

  /* Four collections, not thirteen: the column is a way back into the shop,
     and the catalogue's own rail is where the whole list belongs. */
  const collectionLinks = categories.slice(0, 4).map((category) => ({
    key: `category-${category.id}`,
    href: { pathname: "/products" as const, query: { category: category.slug } },
    label: category.name,
  }));

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { key: "products", href: "/products" as const, label: t("footer.allProducts") },
        { key: "collections", href: "/collections" as const, label: t("collections.viewAll") },
        ...collectionLinks,
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { key: "about", href: "/about" as const, label: t("common.about") },
        { key: "blog", href: "/blog" as const, label: t("blog.title") },
      ],
    },
    {
      title: t("footer.support"),
      links: [
        { key: "faq", href: "/faq" as const, label: t("footer.faq") },
        { key: "contact", href: "/contact" as const, label: t("common.contact") },
      ],
    },
  ];

  return (
    <footer className="bg-storefront-brand text-storefront-brand-foreground">
      <div className="store-container grid gap-8 pb-10 pt-14 sm:pt-[clamp(3.375rem,7vw,5.625rem)] lg:grid-cols-[minmax(17rem,0.85fr)_minmax(18.75rem,2fr)] lg:gap-[clamp(2rem,4vw,3.25rem)]">
        <div>
          <Link
            href="/"
            className="store-focus-invert inline-flex items-center gap-[0.6875rem] rounded-sm"
          >
            {/* Decorative, and deliberately empty: the design's footer mark is
                the petal itself rather than a second glyph holder. */}
            <span className="organic-mark-petal size-[1.875rem] shrink-0" aria-hidden="true" />
            <span className="font-display text-[1.1875rem] leading-tight text-white">
              {storeName}
            </span>
          </Link>

          <p className="mt-4 max-w-[32ch] text-sm leading-[1.65] text-white/70">
            {t("common.storeTagline")}
          </p>

          {/* The one line in the foot set in the display face: a florist is
              still a shop people ring up. */}
          <a
            href={telHref(contact.mobilePhone)}
            dir="ltr"
            className="store-focus-invert font-display mt-5 inline-block rounded-sm text-[1.1875rem] text-white transition-colors hover:text-clay-800"
          >
            <span className="sr-only">{t("common.callStore")}</span>
            {toLocaleDigits(contact.mobilePhone, locale)}
          </a>

          {detailRows.length > 0 || contact.email ? (
            <div className="mt-4 flex flex-col gap-2.5">
              {detailRows.map(({ glyph, value }) => (
                <p key={value} className="flex items-start gap-[0.6875rem]">
                  <span
                    aria-hidden="true"
                    className="w-[1.375rem] shrink-0 text-center text-[0.8125rem] leading-6 text-white/55"
                  >
                    {glyph}
                  </span>
                  <span className="text-[0.84375rem] leading-normal text-white/72">
                    {value}
                  </span>
                </p>
              ))}
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="store-focus-invert -my-1 flex min-h-11 items-start gap-[0.6875rem] rounded-sm py-1"
                >
                  <span
                    aria-hidden="true"
                    className="w-[1.375rem] shrink-0 text-center text-[0.8125rem] leading-6 text-white/55"
                  >
                    ✉
                  </span>
                  <span className="store-dynamic-text text-[0.84375rem] leading-6 text-white/72 transition-colors hover:text-white">
                    {contact.email}
                  </span>
                </a>
              ) : null}
            </div>
          ) : null}

          <div className="mt-6 flex gap-2.5">
            {socialLinks.map(([label, href, Icon]) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noreferrer"
                aria-label={label}
                className="store-focus-invert flex size-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-primary hover:text-primary-foreground"
              >
                <Icon className="size-[1.0625rem]" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* One `auto-fit` row on a 108px floor, exactly as the design states
            it: three lists on a laptop, two on a tablet, one on a phone —
            without a breakpoint per step, and with a Persian heading wider
            than its English counterpart free to reflow instead of clipping. */}
        <nav
          aria-label={t("footer.company")}
          className="grid content-start gap-[clamp(1.25rem,2.4vw,2.25rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,6.75rem),1fr))]"
        >
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.09em] text-white/60 [.locale-fa_&]:tracking-normal">
                {column.title}
              </h3>
              <ul className="mt-4 flex flex-col items-start">
                {column.links.map((link) => (
                  <li key={link.key} className="max-w-full">
                    <Link href={link.href} className={footerLink}>
                      <span className="store-dynamic-text">
                        <DynamicText>{link.label}</DynamicText>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* The design closes on two lines pushed to opposite ends: the rights
          notice, and a place. There is no maker to credit here, so the second
          slot carries where the shop actually is — which is configuration the
          storefront already holds, and disappears for a shop that has not set
          it rather than printing an empty half. */}
      <div className="store-container flex flex-wrap justify-between gap-5 border-t border-white/18 pb-10 pt-6 text-[0.78125rem] text-white/60">
        <p>{t("footer.copyright")}</p>
        {address.locality ? <p>{t("footer.madeIn", { place: address.locality })}</p> : null}
      </div>
    </footer>
  );
}
