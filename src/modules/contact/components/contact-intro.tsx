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
import { telHref } from "@/shared/lib/utils";
import type { ContactInfo } from "@/shared/lib/config";

const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];

function toLocaleDigits(value: string, locale: string): string {
  return locale === "fa"
    ? value.replace(/[0-9]/g, (digit) => PERSIAN_DIGITS[Number(digit)])
    : value;
}

function formatBusinessHours(open: string, close: string, locale: string): string {
  const separator = locale === "fa" ? "تا" : "–";
  return `${toLocaleDigits(open, locale)} ${separator} ${toLocaleDigits(close, locale)}`;
}

/**
 * The contact page's opening: masthead and the four contact facts. All static
 * copy over data the page already has, so it renders on the server — it only
 * used to live in the client component because that component owned `t`.
 */
export async function ContactIntro({
  contactInfo,
  locale,
}: {
  contactInfo: ContactInfo;
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

            <div className="relative min-h-72 overflow-hidden rounded-3xl bg-primary sm:min-h-[26rem]">
              <Image
                src="/contact-consultation.webp"
                alt=""
                fill
                preload
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="object-cover"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-storefront-brand/70 via-transparent to-transparent" />
              {/* The caption sits on its own plate rather than trusting the
                  photograph: a bright patch behind it dropped the text below
                  4.5:1, and which patch is bright depends on the image. */}
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                <p className="store-lede max-w-xl rounded-xl bg-storefront-brand/90 px-4 py-3 text-sm font-medium text-storefront-brand-foreground backdrop-blur-sm">
                  {t("contact.occasionOrderTip")}
                </p>
              </div>
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
        <span className="flex size-9 items-center justify-center rounded-full bg-storefront-brand-soft text-primary">
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
