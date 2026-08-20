"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useProperty } from "@/shared/property/property-provider";
import { useTranslations } from "@/shared/hooks/use-translations";
import { Mail } from "lucide-react";
import { Skeleton } from "@/shared/components/ui/skeleton";

const NewsletterForm = dynamic(() => import("./newsletter-form"), {
  // Client-only on purpose: this keeps zod, react-hook-form and the resolver
  // out of every page's critical path for a below-the-fold field. The skeleton
  // reserves the control's height so the swap-in shifts nothing.
  ssr: false,
  loading: () => <Skeleton className="h-11 w-full rounded-full" />,
});

interface NewsletterProps {
  variant?: "default" | "compact";
  className?: string;
}

export function Newsletter({ variant = "default", className = "" }: NewsletterProps) {
  const { t } = useTranslations();
  const property = useProperty();

  if (variant === "compact") {
    return (
      <div className={className}>
        <NewsletterForm compact />
      </div>
    );
  }

  return (
    <section className={`store-section bg-background ${className}`}>
      <div className="store-container">
        <div className="grid overflow-hidden rounded-3xl bg-secondary dark:bg-storefront-surface lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative min-h-72 overflow-hidden bg-primary lg:min-h-[30rem]">
            <Image
              src={property.aboutImage ?? "/hero-florist-studio.webp"}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-storefront-brand/70 via-transparent to-transparent" />
          </div>

          <div className="flex flex-col justify-center p-6 sm:p-10 lg:p-14">
            <div className="max-w-2xl">
              <span className="inline-flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Mail className="h-5 w-5" />
              </span>
              <h2 className="store-section-title mt-6 text-foreground">
                {t("newsletter.title")}
              </h2>
              <p className="store-lede mt-4 text-base text-muted-foreground">
                {t("newsletter.description")}
              </p>
            </div>

            <div className="mt-8">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

