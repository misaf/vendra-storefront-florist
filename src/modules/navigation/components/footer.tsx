"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { useStorefrontName } from "@/shared/config/storefront-context";
import { Clock, Mail, MapPin } from "lucide-react";
import {
  InstagramIcon,
  TelegramIcon,
  WhatsAppIcon,
} from "@/shared/components/ui/social-icons";
import { useBrandIcon } from "@/shared/config/storefront-context";
import {
  instagramProfileUrl,
  telegramProfileUrl,
  whatsappUrl,
} from "@/shared/lib/social-url";
import { formatBusinessHours } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";

const footerLink =
  "store-focus-invert -my-1.5 inline-flex min-h-11 items-center rounded-sm py-1.5 text-sm text-white/75 transition-colors hover:text-white";

/**
 * The ink foot of every page, in the design system's two-part composition: the
 * shop on one side, the site's map on the other.
 *
 * The left column is the shop as a person would give it — mark, name, a line
 * about what it is, then the phone set large enough to dial from across the
 * room, then where and when, then the accounts it answers on. The right column
 * is a plain set of link lists that reflows on its own measure.
 *
 * It replaces a footer that restated the *home page's* `h1` at up to 3rem
 * inside the foot of every route — a second masthead, in the display face,
 * below the content it was meant to close. The small line here is the shop
 * describing itself, which is what a footer is for; the headline belongs to
 * the page that earns it.
 */
export function Footer() {
  const BrandIcon = useBrandIcon();
  const { t, locale } = useTranslations();
  const storefront = useStorefrontConfig();
  const storeName = useStorefrontName();
  const { contact, social, address } = storefront;

  const socialLinks = [
    ["Instagram", instagramProfileUrl(social.instagramUsername), InstagramIcon],
    ["Telegram", telegramProfileUrl(social.telegramUsername), TelegramIcon],
    ["WhatsApp", whatsappUrl(social.whatsappPhone), WhatsAppIcon],
  ] as const;

  // Every row here is store configuration; a shop that has not set one simply
  // does not draw it, rather than drawing an empty line with an icon beside it.
  const addressLine = [address.locality, address.country]
    .filter(Boolean)
    .join(", ");
  const detailRows = [
    addressLine ? { Icon: MapPin, value: addressLine } : null,
    contact.hoursOpen && contact.hoursClose
      ? {
          Icon: Clock,
          value: formatBusinessHours(
            contact.hoursOpen,
            contact.hoursClose,
            locale
          ),
        }
      : null,
  ].filter((row): row is { Icon: typeof MapPin; value: string } => row !== null);

  const columns = [
    {
      title: t("footer.shop"),
      links: [
        { href: "/products" as const, label: t("footer.allProducts") },
        { href: "/faq" as const, label: t("footer.faq") },
      ],
    },
    {
      title: t("footer.company"),
      links: [
        { href: "/about" as const, label: t("common.about") },
        { href: "/blog" as const, label: t("blog.title") },
        { href: "/contact" as const, label: t("common.contact") },
      ],
    },
  ];

  return (
    <footer className="bg-storefront-brand text-white">
      <div className="store-container grid gap-10 pb-10 pt-12 sm:pt-[clamp(3.375rem,7vw,5.625rem)] lg:grid-cols-[minmax(17rem,0.85fr)_minmax(18.75rem,2fr)] lg:gap-[clamp(2rem,4vw,3.25rem)]">
        <div>
          <Link
            href="/"
            className="store-focus-invert inline-flex items-center gap-3 rounded-sm"
          >
            <span className="organic-mark flex size-8 items-center justify-center">
              <BrandIcon className="size-4" />
            </span>
            <span className="font-display text-xl text-white">{storeName}</span>
          </Link>

          <p className="mt-4 max-w-[32ch] text-sm leading-relaxed text-white/70">
            {t("common.storeTagline")}
          </p>

          {/* The one line in the foot set in the display face: a florist is
              still a shop people ring up. */}
          <a
            href={telHref(contact.mobilePhone)}
            dir="ltr"
            className="store-focus-invert font-display mt-5 inline-block rounded-sm text-xl text-white transition-colors hover:text-clay-800"
          >
            <span className="sr-only">{t("common.callStore")}</span>
            {contact.mobilePhone}
          </a>

          {detailRows.length > 0 || contact.email ? (
            <div className="mt-5 flex flex-col gap-2.5">
              {detailRows.map(({ Icon, value }) => (
                <p key={value} className="flex items-start gap-3">
                  <Icon
                    className="mt-0.5 size-3.5 shrink-0 text-white/55"
                    aria-hidden="true"
                  />
                  <span className="text-sm leading-relaxed text-white/72">
                    {value}
                  </span>
                </p>
              ))}
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="store-focus-invert -my-1 flex min-h-11 items-center gap-3 rounded-sm py-1"
                >
                  <Mail
                    className="size-3.5 shrink-0 text-white/55"
                    aria-hidden="true"
                  />
                  <span className="store-dynamic-text text-sm text-white/72 transition-colors hover:text-white">
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
                <Icon className="size-4" aria-hidden="true" />
              </a>
            ))}
          </div>
        </div>

        {/* A wrapping row, not an `auto-fit` grid: with two lists the grid
            stretched each into half of a very wide track and left ~25rem of
            nothing between "Shop" and "Company". Flex sizes each column to its
            own content and wraps when the row runs out — which also lets a
            Persian heading wider than its English counterpart reflow instead
            of clipping. */}
        <nav
          aria-label={t("footer.company")}
          className="flex flex-wrap content-start gap-x-16 gap-y-8"
        >
          {columns.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.09em] text-white/60 [.locale-fa_&]:tracking-normal">
                {column.title}
              </h3>
              <ul className="mt-3 flex flex-col items-start">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={footerLink}>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* The design closes with a rights line and a maker's credit. There is
          no maker to credit here, and repeating the shop's name opposite a
          copyright notice that already carries it says nothing twice — so the
          bar holds the one line it has. */}
      <div className="store-container border-t border-white/18 py-6 text-xs text-white/60">
        <p>{t("footer.copyright")}</p>
      </div>
    </footer>
  );
}
