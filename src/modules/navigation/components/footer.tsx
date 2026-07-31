"use client";

import { Link } from "@/shared/i18n/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useProperty } from "@/shared/property/property-provider";
import { usePropertyName } from "@/shared/property/use-property-name";
import { Newsletter } from "@/modules/newsletter";
import { Flower2, ShieldCheck } from "lucide-react";

const linkClassName = "text-sm text-muted-foreground transition-colors hover:text-primary";

interface FooterProps {
  showNewsletter?: boolean;
}

export function Footer({ showNewsletter = true }: FooterProps) {
  const { t } = useTranslations();
  const property = useProperty();
  const storeName = usePropertyName();
  const socialLinks = [
    {
      label: "Instagram",
      href: `https://www.instagram.com/${property.social.instagramUsername}`,
      labelKey: "home.heroInstagramLabel",
    },
    {
      label: "Telegram",
      href: `https://t.me/${property.social.telegramUsername}`,
      labelKey: "home.heroTelegramLabel",
    },
    {
      label: "WhatsApp",
      href: `https://wa.me/${property.social.whatsappPhone}`,
      labelKey: "home.heroWhatsAppLabel",
    },
  ] as const;
  const enamadContainerRef = useRef<HTMLDivElement | null>(null);
  const [showEnamadFallback, setShowEnamadFallback] = useState(true);
  const enamadHtml =
    "<a referrerpolicy='origin' target='_blank' href='https://trustseal.enamad.ir/?id=5767588&Code=a0tdleVtDMJCDPR9WxSCD59wOLhHcUyO'><img referrerpolicy='origin' src='https://trustseal.enamad.ir/logo.aspx?id=5767588&Code=a0tdleVtDMJCDPR9WxSCD59wOLhHcUyO' alt='' style='cursor:pointer' code='a0tdleVtDMJCDPR9WxSCD59wOLhHcUyO'></a>";

  useEffect(() => {
    const imageElement = enamadContainerRef.current?.querySelector("img");
    if (!imageElement) {
      return;
    }

    const isLoaded = () => imageElement.complete && imageElement.naturalWidth > 0;
    const handleLoad = () => setShowEnamadFallback(false);
    const handleError = () => setShowEnamadFallback(true);

    imageElement.addEventListener("load", handleLoad);
    imageElement.addEventListener("error", handleError);

    // The image may already be cached/complete before the listeners attach.
    if (isLoaded()) {
      setShowEnamadFallback(false);
    }

    const fallbackTimer = window.setTimeout(() => {
      setShowEnamadFallback(!isLoaded());
    }, 3500);

    return () => {
      imageElement.removeEventListener("load", handleLoad);
      imageElement.removeEventListener("error", handleError);
      window.clearTimeout(fallbackTimer);
    };
  }, []);

  return (
    <footer className="relative border-t border-border bg-storefront-brand-soft dark:bg-background">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 -top-px mx-auto h-px max-w-7xl bg-[linear-gradient(to_right,transparent,var(--rose)_22%,var(--marigold)_42%,var(--iris)_62%,var(--leaf)_82%,transparent)] opacity-80"
      />
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {showNewsletter ? (
          <div className="mb-10 rounded-lg border border-border bg-card p-5 text-card-foreground shadow-sm sm:p-6">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-display text-xl font-medium text-card-foreground">
                  {t("newsletter.title") || "Newsletter"}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {t("newsletter.description") || "Get the latest updates and offers."}
                </p>
              </div>
              <div className="w-full sm:w-[26rem]">
                <Newsletter variant="compact" />
              </div>
            </div>
          </div>
        ) : null}

        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground ring-2 ring-border">
                <Flower2 className="size-5" />
              </span>
              <span className="font-display text-xl font-medium text-foreground">
                {storeName}
              </span>
            </Link>
            <p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">
              {t("home.subtitle")}
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              <ShieldCheck className="size-4" />
              {t("footer.support")}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 md:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
              {t("footer.company")}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/about" className={linkClassName}>
                    {t("common.about")}
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className={linkClassName}>
                    {t("blog.title")}
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className={linkClassName}>
                    {t("common.contact")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t("footer.shop")}
              </h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="/products" className={linkClassName}>
                    {t("footer.allProducts")}
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className={linkClassName}>
                    {t("footer.faq")}
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-foreground">
                {t("footer.connect")}
              </h3>
              <ul className="mt-4 space-y-2">
                {socialLinks.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={t(social.labelKey)}
                      className={linkClassName}
                    >
                      {social.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6">
          <div
            ref={enamadContainerRef}
            className="mb-3 flex justify-center"
            dangerouslySetInnerHTML={{ __html: enamadHtml }}
          />
          {showEnamadFallback ? (
            <p className="mb-3 text-center text-xs text-muted-foreground">
              {t("footer.enamadFallback")}
            </p>
          ) : null}
          <p className="text-center text-sm text-muted-foreground">
            {t("footer.copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
