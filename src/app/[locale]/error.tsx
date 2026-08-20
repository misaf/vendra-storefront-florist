"use client";

import { useEffect } from "react";
import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { useTranslations } from "@/shared/hooks/use-translations";
import { RotateCcw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useTranslations();

  useEffect(() => {
    // Surface the error for diagnostics; users only see the friendly screen.
    console.error(error);
  }, [error]);

  return (
    <PageShell>
      <section className="bg-background pb-20 pt-10 sm:pb-28 sm:pt-14">
        <div className="store-container max-w-2xl text-center">
          <p className="store-eyebrow justify-center">
            {t("errors.errorEyebrow")}
          </p>
          <h1 className="store-page-title mt-4 text-foreground">
            {t("errors.errorTitle")}
          </h1>
          <p className="mt-4 leading-7 text-muted-foreground">
            {t("errors.errorDescription")}
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button onClick={() => reset()} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              {t("errors.tryAgain")}
            </Button>
            <Button asChild variant="outline">
              <Link href="/">{t("errors.backHome")}</Link>
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
