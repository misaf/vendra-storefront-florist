"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { useStorefrontName } from "@/shared/config/storefront-context";
import { Newsletter } from "@/modules/newsletter";
import { ArrowUpRight, Mail, Phone } from "lucide-react";
import { useBrandIcon } from "@/shared/config/storefront-context";
import {
  instagramProfileUrl,
  telegramProfileUrl,
  whatsappUrl,
} from "@/shared/lib/social-url";
import { telHref } from "@/shared/lib/utils";

const footerLink =
  "store-focus-invert -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm text-white/80 transition-colors hover:text-white";

export function Footer({ showNewsletter = true }: { showNewsletter?: boolean }) {
  const BrandIcon = useBrandIcon();
  const { t } = useTranslations();
  const storefront = useStorefrontConfig();
  const storeName = useStorefrontName();
  const socialLinks = [
    ["Instagram", instagramProfileUrl(storefront.social.instagramUsername)],
    ["Telegram", telegramProfileUrl(storefront.social.telegramUsername)],
    ["WhatsApp", whatsappUrl(storefront.social.whatsappPhone)],
  ] as const;

  return (
    <footer className="bg-storefront-brand text-white">
      <div className="store-container">
        {showNewsletter ? (
          <div className="store-section grid gap-8 border-b border-white/15 lg:grid-cols-[1.2fr_minmax(22rem,0.8fr)] lg:items-end">
            <div className="max-w-2xl">
              <p className="store-eyebrow boho-hero-eyebrow mb-4">{t("blog.eyebrow")}</p>
              <h2 className="font-display text-3xl leading-tight text-white sm:text-4xl lg:text-5xl [.locale-fa_&]:leading-[1.5]">
                {t("newsletter.title")}
              </h2>
              <p className="store-lede mt-3 max-w-xl text-sm text-white/70 sm:text-base">
                {t("newsletter.description")}
              </p>
            </div>
            <Newsletter variant="compact" />
          </div>
        ) : null}

        <div className="store-section grid gap-12 lg:grid-cols-[1.1fr_1.4fr] lg:gap-20">
          <div className="max-w-xl">
            <Link href="/" className="store-focus-invert inline-flex items-center gap-3 rounded-sm">
              <span className="flex size-11 items-center justify-center rounded-b-xl rounded-t-full bg-white text-primary"><BrandIcon className="size-5" /></span>
              <span className="font-display text-2xl text-white sm:text-3xl">{storeName}</span>
            </Link>
            <p className="font-display mt-7 max-w-lg text-[clamp(1.8rem,3.4vw,3rem)] leading-[1.12] text-white/92 [.locale-fa_&]:leading-[1.55]">
              {t("home.title")}
            </p>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/68">{t("home.subtitle")}</p>

            <div className="mt-7 flex flex-col items-start gap-1">
              <a href={telHref(storefront.contact.mobilePhone)} dir="ltr" className={footerLink}>
                <Phone className="size-3.5" aria-hidden="true" />
                <span className="sr-only">{t("common.callStore")}</span>
                {storefront.contact.mobilePhone}
              </a>
              <a href={`mailto:${storefront.contact.email}`} className={footerLink}>
                <Mail className="size-3.5" aria-hidden="true" />
                {storefront.contact.email}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-t border-white/15 pt-8 sm:grid-cols-3 lg:border-s lg:border-t-0 lg:ps-12 lg:pt-1">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75 [.locale-fa_&]:tracking-normal">{t("footer.shop")}</h3>
              <ul className="mt-5 space-y-3">
                <li><Link href="/products" className={footerLink}>{t("footer.allProducts")}</Link></li>
                <li><Link href="/faq" className={footerLink}>{t("footer.faq")}</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75 [.locale-fa_&]:tracking-normal">{t("footer.company")}</h3>
              <ul className="mt-5 space-y-3">
                <li><Link href="/about" className={footerLink}>{t("common.about")}</Link></li>
                <li><Link href="/blog" className={footerLink}>{t("blog.title")}</Link></li>
                <li><Link href="/contact" className={footerLink}>{t("common.contact")}</Link></li>
              </ul>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white/75 [.locale-fa_&]:tracking-normal">{t("footer.connect")}</h3>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-3 sm:block sm:space-y-3">
                {socialLinks.map(([label, href]) => (
                  <li key={label}>
                    <a href={href} target="_blank" rel="noreferrer" className={footerLink}>{label}<ArrowUpRight className="size-3.5 rtl:rotate-180" /></a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start justify-between gap-5 border-t border-white/15 py-6 text-xs text-white/60 sm:flex-row sm:items-center">
          <p>{t("footer.copyright")}</p>
          <Link href="/contact" className="store-focus-invert rounded-sm underline decoration-white/25 underline-offset-4 hover:decoration-white/70">
            {t("common.contact")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
