"use client";

import { Link } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { useStorefrontName } from "@/shared/config/storefront-context";
import { Newsletter } from "@/modules/newsletter";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useBrandIcon } from "@/shared/config/storefront-context";

const footerLink =
  "store-focus-invert -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm text-white/80 transition-colors hover:text-white";

export function Footer({ showNewsletter = true }: { showNewsletter?: boolean }) {
  const BrandIcon = useBrandIcon();
  const { t } = useTranslations();
  const storefront = useStorefrontConfig();
  const storeName = useStorefrontName();
  const socialLinks = [
    ["Instagram", `https://www.instagram.com/${storefront.social.instagramUsername}`],
    ["Telegram", `https://t.me/${storefront.social.telegramUsername}`],
    ["WhatsApp", `https://wa.me/${storefront.social.whatsappPhone}`],
  ] as const;

  return (
    <footer className="bg-storefront-brand text-white">
      <div className="store-container">
        {showNewsletter ? (
          <div className="store-section-sm grid gap-6 border-b border-white/15 lg:grid-cols-[1fr_minmax(22rem,0.85fr)] lg:items-center">
            <div>
              <h2 className="font-display text-2xl text-white sm:text-3xl [.locale-fa_&]:leading-[1.5]">
                {t("newsletter.title")}
              </h2>
              <p className="store-lede mt-2 max-w-xl text-sm text-white/75 sm:text-base">
                {t("newsletter.description")}
              </p>
            </div>
            <Newsletter variant="compact" />
          </div>
        ) : null}

        <div className="store-section grid gap-10 lg:grid-cols-[1.25fr_1.75fr] lg:gap-16">
          <div>
            <Link href="/" className="store-focus-invert inline-flex items-center gap-3 rounded-lg">
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-primary"><BrandIcon className="size-5" /></span>
              <span className="font-display text-2xl text-white">{storeName}</span>
            </Link>
            <p className="mt-5 max-w-md text-sm leading-7 text-white/80">{t("home.subtitle")}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-white/80"><ShieldCheck className="size-4" />{t("footer.support")}</p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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

        <div className="flex flex-col items-center justify-between gap-5 border-t border-white/15 py-6 text-xs text-white/75 sm:flex-row">
          <p>{t("footer.copyright")}</p>
        </div>
      </div>
    </footer>
  );
}
