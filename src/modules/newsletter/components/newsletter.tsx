"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Mail, Loader2, CheckCircle2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface NewsletterProps {
  variant?: "default" | "compact";
  className?: string;
}

export function Newsletter({ variant = "default", className = "" }: NewsletterProps) {
  const { t } = useTranslations();

  if (variant === "compact") {
    return (
      <div className={className}>
        <NewsletterForm compact />
      </div>
    );
  }

  return (
    <section className={`bg-background py-16 sm:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid overflow-hidden rounded-2xl border border-border bg-storefront-brand-soft shadow-2xl shadow-foreground/10 dark:border-white/10 dark:bg-storefront-surface lg:grid-cols-[0.85fr_1.15fr]">
          <div className="relative min-h-72 overflow-hidden bg-primary lg:min-h-[30rem]">
            <Image
              src="/hero-florist-studio.webp"
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-storefront-brand/80 via-storefront-brand/15 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 text-storefront-brand-foreground sm:p-8">
              <span className="inline-flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-[0.18em] text-storefront-brand-foreground/75">
                <Mail className="h-4 w-4" />
                {t("newsletter.title")}
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="max-w-2xl">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground ring-4 ring-foreground/10">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="font-display mt-6 text-3xl leading-tight text-foreground sm:text-4xl">
                {t("newsletter.title")}
              </h2>
              <p className="mt-4 text-base leading-8 text-muted-foreground">
                {t("newsletter.description")}
              </p>
            </div>

            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}

function NewsletterForm({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslations();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: { email: "" },
  });
  const isSubmitting = form.formState.isSubmitting;

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  const styles = compact
    ? {
        form: "flex gap-2",
        input: "min-w-0 border-border bg-card/80",
        buttonSize: "default" as const,
        button: "rounded-full",
        alert: "mt-2",
        successAlert:
          "mt-2 border-primary/30 bg-storefront-brand-soft text-primary dark:bg-storefront-brand-soft dark:text-primary",
      }
    : {
        form: "mt-8 flex flex-col gap-3 sm:flex-row",
        input:
          "h-11 rounded-full border-border bg-card px-5 text-card-foreground placeholder:text-muted-foreground focus:bg-card",
        buttonSize: "lg" as const,
        button: "gap-2 whitespace-nowrap rounded-full",
        alert: "mt-4",
        successAlert: "mt-4 border-border bg-secondary text-foreground",
      };

  const onSubmit = async () => {
    setError(null);
    try {
      // Simulated demo flow, matching the checkout module: no backend route is
      // called and no data leaves the browser.
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setIsSubmitted(true);
      form.reset();
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(() => setIsSubmitted(false), 5000);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("newsletter.error"));
    }
  };

  const buttonContent = isSubmitting ? (
    <>
      <Loader2 className="h-4 w-4 animate-spin" />
      {!compact && t("newsletter.subscribing")}
    </>
  ) : isSubmitted ? (
    <>
      <CheckCircle2 className="h-4 w-4" />
      {!compact && t("newsletter.subscribed")}
    </>
  ) : compact ? (
    t("newsletter.subscribe")
  ) : (
    <>
      <Send className="h-4 w-4" />
      {t("newsletter.subscribe")}
    </>
  );

  return (
    <>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className={styles.form}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t("newsletter.emailPlaceholder")}
                    aria-label={t("newsletter.emailPlaceholder")}
                    className={styles.input}
                    suppressHydrationWarning
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting || isSubmitted}
            size={styles.buttonSize}
            className={styles.button}
          >
            {buttonContent}
          </Button>
        </form>
      </Form>

      {error && (
        <Alert variant="destructive" role="alert" className={styles.alert}>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isSubmitted && (
        <Alert
          role="status"
          aria-live="polite"
          className={styles.successAlert}
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{t("newsletter.success")}</AlertDescription>
        </Alert>
      )}
    </>
  );
}
