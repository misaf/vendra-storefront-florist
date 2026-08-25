import Image from "next/image";
import { getTranslations } from "next-intl/server";
import type { LucideIcon } from "lucide-react";
import {
  ArrowUpRight,
  CalendarClock,
  MapPin,
  PhoneCall,
  Smartphone,
} from "lucide-react";
import { formatBusinessHours, toLocaleDigits } from "@/shared/lib/hours";
import { telHref } from "@/shared/lib/utils";
import type { StorefrontContact } from "@/shared/config/types";

/**
 * The contact page's opening: masthead and the four contact facts. All static
 * copy over data the page already has, so it renders on the server — it only
 * used to live in the client component because that component owned `t`.
 */
export async function ContactIntro({
  contactInfo,
  locale,
}: {
  contactInfo: StorefrontContact;
  locale: string;
}) {
  const t = await getTranslations({ locale });
  const mobilePhone = contactInfo.mobilePhone;
  const officePhone = contactInfo.officePhone;
  const businessHours = formatBusinessHours(
    contactInfo.hoursOpen,
    contactInfo.hoursClose,
    locale
  );

  return (
    <>
        <section className="border-b border-border bg-background text-card-foreground">
          <div className="store-container store-section grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
            <div>
              <p className="store-eyebrow mb-3">{t("contact.subtitle")}</p>
              <h1 className="store-page-title max-w-2xl text-foreground">
                {t("contact.title")}
              </h1>
              <p className="store-lede mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
                {t("contact.weLoveToHear")}
              </p>
            </div>

            {/* Picture, then caption underneath — not a caption laid over a
                scrimmed photograph. The scrim was costing the top two thirds
                of the image its contrast in order to make one sentence legible
                at the foot, and the sentence reads perfectly well on the page's
                own ground directly below. */}
            <div>
              <div className="organic-washed relative min-h-72 overflow-hidden rounded-3xl bg-secondary sm:min-h-[26rem]">
                <Image
                  src="/contact-consultation.webp"
                  alt=""
                  fill
                  preload
                  sizes="(min-width: 1024px) 44vw, 100vw"
                  className="object-cover"
                />
              </div>
              <p className="store-lede mt-4 max-w-xl text-sm text-muted-foreground">
                {t("contact.occasionOrderTip")}
              </p>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-background">
          <div className="store-container">
            <div className="grid gap-px bg-border sm:grid-cols-2 lg:grid-cols-4">
              <ContactItem
                icon={Smartphone}
                title={t("contact.mobilePhoneLabel")}
                value={toLocaleDigits(mobilePhone, locale)}
                description={t("contact.mobilePhoneDescription")}
                href={telHref(mobilePhone)}
                valueDir="ltr"
              />
              <ContactItem
                icon={PhoneCall}
                title={t("contact.officePhoneLabel")}
                value={toLocaleDigits(officePhone, locale)}
                description={t("contact.officePhoneDescription")}
                href={telHref(officePhone)}
                valueDir="ltr"
              />
              <ContactItem
                icon={MapPin}
                title={t("contact.address")}
                value={t("contact.addressValue")}
              />
              <ContactItem
                icon={CalendarClock}
                title={t("contact.hours")}
                value={businessHours}
                valueDir="ltr"
              />
            </div>
          </div>
        </section>
    </>
  );
}

function ContactItem({
  icon: Icon,
  title,
  value,
  description,
  href,
  valueDir,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  description?: string;
  href?: string;
  valueDir?: "ltr" | "rtl" | "auto";
}) {
  const content = (
    <div className="flex h-full flex-col gap-3.5 p-4 sm:p-5">
      <div className="flex items-center justify-between">
        {/* The system's accent medallion: the clay ramp's 100 under its 800. It
            was sand-800 under clay-700 — an ink disc carrying an ink glyph, at
            1.9:1, below the 3:1 that WCAG 1.4.11 asks of a meaningful icon. */}
        <span className="flex size-9 items-center justify-center rounded-full bg-clay-100 text-clay-800">
          <Icon className="size-4" />
        </span>
        {href && (
          <ArrowUpRight className="size-4 text-muted-foreground motion-safe:transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-primary" />
        )}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {title}
        </p>
        <p
          dir={valueDir}
          title={value}
          className={`mt-1.5 text-lg font-semibold leading-snug text-foreground ${
            valueDir === "ltr" ? "truncate" : "break-words"
          }`}
        >
          {value}
        </p>
        {description && (
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <a
        href={href}
        aria-label={`${title}: ${value}`}
        className="group block bg-background motion-safe:transition-colors hover:bg-card dark:bg-background dark:hover:bg-card"
      >
        {content}
      </a>
    );
  }

  return <div className="group bg-background dark:bg-background">{content}</div>;
}
