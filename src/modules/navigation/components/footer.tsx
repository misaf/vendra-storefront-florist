"use client";

import { Link } from "@/shared/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useProperty } from "@/shared/property/property-provider";
import { usePropertyName } from "@/shared/property/use-property-name";
import { Newsletter } from "@/modules/newsletter";
import { ArrowUpRight, ShieldCheck } from "lucide-react";
import { useBrandIcon } from "@/shared/property/use-brand-icon";

const footerLink =
  "store-focus-invert -my-2 inline-flex min-h-11 items-center gap-1.5 rounded-sm py-2 text-sm text-white/80 transition-colors hover:text-white";

export function Footer({ showNewsletter = true }: { showNewsletter?: boolean }) {
  const BrandIcon = useBrandIcon();
  const { t } = useTranslations();
  const property = useProperty();
  const storeName = usePropertyName();
  const sealRef = useRef<HTMLDivElement | null>(null);
  const [showSealFallback, setShowSealFallback] = useState(true);
  const trustSeal = property.trustSeal;
  const trustSealLabel = t("footer.enamadLabel");
  const sealHtml = trustSeal
    ? `<a aria-label='${trustSealLabel}' referrerpolicy='origin' target='_blank' rel='noreferrer' href='https://trustseal.enamad.ir/?id=${trustSeal.id}&Code=${trustSeal.code}'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=${trustSeal.id}&Code=${trustSeal.code}' alt='${trustSealLabel}' style='cursor:pointer' code='${trustSeal.code}'></a>`
    : null;

  useEffect(() => {
    const image = sealRef.current?.querySelector("img");
    if (!image) return;
    const loaded = () => image.complete && image.naturalWidth > 0;
    const handleLoad = () => setShowSealFallback(false);
    const handleError = () => setShowSealFallback(true);
    image.addEventListener("load", handleLoad);
    image.addEventListener("error", handleError);
    if (loaded()) setShowSealFallback(false);
    const timer = window.setTimeout(() => setShowSealFallback(!loaded()), 3500);
    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
      window.clearTimeout(timer);
    };
  }, []);

  const socialLinks = [
    ["Instagram", `https://www.instagram.com/${property.social.instagramUsername}`],
    ["Telegram", `https://t.me/${property.social.telegramUsername}`],
    ["WhatsApp", `https://wa.me/${property.social.whatsappPhone}`],
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
          {sealHtml ? (
            <div className="text-center">
              <div ref={sealRef} className="[&_a]:inline-flex [&_a]:min-h-11 [&_a]:items-center [&_img]:max-h-14 [&_img]:w-auto" dangerouslySetInnerHTML={{ __html: sealHtml }} />
              {showSealFallback ? <p>{t("footer.enamadFallback")}</p> : null}
            </div>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
