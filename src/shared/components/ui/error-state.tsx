import type { ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";

interface ErrorStateProps {
  /** What went wrong, in the customer's words. */
  message: string;
  /** Retry handler. Omit when the only way forward is `action`. */
  onRetry?: () => void;
  retryLabel?: string;
  /** Shown in place of `retryLabel` while a retry is in flight. */
  retryingLabel?: string;
  isRetrying?: boolean;
  /** An alternative route out — "back to products", say. */
  action?: ReactNode;
  className?: string;
}

/**
 * A failed load, and the way out of it.
 *
 * The four places that had one all rendered a different control for the same
 * job: an outline `Button` on the catalogue, a bare underlined `<button>` on the
 * journal, and a third spelling on the FAQ — which was also the only one that
 * showed a pending state, so on the other three a slow retry looked like a dead
 * click.
 *
 * `aria-disabled` rather than `disabled` while retrying: disabling the focused
 * element blurs it, which drops a keyboard user back at the top of the page.
 */
export function ErrorState({
  message,
  onRetry,
  retryLabel,
  retryingLabel,
  isRetrying = false,
  action,
  className,
}: ErrorStateProps) {
  return (
    <Alert variant="destructive" role="alert" className={cn(className)}>
      <AlertDescription>
        <p>{message}</p>
        {onRetry || action ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            {onRetry ? (
              <Button
                type="button"
                variant="outline"
                aria-disabled={isRetrying}
                aria-busy={isRetrying}
                className={cn(isRetrying && "opacity-70")}
                onClick={() => {
                  if (isRetrying) return;
                  onRetry();
                }}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    {retryingLabel ?? retryLabel}
                  </>
                ) : (
                  retryLabel
                )}
              </Button>
            ) : null}
            {action}
          </div>
        ) : null}
      </AlertDescription>
    </Alert>
  );
}
