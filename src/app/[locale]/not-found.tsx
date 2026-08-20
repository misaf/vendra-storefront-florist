"use client";

import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { isRtlLocale } from "@/shared/lib/locale";

export default function NotFound() {
  const { t, locale } = useTranslations();
  const HomeArrow = isRtlLocale(locale) ? ArrowRight : ArrowLeft;

  return (
    <PageShell>
      <section className="bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
        <div className="store-container max-w-2xl text-center">
          <p className="store-eyebrow justify-center">
            {t("errors.notFoundEyebrow")}
          </p>
          <h1 className="store-page-title mt-4 text-foreground">
            {t("errors.notFoundTitle")}
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            {t("errors.notFoundDescription")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild className="gap-2">
              <Link href="/">
                <HomeArrow className="h-4 w-4" />
                {t("errors.backHome")}
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/products">
                {t("common.viewAllProducts") || "View all products"}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
