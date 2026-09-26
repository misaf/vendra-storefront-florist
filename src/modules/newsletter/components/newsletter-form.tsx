"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { NewsletterFormView } from "@/shared/components/ui/newsletter-form-view";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useStorefrontConfig } from "@/shared/config/storefront-context";

function createNewsletterSchema(t: (key: string) => string) {
  return z.object({
    email: z.string().trim().email(t("contact.emailInvalid")),
  });
}

type NewsletterFormValues = z.infer<ReturnType<typeof createNewsletterSchema>>;

/**
 * Split into its own chunk: zod, react-hook-form and the resolver are a
 * meaningful share of the bundle, and this form sits below the fold on every
 * page that carries it.
 *
 * This owns validation and submission; the drawing is `NewsletterFormView`,
 * in the shared kit.
 *
 * `note` sits under the field and is dropped once the request is made — the
 * success alert takes its place.
 */
export default function NewsletterForm({ note }: { note?: string }) {
  const { t } = useTranslations();
  const storefront = useStorefrontConfig();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const newsletterSchema = useMemo(() => createNewsletterSchema(t), [t]);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const onSubmit = ({ email }: NewsletterFormValues) => {
    setError(null);
    try {
      /* There is no newsletter endpoint in the storefront contract. Opening a
         pre-addressed email keeps the feature useful without falsely claiming
         an address was subscribed when nothing left the browser. The visitor
         still reviews and sends the message in their own mail application. */
      window.location.href = `mailto:${storefront.contact.email}?subject=${encodeURIComponent(
        t("newsletter.requestSubject"),
      )}&body=${encodeURIComponent(t("newsletter.requestBody", { email }))}`;

      setIsSubmitted(true);
      form.reset();
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newsletter.error"));
    }
  };

  return (
    <>
      <NewsletterFormView
        status={
          isSubmitting ? "submitting" : isSubmitted ? "submitted" : "idle"
        }
        error={error}
        fieldError={form.formState.errors.email?.message}
        inputProps={form.register("email")}
        onSubmit={form.handleSubmit(onSubmit)}
        labels={{
          placeholder: t("newsletter.emailPlaceholder"),
          subscribe: t("newsletter.subscribe"),
          subscribing: t("newsletter.subscribing"),
          subscribed: t("newsletter.subscribed"),
          success: t("newsletter.success"),
        }}
      />
      {note && !isSubmitted ? (
        <p className="text-xs text-muted-foreground">{note}</p>
      ) : null}
    </>
  );
}
