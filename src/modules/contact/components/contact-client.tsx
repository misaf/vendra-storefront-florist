"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader } from "@/shared/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { Textarea } from "@/shared/components/ui/textarea";
import { useTranslations } from "@/shared/hooks/use-translations";
import { usePropertyName } from "@/shared/property/use-property-name";
import { Link } from "@/shared/i18n/navigation";
import type { ContactInfo } from "@/shared/lib/config";
import { useFaqs } from "@/modules/faq";
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronDown,
  Clock,
  HelpCircle,
  Loader2,
  MapPin,
  Send,
} from "lucide-react";
import { useBrandIcon } from "@/shared/property/use-brand-icon";

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
  contactInfo: ContactInfo;
  initialSubject?: string;
}) {
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const contactFormSchema = useMemo(() => createContactFormSchema(t), [t]);

  const email = contactInfo.email;

  const guidanceItems = [
    t("contact.supportNoteProducts"),
    t("contact.supportNoteCustom"),
    t("contact.supportNoteDelivery"),
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
    <>
        <VisitStudioMap mapQuery={contactInfo.mapQuery} locale={locale} t={t} />

        <section className="store-section">
          <div className="store-container grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
            <ContactFormCard
              form={form}
              isSubmitted={isSubmitted}
              isSubmitting={form.formState.isSubmitting}
              onSubmit={onSubmit}
              onReset={() => setIsSubmitted(false)}
              email={email}
              t={t}
            />

            <aside className="space-y-4 store-sticky-lg">
              <Card className="rounded-lg border-primary/10 bg-primary text-primary-foreground shadow-sm dark:border-white/10">
                <CardContent className="p-5">
                  <BrandIcon className="size-6 text-primary-foreground/80" />
                  <h2 className="mt-4 text-lg font-semibold">{t("contact.customerHelpTitle")}</h2>
                  <div className="mt-4 space-y-3">
                    {guidanceItems.map((item) => (
                      <p key={item} className="flex gap-3 text-sm leading-6 text-primary-foreground">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary-foreground/80" />
                        <span>{item}</span>
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <ContactFaqCard locale={locale} t={t} />
            </aside>
          </div>
        </section>
    </>
  );
}

function VisitStudioMap({
  mapQuery,
  locale,
  t,
}: {
  mapQuery: string;
  locale: string;
  t: (key: string) => string;
}) {
  const storeName = usePropertyName();
  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&hl=${locale}&output=embed`;
  const directionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapQuery)}`;

  return (
    <section className="border-b border-border bg-background">
      <div className="store-container store-section">
        <div className="mb-7 max-w-2xl sm:mb-9">
          <span className="golzar-seam mb-3 max-w-[7rem]">
            <span className="petal-dot" aria-hidden="true" />
            <span className="h-px flex-1" aria-hidden="true" />
          </span>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {t("contact.visitEyebrow")}
          </p>
          <h2 className="font-display mt-3 text-2xl leading-tight sm:text-3xl">
            {t("contact.visitTitle")}
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base sm:leading-8">
            {t("contact.visitDescription")}
          </p>
        </div>

        <div className="relative">
          {/* Offset frame — the editorial inset rectangle used on the About hero. */}
          <div
            className="pointer-events-none absolute -inset-2 rounded-xl border border-border sm:-inset-3"
            aria-hidden="true"
          />
          <div className="relative overflow-hidden rounded-lg border border-border bg-storefront-brand-soft shadow-lg shadow-storefront-brand/10">
            <iframe
              title={t("contact.mapLabel")}
              src={embedUrl}
              className="golzar-map block h-80 w-full border-0 sm:h-[26rem] lg:h-[30rem]"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            {/* Ink address plate — same primary card as the help panel. */}
            <div className="pointer-events-none absolute inset-x-3 bottom-3 sm:inset-x-5 sm:bottom-5">
              <div className="pointer-events-auto max-w-sm rounded-lg bg-primary p-4 text-primary-foreground shadow-xl shadow-storefront-brand/30 sm:p-5">
                <div className="flex items-center gap-2">
                  <MapPin className="size-4 shrink-0 text-primary-foreground/80" />
                  <p className="font-display text-base font-semibold leading-tight sm:text-lg">
                    {storeName}
                  </p>
                </div>
                <p className="mt-1.5 text-sm leading-6 text-primary-foreground/85">
                  {t("contact.addressValue")}
                </p>
                <a
                  href={directionsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="store-focus-invert mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-primary-foreground px-4 py-2 text-sm font-semibold text-primary shadow-sm motion-safe:transition hover:opacity-90"
                >
                  {t("contact.getDirections")}
                  <ArrowUpRight className="size-4 rtl:rotate-180" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContactFaqCard({
  locale,
  t,
}: {
  locale: string;
  t: (key: string) => string;
}) {
  const { data: faqs, isPending } = useFaqs(locale, { perPage: 5 });

  // Secondary content: skeleton while loading, hide entirely on error/empty.
  if (isPending) {
    return (
      <Card className="rounded-lg border-border bg-card shadow-sm">
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <HelpCircle className="size-5 text-muted-foreground" />
            <h2 className="text-lg font-semibold">{t("contact.faqTitle")}</h2>
          </div>
          <div className="mt-4 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const answeredFaqs = faqs.filter((faq) => faq.answer.trim().length > 0);

  if (answeredFaqs.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-lg border-border bg-card shadow-sm">
      <CardContent className="p-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="size-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">{t("contact.faqTitle")}</h2>
        </div>
        <div className="mt-3 divide-y divide-border">
          {answeredFaqs.map((faq) => (
            <details key={faq.id} className="group py-3">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 rounded-sm text-sm font-medium text-card-foreground">
                <span>{faq.question}</span>
                <ChevronDown className="size-4 shrink-0 text-muted-foreground motion-safe:transition-transform group-open:rotate-180" />
              </summary>
              {faq.answer && (
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  {faq.answer}
                </p>
              )}
            </details>
          ))}
        </div>
        <Link
          href="/faq"
          className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-sm text-sm font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
        >
          {t("contact.faqViewAll")}
          <ArrowRight className="size-4 rtl:rotate-180" />
        </Link>
      </CardContent>
    </Card>
  );
}

function ContactFormCard({
  form,
  isSubmitted,
  isSubmitting,
  onSubmit,
  onReset,
  email,
  t,
}: {
  form: ReturnType<typeof useForm<ContactFormValues>>;
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
    <Card className="overflow-hidden rounded-lg border-border bg-card py-0 shadow-lg shadow-storefront-brand/5">
      <CardHeader className="gap-0 px-5 pt-7 pb-0 sm:px-9 sm:pt-9">
        <h2 className="text-2xl font-semibold leading-tight sm:text-3xl lg:text-4xl">
          {t("contact.formTitle")}
        </h2>
        <CardDescription className="mt-2 max-w-xl text-sm leading-6">
          {t("contact.formDescription")}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 py-7 sm:px-9 sm:py-9">
        {isSubmitted ? (
          <div
            ref={successRef}
            tabIndex={-1}
            role="status"
            className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-primary/30 bg-storefront-brand-soft px-6 text-center"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-storefront-brand/20">
              <CheckCircle2 className="size-8" />
            </div>
            <h2 className="mt-5 text-2xl font-semibold">{t("contact.messageSent")}</h2>
            <p className="mt-2 max-w-md text-sm leading-7 text-muted-foreground">
              {t("contact.messageSentDescription")}
            </p>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              {t("contact.messageSentFallback")}{" "}
              <a
                href={`mailto:${email}`}
                dir="ltr"
                className="font-medium text-foreground underline underline-offset-4 hover:text-muted-foreground"
              >
                {email}
              </a>
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={onReset}
              className="mt-6 rounded-full px-6"
            >
              {t("contact.sendAnother")}
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-7">
              <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
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

                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("contact.subject")}</FormLabel>
                      <FormControl>
                        <Input
                          className={underlineFieldClass}
                          placeholder={t("contact.subjectPlaceholder")}
                          aria-required="true"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
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
                        className="min-h-32 resize-none rounded-none border-0 border-b border-border bg-transparent px-0 py-2 text-base shadow-none focus-visible:border-primary dark:bg-transparent"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex flex-col gap-4 border-t border-border pt-6">
                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2 rounded-full px-8 shadow-lg shadow-storefront-brand/15"
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
                <div className="flex items-center justify-center gap-2 text-xs leading-5 text-muted-foreground">
                  <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                  <span>{t("contact.privacyNote")}</span>
                </div>
              </div>
            </form>
          </Form>
        )}
      </CardContent>
    </Card>
  );
}

const underlineFieldClass =
  "h-11 rounded-none border-0 border-b border-border bg-transparent px-0 text-base shadow-none focus-visible:border-primary dark:bg-transparent";
