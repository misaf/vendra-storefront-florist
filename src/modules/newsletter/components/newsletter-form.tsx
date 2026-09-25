"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import { useStorefrontConfig } from "@/shared/config/storefront-context";
import { Loader2, CheckCircle2, Send } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";

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
 */
export default function NewsletterForm() {
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

  /* Field and action share one row and one 46px height, as the design pairs
     them; they only stack where the panel itself has stopped being two
     columns. Both are pills — a squared field beside a pill button was the one
     place in the storefront where the two disagreed. */
  const styles = {
    form: "flex flex-col gap-2.5 min-[26rem]:flex-row",
    input:
      "h-[2.875rem] border-border bg-background px-5 text-foreground placeholder:text-muted-foreground focus:bg-background",
    buttonSize: "lg" as const,
    button: "h-[2.875rem] gap-2 whitespace-nowrap px-[1.375rem]",
    alert: "mt-4",
    successAlert: "mt-4 border-border bg-background text-foreground",
  };

  const onSubmit = ({ email }: NewsletterFormValues) => {
    setError(null);
    try {
      /* There is no newsletter endpoint in the storefront contract. Opening a
         pre-addressed email keeps the feature useful without falsely claiming
         an address was subscribed when nothing left the browser. The visitor
         still reviews and sends the message in their own mail application. */
      window.location.href = `mailto:${storefront.contact.email}?subject=${encodeURIComponent(
        t("newsletter.requestSubject")
      )}&body=${encodeURIComponent(t("newsletter.requestBody", { email }))}`;

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
      {t("newsletter.subscribing")}
    </>
  ) : isSubmitted ? (
    <>
      <CheckCircle2 className="h-4 w-4" />
      {t("newsletter.subscribed")}
    </>
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
          aria-busy={isSubmitting}
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    inputMode="email"
                    spellCheck={false}
                    aria-required="true"
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
