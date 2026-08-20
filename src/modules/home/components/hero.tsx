"use client";

import Image from "next/image";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useProperty } from "@/shared/property/property-provider";
import { usePropertyName } from "@/shared/property/use-property-name";
import { telHref } from "@/shared/lib/utils";
import { isRtlLocale } from "@/shared/lib/locale";
import { ArrowLeft, ArrowRight, MapPin, MessageCircle, Phone } from "lucide-react";

interface HeroProps {
  showButtons?: boolean;
}

export function Hero({ showButtons = true }: HeroProps) {
  const { t, locale } = useTranslations();
  const property = useProperty();
  const storeName = usePropertyName();
  const ArrowIcon = isRtlLocale(locale) ? ArrowLeft : ArrowRight;
  const phone = property.contact.mobilePhone;

  return (
    <section className="relative border-b border-border/70 bg-background">
      {/* The display type is sized to leave the primary action above the fold on
          a short phone viewport; the copy block therefore precedes the image on
          mobile and sits beside it from lg up. */}
      <div className="store-container store-section-sm grid gap-8 lg:grid-cols-[1.05fr_minmax(0,1fr)] lg:items-center lg:gap-14 lg:py-16">
        <div className="relative z-10 max-w-2xl">
          <p className="store-eyebrow">{t("home.heroBadge")}</p>
          <h1 className="font-display mt-4 text-balance text-[clamp(2.25rem,6.4vw,3rem)] leading-[1.04] text-foreground [.locale-fa_&]:leading-[1.3] lg:mt-5 lg:text-[clamp(2.75rem,3.9vw,3.75rem)]">
            {t("home.title")}
          </h1>
          <p className="store-lede mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">
            {t("home.subtitle")}
          </p>

          {showButtons ? (
            <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button asChild size="lg" className="group justify-between px-7 sm:min-w-44">
                <Link href="/products">
                  {t("common.shopNow")}
                  <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-7">
                <Link href="/contact">{t("home.heroConsult")}</Link>
              </Button>
            </div>
          ) : null}

          {/* Where to find the shop and how to reach it — the two facts a local
              customer needs first. The service promises live in their own
              section below rather than being repeated here. */}
          <ul className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border pt-5 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <MapPin className="size-4 shrink-0 text-rose" aria-hidden="true" />
              <span className="font-medium text-foreground">{t("home.heroAddress")}</span>
            </li>
            <li>
              <a
                href={telHref(phone)}
                dir="ltr"
                className="-my-2 inline-flex min-h-11 items-center gap-2 rounded-sm py-2 font-semibold transition-colors hover:text-primary"
              >
                <Phone className="size-4 shrink-0" aria-hidden="true" />
                <span className="sr-only">{t("common.callStore")}</span>
                {phone}
              </a>
            </li>
            <li>
              <a
                href={`https://wa.me/${property.social.whatsappPhone}`}
                target="_blank"
                rel="noreferrer"
                className="-my-2 inline-flex min-h-11 items-center gap-2 rounded-sm py-2 font-semibold transition-colors hover:text-primary"
              >
                <MessageCircle className="size-4 shrink-0" aria-hidden="true" />
                WhatsApp
              </a>
            </li>
          </ul>
        </div>

        <div className="relative w-full">
          {/* Capped against the viewport height as well as its width: an
              uncapped 4:5 portrait made the hero taller than a laptop screen
              and pushed the headline halfway down the page. */}
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[clamp(1.25rem,2.5vw,2rem)] bg-secondary sm:aspect-[16/10] lg:aspect-[4/5] lg:max-h-[min(34rem,calc(100svh-11rem))]">
            <Image
              src={property.heroImage ?? "/hero-florist-studio-storefront.webp"}
              alt={storeName}
              fill
              sizes="(min-width: 1280px) 600px, (min-width: 1024px) 46vw, calc(100vw - 2rem)"
              className="object-cover"
              quality={85}
              preload
            />
          </div>
        </div>
      </div>
    </section>
  );
}
