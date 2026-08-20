"use client";

import { useLocale } from "next-intl";
import { useSearchParams } from "next/navigation";
import { getPathname, usePathname } from "@/shared/i18n/navigation";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Check, Globe } from "lucide-react";
import { routing, type Locale } from "@/shared/i18n/routing";
import { useTranslations } from "@/shared/hooks/use-translations";
import { fetchProductCategories } from "@/modules/products";

const localeNames: Record<Locale, string> = {
  fa: "فارسی",
  en: "English",
};

/* Shown next to the globe so the active language is readable at a glance —
   a globe alone says "language exists", not "you are reading Persian". */
const localeShortNames: Record<Locale, string> = {
  fa: "FA",
  en: "EN",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentLocale = useLocale() as Locale;
  const { t } = useTranslations();

  const switchLocale = async (locale: Locale) => {
    const query = Object.fromEntries(searchParams.entries());

    // Category slugs are localized. Carry the category identity across the
    // language change instead of reusing a slug that may be invalid in the
    // destination locale and producing an empty catalogue.
    if (pathname === "/products" && query.category) {
      try {
        const [currentCategories, targetCategories] = await Promise.all([
          fetchProductCategories(currentLocale),
          fetchProductCategories(locale),
        ]);
        const currentCategory = currentCategories.find(
          (category) => category.slug === query.category
        );
        const targetCategory = currentCategory
          ? targetCategories.find((category) => category.id === currentCategory.id)
          : undefined;

        if (targetCategory) query.category = targetCategory.slug;
        else delete query.category;
      } catch {
        // A valid all-products view is preferable to carrying a stale slug.
        delete query.category;
      }
    }

    const href = Object.keys(query).length ? { pathname, query } : pathname;

    // Locale changes also replace the document's lang/dir attributes and its
    // server-rendered JSON-LD. A document navigation keeps all three in sync;
    // an in-place layout transition can retain structured data from the prior
    // locale even after the visible content has changed.
    window.location.assign(getPathname({ locale, href }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="min-h-11 gap-1.5 rounded-full px-3 text-xs font-semibold"
          aria-label={`${t("common.changeLanguage")} — ${localeNames[currentLocale]}`}
        >
          <Globe className="size-5" aria-hidden="true" />
          <span aria-hidden="true">{localeShortNames[currentLocale]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {routing.locales.map((locale) => {
          const isActive = currentLocale === locale;
          return (
            <DropdownMenuItem
              key={locale}
              onClick={() => void switchLocale(locale)}
              aria-current={isActive ? "true" : undefined}
              lang={locale}
              className={isActive ? "bg-accent font-medium" : ""}
            >
              <Check
                className={`h-4 w-4 ${isActive ? "opacity-100" : "opacity-0"}`}
              />
              {localeNames[locale]}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
