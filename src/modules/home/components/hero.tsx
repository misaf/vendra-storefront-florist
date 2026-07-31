"use client";

import Image from "next/image";
import { Link } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useProperty } from "@/shared/property/property-provider";
import { usePropertyName } from "@/shared/property/use-property-name";
import { cn, telHref } from "@/shared/lib/utils";
import { isRtlLocale } from "@/shared/lib/locale";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  MapPin,
  MessageCircle,
  Phone,
  Send,
  Smartphone,
} from "lucide-react";

interface HeroProps {
  title: string;
  subtitle: string;
  showButtons?: boolean;
}

export function Hero({ title, subtitle, showButtons = true }: HeroProps) {
  const { t, locale } = useTranslations();
  const property = useProperty();
  const storeName = usePropertyName();
  const consultText = t("home.heroConsult");
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  // The signature: shop the spectrum. Each chip is a real entry into the
  // catalogue, named by the colours people actually ask for.
  const colorChips = [
    { token: "var(--rose)", label: t("home.colorRose") },
    { token: "var(--marigold)", label: t("home.colorMarigold") },
    { token: "var(--iris)", label: t("home.colorIris") },
    { token: "var(--leaf)", label: t("home.colorLeaf") },
  ];

  // Phone numbers come from the property config rather than the message
  // catalogue: this is a client component, and a server-only CONTACT_* override
  // would render on the server and then differ after hydration.
  const heroMobile = property.contact.mobilePhone;
  const heroOffice = property.contact.officePhone;
  const contactItems = [
    { icon: MapPin, value: t("home.heroAddress") },
    {
      icon: Smartphone,
      value: heroMobile,
      dir: "ltr" as const,
      href: telHref(heroMobile),
    },
    {
      icon: Phone,
      value: heroOffice,
      dir: "ltr" as const,
      href: telHref(heroOffice),
    },
  ];
  const socialLinks = [
    {
      icon: MessageCircle,
      label: t("home.heroWhatsAppLabel"),
      href: `https://wa.me/${property.social.whatsappPhone}`,
    },
    {
      icon: Send,
      label: t("home.heroTelegramLabel"),
      href: `https://t.me/${property.social.telegramUsername}`,
    },
    {
      icon: Camera,
      label: t("home.heroInstagramLabel"),
      href: `https://www.instagram.com/${property.social.instagramUsername}`,
    },
  ];

  return (
    <section className="relative isolate overflow-hidden bg-background">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-5 pb-12 pt-28 sm:px-8 sm:pt-32 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-12 lg:px-10 lg:pb-20 lg:pt-36">
        {/* ── The thesis ── */}
        <div className="max-w-2xl">
          <div className="golzar-rise mb-6 inline-flex items-center gap-2.5 rounded-full border border-border bg-card/70 px-3.5 py-1.5">
            <span className="petal-dot" />
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
              {t("common.storeTagline")}
            </span>
          </div>

          <h1
            className="golzar-rise font-display text-[2.7rem] leading-[0.98] text-balance text-foreground sm:text-6xl lg:text-[4.6rem]"
            style={{ animationDelay: "80ms" }}
          >
            {title}
          </h1>

          <p
            className="golzar-rise mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
            style={{ animationDelay: "150ms" }}
          >
            {subtitle}
          </p>

          {/* ── Shop by colour — the spectrum ── */}
          <div className="golzar-rise mt-8" style={{ animationDelay: "220ms" }}>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-muted-foreground">
              {t("home.shopByColor")}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {colorChips.map((chip) => (
                <Button
                  key={chip.label}
                  asChild
                  variant="outline"
                  className="group rounded-full border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-card"
                >
                  <Link href="/products">
                    <span
                      aria-hidden="true"
                      className="size-3.5 rounded-full ring-2 ring-card transition-transform group-hover:scale-125"
                      style={{ backgroundColor: chip.token }}
                    />
                    {chip.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          {showButtons ? (
            <div
              className="golzar-rise mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
              style={{ animationDelay: "300ms" }}
            >
              <Button
                asChild
                size="lg"
                className="rounded-full px-7 text-base shadow-sm"
              >
                <Link href="/products">
                  {t("common.shopNow")}
                  <ArrowIcon className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="ghost"
                className="rounded-full px-5 text-base text-foreground hover:bg-secondary"
              >
                <Link href="/contact">{consultText}</Link>
              </Button>
            </div>
          ) : null}

          {/* ── Contact, kept quiet ── */}
          <div
            className="golzar-rise mt-9 flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-2"
            style={{ animationDelay: "380ms" }}
          >
            {contactItems.map((item) => {
              const Icon = item.icon;
              const inner = (
                <>
                  <Icon className="size-4 shrink-0 text-muted-foreground" />
                  <span dir={item.dir} className="truncate">
                    {item.value}
                  </span>
                </>
              );

              return item.href ? (
                <a
                  key={item.value}
                  href={item.href}
                  className="flex items-center gap-2 rounded-sm text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {inner}
                </a>
              ) : (
                <span
                  key={item.value}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  {inner}
                </span>
              );
            })}
            <span className="flex items-center gap-1.5 sm:ms-auto">
              {socialLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={item.label}
                    className="flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-foreground/30 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </span>
          </div>
        </div>

        {/* ── The colour field — photo set against offset bloom blocks ── */}
        <div className="relative">
          <div
            aria-hidden="true"
            style={{ animationDelay: "150ms" }}
            className={cn(
              "golzar-bloom-in absolute -top-5 size-40 rounded-[2rem] bg-foreground/[0.06] sm:size-52",
              isRTL ? "-left-3" : "-right-3"
            )}
          />
          <div
            aria-hidden="true"
            style={{ animationDelay: "300ms" }}
            className={cn(
              "golzar-bloom-in absolute -bottom-5 size-32 rounded-[2rem] bg-foreground/[0.1] sm:size-44",
              isRTL ? "-right-3" : "-left-3"
            )}
          />
          <div
            className="golzar-rise relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-secondary shadow-2xl shadow-foreground/15 ring-1 ring-border sm:aspect-[5/6]"
            style={{ animationDelay: "200ms" }}
          >
            <Image
              src="/hero-florist-studio-storefront.webp"
              alt={storeName}
              fill
              sizes="(min-width: 1024px) 45vw, 100vw"
              className="object-cover"
              quality={95}
              loading="eager"
              fetchPriority="high"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
