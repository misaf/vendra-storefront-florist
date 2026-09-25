"use client"

import * as React from "react"
import { CheckCircle2, Loader2, Send } from "lucide-react"

import { Alert, AlertDescription } from "./alert"
import { Button } from "./button"
import { Input } from "./input"

type NewsletterStatus = "idle" | "submitting" | "submitted"

interface NewsletterFormLabels {
  placeholder: string
  subscribe: string
  subscribing: string
  subscribed: string
  success: string
}

const DEFAULT_LABELS: NewsletterFormLabels = {
  placeholder: "Your email address",
  subscribe: "Subscribe",
  subscribing: "Subscribing…",
  subscribed: "Subscribed",
  success: "Thanks — check your inbox to confirm.",
}

interface NewsletterFormViewProps {
  status?: NewsletterStatus
  /** A failed submission, shown under the row. */
  error?: string | null
  /** The email field's own validation message. */
  fieldError?: string
  /** Spread onto the email input — `register("email")` from a form library. */
  inputProps?: React.ComponentProps<"input">
  labels?: Partial<NewsletterFormLabels>
  onSubmit?: React.FormEventHandler<HTMLFormElement>
}

/**
 * The drawn half of the newsletter sign-up: one email field and one action,
 * and the two alerts that can follow them. It validates and sends nothing —
 * the app's `NewsletterForm` owns the schema and the submission, and hands
 * this view the resulting `status`, messages and input bindings.
 */
function NewsletterFormView({
  status = "idle",
  error,
  fieldError,
  inputProps,
  labels,
  onSubmit,
}: NewsletterFormViewProps) {
  const text = { ...DEFAULT_LABELS, ...labels }
  const messageId = React.useId()
  const isSubmitting = status === "submitting"
  const isSubmitted = status === "submitted"

  return (
    <>
      {/* Field and action share one row and one 46px height, as the design
          pairs them; they only stack where the panel itself has stopped being
          two columns. Both are pills — a squared field beside a pill button
          was the one place in the storefront where the two disagreed. */}
      <form
        data-slot="newsletter-form"
        onSubmit={onSubmit}
        className="flex flex-col gap-2.5 min-[26rem]:flex-row"
        aria-busy={isSubmitting}
      >
        <div className="grid flex-1 gap-2">
          <Input
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            inputMode="email"
            spellCheck={false}
            aria-required="true"
            placeholder={text.placeholder}
            aria-label={text.placeholder}
            aria-invalid={fieldError ? true : undefined}
            aria-describedby={fieldError ? messageId : undefined}
            className="h-[2.875rem] border-border bg-background px-5 text-foreground placeholder:text-muted-foreground focus:bg-background"
            suppressHydrationWarning
            {...inputProps}
          />
          {fieldError ? (
            <p id={messageId} role="alert" className="text-destructive text-sm">
              {fieldError}
            </p>
          ) : null}
        </div>
        <Button
          type="submit"
          disabled={isSubmitting || isSubmitted}
          size="lg"
          className="h-[2.875rem] gap-2 whitespace-nowrap px-[1.375rem]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {text.subscribing}
            </>
          ) : isSubmitted ? (
            <>
              <CheckCircle2 className="h-4 w-4" />
              {text.subscribed}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              {text.subscribe}
            </>
          )}
        </Button>
      </form>

      {error ? (
        <Alert variant="destructive" role="alert" className="mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {isSubmitted ? (
        <Alert
          role="status"
          aria-live="polite"
          className="mt-4 border-border bg-background text-foreground"
        >
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>{text.success}</AlertDescription>
        </Alert>
      ) : null}
    </>
  )
}

export { NewsletterFormView, type NewsletterStatus }
