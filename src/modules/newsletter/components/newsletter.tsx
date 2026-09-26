"use client";

import { useId } from "react";
import dynamic from "next/dynamic";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NewsletterForm = dynamic(() => import("./newsletter-form"), {
  // Client-only on purpose: this keeps zod, react-hook-form and the resolver
  // out of every page's critical path for a below-the-fold field. The skeleton
  // reserves the control's and the note's height so the swap-in shifts nothing.
  ssr: false,
  loading: () => (
    <div className="grid gap-3">
      <Skeleton className="h-[2.875rem] w-full rounded-full" />
      <Skeleton className="h-3.5 w-48 rounded-full" />
    </div>
  ),
});

interface NewsletterProps {
  className?: string;
}

export function Newsletter({ className = "" }: NewsletterProps) {
  const { t } = useTranslations();
  const titleId = useId();

  /* The design system's NewsletterSection: a clay-100 promo panel with the
     section head on one side and the form on the other, the pair to the sage
     panel the FAQ closes on. Text stays on `foreground` rather than a clay
     ink, because clay-100 inverts to deep clay in the dark theme and a fixed
     clay-900 would sink into it. */
  return (
    <section aria-labelledby={titleId} className={`bg-background ${className}`}>
      <div className="store-container store-section">
        <div className="organic-panel organic-wash-band relative overflow-hidden bg-clay-100 text-foreground">
          {/* Decorative petal in the top-end corner; nothing is set inside it. */}
          <span
            aria-hidden="true"
            className="organic-mark-petal pointer-events-none absolute end-[clamp(1.25rem,4vw,2.5rem)] top-[clamp(1.25rem,3vw,2rem)] size-[34px] opacity-90"
          />

          <div className="grid max-w-[34rem] gap-3.5">
            <span className="store-eyebrow">{t("newsletter.eyebrow")}</span>
            <h2 id={titleId} className="store-section-title">
              {t("newsletter.title")}
            </h2>
            <p className="store-lede max-w-[46ch] text-[1.0625rem] opacity-80">
              {t("newsletter.lede")}
            </p>
          </div>

          <div className="grid min-w-0 gap-3">
            <NewsletterForm note={t("newsletter.note")} />
          </div>
        </div>
      </div>
    </section>
  );
}
