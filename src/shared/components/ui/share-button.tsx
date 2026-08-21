"use client";

import { useCallback, useState } from "react";
import { Check, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { cn } from "@/shared/lib/utils";

interface ShareButtonProps {
  /** Passed to the native share sheet as the shared item's title. */
  title?: string;
  /** Visible label. Defaults to `common.share`. */
  label?: string;
  className?: string;
}

/**
 * One share control: the OS share sheet where the browser offers it, a copied
 * link everywhere else. Deliberately not a row of network buttons — those ship
 * third-party script, date badly, and on an article they compete with the copy.
 *
 * The URL is read at click time from `window.location`, so the component needs
 * no props to stay correct across client navigations.
 */
export function ShareButton({ title, label, className }: ShareButtonProps) {
  const { t } = useTranslations();
  const [justCopied, setJustCopied] = useState(false);

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success(t("common.linkCopied"));
        setJustCopied(true);
        window.setTimeout(() => setJustCopied(false), 2000);
        return;
      }

      toast.error(t("common.shareFailed"));
    } catch {
      /* the native sheet was dismissed — nothing went wrong */
    }
  }, [t, title]);

  const Icon = justCopied ? Check : Share2;

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={() => void handleShare()}
      className={cn("gap-2", className)}
    >
      <Icon className="size-4" aria-hidden="true" />
      {label || t("common.share")}
      {/* The icon swap is the only signal a sighted user gets; announce the
          same thing rather than leaving the button silently unchanged. */}
      <span role="status" aria-live="polite" className="sr-only">
        {justCopied ? t("common.linkCopied") : ""}
      </span>
    </Button>
  );
}
