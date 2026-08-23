import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/shared/i18n/navigation";
import { PageShell } from "@/shared/components/layout/page-shell";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { isRtlLocale } from "@/shared/lib/locale";

export default async function NotFound() {
  const locale = await getLocale();
  const t = await getTranslations();
  const HomeArrow = isRtlLocale(locale) ? ArrowRight : ArrowLeft;

  return (
    <PageShell>
      <section className="store-section-lg bg-background">
        <div className="store-container grid overflow-hidden border-y border-border bg-secondary/35 md:grid-cols-[0.75fr_1.25fr]">
          <div className="flex min-h-56 items-center justify-center border-b border-border p-8 md:min-h-[28rem] md:border-b-0 md:border-e">
            <p className="font-display text-[clamp(7rem,18vw,14rem)] leading-none text-rose/22" aria-hidden="true">
              404
            </p>
          </div>
          <div className="flex items-center p-7 sm:p-12 lg:p-16">
            <div className="max-w-xl">
              <p className="store-eyebrow">{t("errors.notFoundEyebrow")}</p>
              <h1 className="store-page-title mt-4 text-foreground">
                {t("errors.notFoundTitle")}
              </h1>
              <p className="store-lede mt-4 leading-7 text-muted-foreground">
                {t("errors.notFoundDescription")}
              </p>
              <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
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
          </div>
        </div>
      </section>
    </PageShell>
  );
}
