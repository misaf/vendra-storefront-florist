"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontName } from "@/shared/config/storefront-context";
import type { StorefrontContact } from "@/shared/config/types";
import type { LucideIcon } from "lucide-react";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  PhoneCall,
  Send,
  Smartphone,
} from "lucide-react";
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
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { formatBusinessHours, toLocaleDigits } from "@/shared/lib/hours";
import { cn, telHref } from "@/shared/lib/utils";

function createContactFormSchema(t: (key: string) => string) {
  return z.object({
    name: z.string().trim().min(2, t("contact.nameRequired")),
    email: z.string().trim().email(t("contact.emailInvalid")),
    phone: z.string().optional(),
    subject: z.string().trim().min(3, t("contact.subjectRequired")),
    message: z.string().trim().min(10, t("contact.messageRequired")),
  });
}

type ContactFormValues = z.infer<ReturnType<typeof createContactFormSchema>>;

export default function ContactClient({
  contactInfo,
  initialSubject = "",
}: {
  contactInfo: StorefrontContact;
  initialSubject?: string;
}) {
  const { t, locale } = useTranslations();
  const { social } = useStorefrontConfig();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contactFormSchema = useMemo(() => createContactFormSchema(t), [t]);

  const email = contactInfo.email;

  /* The five things people actually walk in asking for. Content, so they live
     in the message catalogue and a shop can rename them. */
  const occasions = [
    t("contact.occasionBouquet"),
    t("contact.occasionWedding"),
    t("contact.occasionEvent"),
    t("contact.occasionSympathy"),
    t("contact.occasionCorporate"),
  ];

  const socialLinks = [
    { label: "WhatsApp", href: whatsappUrl(social.whatsappPhone), Icon: WhatsAppIcon },
    { label: "Telegram", href: telegramProfileUrl(social.telegramUsername), Icon: TelegramIcon },
    { label: "Instagram", href: instagramProfileUrl(social.instagramUsername), Icon: InstagramIcon },
  ];

  /* The four facts, in the column beside the form rather than in a band of
     their own above it. Every one is store configuration the page already
     holds. */
  const details: Array<{
    icon: LucideIcon;
    title: string;
    value: string;
    href?: string;
    valueDir?: "ltr" | "rtl" | "auto";
  }> = [
    {
      icon: Smartphone,
      title: t("contact.mobilePhoneLabel"),
      value: toLocaleDigits(contactInfo.mobilePhone, locale),
      href: telHref(contactInfo.mobilePhone),
      valueDir: "ltr",
    },
    {
      icon: PhoneCall,
      title: t("contact.officePhoneLabel"),
      value: toLocaleDigits(contactInfo.officePhone, locale),
      href: telHref(contactInfo.officePhone),
      valueDir: "ltr",
    },
    {
      icon: MapPin,
      title: t("contact.address"),
      value: t("contact.addressValue"),
    },
    {
      icon: CalendarClock,
      title: t("contact.hours"),
      value: formatBusinessHours(
        contactInfo.hoursOpen,
        contactInfo.hoursClose,
        locale
      ),
      valueDir: "ltr",
    },
    {
      icon: Mail,
      title: t("contact.email"),
      value: email,
      href: `mailto:${email}`,
      valueDir: "ltr",
    },
  ];

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: initialSubject,
      message: "",
    },
  });

  const onSubmit = async (values: ContactFormValues) => {
    const body = [
      `${t("contact.name")}: ${values.name}`,
      `${t("contact.email")}: ${values.email}`,
      values.phone ? `${t("contact.phone")}: ${values.phone}` : "",
      "",
      values.message,
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:${email}?subject=${encodeURIComponent(values.subject)}&body=${encodeURIComponent(body)}`;

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSubmitted(true);
    form.reset();
  };

  return (
    <section className="store-container pb-[6.25rem] pt-[0.5rem]">
      {/* One band, two columns: the form on one side and, on the other, the
          studio as a person would ask for it — a look at the bench, where it
          is, the accounts it answers on, and the four facts underneath. The
          page used to spend a full-width map band and a masthead photograph
          before reaching either. */}
      <div className="grid items-start gap-[clamp(1.875rem,4vw,3.5rem)] [grid-template-columns:repeat(auto-fit,minmax(min(100%,20.625rem),1fr))]">
        <ContactForm
          form={form}
          occasions={occasions}
          isSubmitted={isSubmitted}
          isSubmitting={form.formState.isSubmitting}
          onSubmit={onSubmit}
          onReset={() => setIsSubmitted(false)}
          email={email}
          t={t}
        />

        <aside className="flex flex-col gap-6">
          <div className="organic-washed overflow-hidden rounded-[2rem] shadow-card">
            <Image
              src="/contact-consultation.webp"
              alt=""
              width={720}
              height={450}
              sizes="(min-width: 64rem) 34rem, calc(100vw - 2rem)"
              className="aspect-[16/10] w-full object-cover"
            />
          </div>

          <StudioMap mapQuery={contactInfo.mapQuery} locale={locale} t={t} />

          <div className="flex flex-wrap gap-2.5">
            {socialLinks.map(({ label, href, Icon }) => (
              <Button key={label} asChild variant="outline" size="sm" className="gap-2">
                <a href={href} target="_blank" rel="noreferrer">
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </a>
              </Button>
            ))}
          </div>

          <div className="flex flex-col">
            {details.map((detail) => (
              <ContactDetail key={detail.title} {...detail} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  );
}

/**
 * One fact about the shop: the system's clay medallion, the label, the value.
 * Ruled underneath rather than boxed — four boxes beside a form card read as a
 * second form.
 */
function ContactDetail({
  icon: Icon,
  title,
  value,
  href,
  valueDir,
}: {
  icon: LucideIcon;
  title: string;
  value: string;
  href?: string;
  valueDir?: "ltr" | "rtl" | "auto";
}) {
  const body = (
    <>
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-clay-100 text-clay-800"
        aria-hidden="true"
      >
        <Icon className="size-4" />
      </span>
      <span className="min-w-0">
        <span className="font-display block text-[0.9375rem] leading-tight text-foreground">
          {title}
        </span>
        <span
          dir={valueDir}
          className="store-dynamic-text mt-1 block text-sm leading-[1.55] text-foreground/75"
        >
          {value}
        </span>
      </span>
    </>
  );

  return (
    <div className="border-b border-border py-5">
      {href ? (
        <a
          href={href}
          aria-label={`${title}: ${value}`}
          className="group flex items-start gap-4 rounded-sm transition-colors hover:[&_span]:text-foreground"
        >
          {body}
        </a>
      ) : (
        <div className="flex items-start gap-4">{body}</div>
      )}
    </div>
  );
}

/**
 * The studio on a map, as a plate in the column beside the form: the embed on
 * top, and a single link bar across its foot on the warm surface.
 *
 * It replaced a full-width band of its own — an eyebrow, a heading, a
 * paragraph, a 30rem embed inside an offset frame, and an ink address plate
 * floating over the bottom of it. Five objects to say where the shop is.
 */
function StudioMap({
  mapQuery,
  locale,
  t,
}: {
  mapQuery: string;
  locale: string;
  t: (key: string) => string;
}) {
  const storeName = useStorefrontName();
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&hl=${locale}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <div className="overflow-hidden rounded-[2rem] bg-secondary shadow-card">
      <iframe
        title={`${t("contact.mapLabel")} — ${storeName}`}
        src={embedUrl}
        className="store-map block aspect-[16/11] w-full border-0"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      <a
        href={directionsUrl}
        target="_blank"
        rel="noreferrer"
        className="flex min-h-11 items-center gap-2.5 bg-card px-5 py-3.5 text-[0.84375rem] text-rose transition-colors hover:bg-clay-100"
      >
        <MapPin className="size-4 shrink-0" aria-hidden="true" />
        <span className="store-dynamic-text">
          {t("contact.getDirections")} — {t("contact.addressValue")}
        </span>
      </a>
    </div>
  );
}

/**
 * The design's card: the warm surface, the system's deepest container radius
 * and one elevation step. It used to be a full-width band ruled top and bottom,
 * carrying a masthead-sized `h2` above the fields — a second page title inside
 * the page.
 */
function ContactForm({
  form,
  occasions,
  isSubmitted,
  isSubmitting,
  onSubmit,
  onReset,
  email,
  t,
}: {
  form: ReturnType<typeof useForm<ContactFormValues>>;
  /** The occasions offered by the subject select, in the shop's own words. */
  occasions: string[];
  isSubmitted: boolean;
  isSubmitting: boolean;
  onSubmit: (values: ContactFormValues) => Promise<void>;
  onReset: () => void;
  email: string;
  t: (key: string) => string;
}) {
  const successRef = useRef<HTMLDivElement>(null);

  // Move focus to the confirmation when the form swaps to the success state,
  // so keyboard and screen-reader users land on the new content instead of
  // having focus fall back to <body>.
  useEffect(() => {
    if (isSubmitted) {
      successRef.current?.focus();
    }
  }, [isSubmitted]);

  return (
    <section className="rounded-[2rem] bg-card px-[clamp(1.375rem,3vw,2.125rem)] pb-[2.375rem] pt-[clamp(1.375rem,3vw,2.125rem)] text-card-foreground shadow-panel">
      <header className="mb-6">
        <h2 className="font-display text-2xl leading-tight">
          {t("contact.formTitle")}
        </h2>
        <p className="store-lede mt-2 max-w-xl text-sm text-card-foreground/75">
          {t("contact.formDescription")}
        </p>
      </header>

      <div>
        {isSubmitted ? (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="flex flex-col items-center justify-center px-2 py-10 text-center"
          >
            {/* Sage, the system's colour for a thing that went right. */}
            <div className="flex size-[4.25rem] items-center justify-center rounded-full bg-leaf text-background">
              <CheckCircle2 className="size-8" />
            </div>
            <h3 className="font-display mt-5 text-2xl">
              {t("contact.messageSent")}
            </h3>
            <p className="mt-2 max-w-md text-sm leading-7 text-card-foreground/75">
              {t("contact.messageSentDescription")}
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-card-foreground/75">
              {t("contact.messageSentFallback")}{" "}
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="store-dynamic-text font-medium text-rose underline underline-offset-4"
              >
                {email}
              </a>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="mt-6 px-6"
            >
              {t("contact.sendAnother")}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-[1.125rem]"
            >
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11.875rem),1fr))]">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.name")}</FormLabel>
                      <FormControl>
                        <Input
                          className={underlineFieldClass}
                          placeholder={t("contact.namePlaceholder")}
                          autoComplete="name"
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.email")}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          className={underlineFieldClass}
                          placeholder={t("contact.emailPlaceholder")}
                          autoComplete="email"
                          autoCapitalize="none"
                          spellCheck={false}
                          aria-required="true"
                          dir="ltr"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(min(100%,11.875rem),1fr))]">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {t("contact.phone")}
                        <span className="font-normal text-muted-foreground">
                          ({t("contact.optional")})
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="tel"
                          className={underlineFieldClass}
                          placeholder={t("contact.phonePlaceholder")}
                          autoComplete="tel"
                          inputMode="tel"
                          dir="ltr"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* The design asks for the *occasion*, not a free-text subject,
                    because on a florist's form that is the one answer which
                    changes what gets made. It writes into the same `subject`
                    the form has always sent, so the FAQ's "?subject=…" deep
                    links still arrive intact — an incoming subject that is not
                    one of the listed occasions is kept as its own option
                    rather than silently discarded. */}
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => {
                    const preset =
                      field.value && !occasions.includes(field.value)
                        ? [field.value]
                        : [];

                    return (
                      <FormItem>
                        <FormLabel>{t("contact.occasion")}</FormLabel>
                        <FormControl>
                          <select
                            {...field}
                            aria-required="true"
                            className={cn(
                              underlineFieldClass,
                              "w-full cursor-pointer appearance-none rounded-full border border-input px-5 pe-10 text-foreground"
                            )}
                          >
                            <option value="">
                              {t("contact.occasionPlaceholder")}
                            </option>
                            {[...preset, ...occasions].map((occasion) => (
                              <option key={occasion} value={occasion}>
                                {occasion}
                              </option>
                            ))}
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("contact.message")}</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("contact.messagePlaceholder")}
                        aria-required="true"
                        className="min-h-32 resize-none rounded-[1.375rem] bg-background px-4 py-3 text-base"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-3 pt-1">
                <Button
                  type="submit"
                  size="lg"
                  className="h-12 w-full gap-2 px-8 text-[0.9375rem]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-4 motion-safe:animate-spin" />
                      {t("contact.sending")}
                    </>
                  ) : (
                    <>
                      <Send className="size-4" />
                      {t("contact.sendMessage")}
                    </>
                  )}
                </Button>
                <p className="flex items-start gap-2 text-[0.78125rem] leading-5 text-card-foreground/60">
                  <Clock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                  <span>{t("contact.privacyNote")}</span>
                </p>
              </div>
            </form>
          </Form>
        )}
      </div>
    </section>
  );
}

/* Fields sit on the page colour inside the card, so a filled control reads as
   a control rather than as another shade of the same plate. */
const underlineFieldClass = "h-11 bg-background text-base";
