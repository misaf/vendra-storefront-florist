"use client";

import dynamic from "next/dynamic";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NewsletterForm = dynamic(() => import("./newsletter-form"), {
  // Client-only on purpose: this keeps zod, react-hook-form and the resolver
  // out of every page's critical path for a below-the-fold field. The skeleton
  // reserves the control's height so the swap-in shifts nothing.
  ssr: false,
  loading: () => <Skeleton className="h-11 w-full rounded-full" />,
});

interface NewsletterProps {
  className?: string;
}

export function Newsletter({ className = "" }: NewsletterProps) {
  const { t } = useTranslations();

  /* The sign-up panel: a tinted plate on the page's own ground, words on one
     side and the field on the other. It replaces a half-page composition that
     gave a single email field a 30rem photograph of the studio — the same
     photograph the home page already opens on, scrimmed, for a control that
     needs no illustration at all. The clay tint is the system's louder
     invitation surface, the pair to the sage one the FAQ closes on. */
  return (
    <section className={`bg-background ${className}`}>
      <div className="store-container store-section">
        <div className="organic-panel bg-clay-100 text-clay-900">
          <div>
            <h2 className="font-display text-[clamp(1.5rem,2.4vw,2.125rem)] leading-tight text-clay-900 [.locale-fa_&]:leading-normal">
              {t("newsletter.title")}
            </h2>
            <p className="store-lede mt-2.5 max-w-[40ch] text-[0.9375rem] text-clay-800">
              {t("newsletter.description")}
            </p>
          </div>

          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}
