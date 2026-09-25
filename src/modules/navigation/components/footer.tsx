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
import { FooterView } from "@/shared/components/ui/footer-view";

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
 *
 * The drawing is `FooterView`, in the shared kit; this wrapper supplies the
 * store's settings, its categories and the locale's words.
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
    <FooterView
      linkAs={Link}
      storeName={storeName}
      tagline={t("common.storeTagline")}
      phone={{
        href: telHref(contact.mobilePhone),
        label: toLocaleDigits(contact.mobilePhone, locale),
      }}
      callLabel={t("common.callStore")}
      details={detailRows}
      email={contact.email}
      socials={socialLinks.map(([label, href, Icon]) => ({
        label,
        href,
        icon: <Icon aria-hidden="true" />,
      }))}
      columns={columns}
      navLabel={t("footer.company")}
      copyright={t("footer.copyright")}
      madeIn={
        address.locality ? t("footer.madeIn", { place: address.locality }) : null
      }
    />
  );
}
