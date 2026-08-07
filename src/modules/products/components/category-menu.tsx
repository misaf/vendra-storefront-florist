"use client";

import { useMemo } from "react";
import { Link, usePathname } from "@/shared/i18n/navigation";
import { CategoryMediaImage } from "./category-media-image";
import { useTranslations } from "@/shared/hooks/use-translations";
import { isRtlLocale } from "@/shared/lib/locale";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { 
  ChevronDown, 
  Sparkles,
  Leaf,
  Grid3x3,
  Check,
  ArrowLeft,
  ArrowRight,
  Loader2,
  ShoppingBag,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/shared/lib/utils";
import { useProductCategories } from "@/modules/products";
import { useBrandIcon } from "@/shared/property/use-brand-icon";

interface CategoryDisplayItem {
  value: string;
  name: string;
  icon: typeof Grid3x3;
  description?: string;
  featured: boolean;
  image?: string;
}

export function CategoryMenu() {
  const { t, locale } = useTranslations();
  const BrandIcon = useBrandIcon();
  // Built here, not at module scope: the brand mark comes from the runtime property.
  const categoryIcons = useMemo(() => [BrandIcon, Sparkles, Leaf], [BrandIcon]);
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const currentCategory = searchParams?.get("category") || "all";
  const isProductsPage = pathname?.includes("/products");
  const { data: apiCategories = [], isLoading } = useProductCategories();
  const isRTL = isRtlLocale(locale);
  const ArrowIcon = isRTL ? ArrowLeft : ArrowRight;

  const categories = useMemo<CategoryDisplayItem[]>(() => {
    return apiCategories.map((cat, index) => ({
      value: cat.slug,
      name: cat.name,
      icon: categoryIcons[index % categoryIcons.length],
      description: cat.description || undefined,
      featured: index < 3,
      image: cat.image,
    }));
  }, [apiCategories]);

  const getCategoryUrl = (category: string) => {
    if (category === "all") {
      return "/products" as const;
    }
    return { pathname: "/products", query: { category } } as const;
  };

  const featuredCategories = useMemo(
    () => categories.filter((category) => category.featured),
    [categories]
  );
  const regularCategories = useMemo(
    () => categories.filter((category) => !category.featured),
    [categories]
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            "flex h-10 items-center gap-2 rounded-full px-3.5 text-sm font-semibold transition-all hover:bg-muted hover:text-primary dark:hover:bg-white/10 dark:hover:text-white",
            isProductsPage
              ? "bg-primary text-primary-foreground shadow-sm shadow-storefront-brand/10"
              : "text-primary/80 dark:text-foreground"
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>{t("common.products")}</span>
          <ChevronDown className="h-3.5 w-3.5 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className={cn(
          "w-[92vw] max-w-[820px] border-border/70 bg-[linear-gradient(145deg,color-mix(in_oklch,var(--card)_94%,transparent),color-mix(in_oklch,var(--storefront-brand-soft)_92%,transparent)_54%,color-mix(in_oklch,var(--background)_90%,transparent))] p-4 text-foreground shadow-2xl shadow-storefront-brand/[0.12] backdrop-blur-xl dark:border-white/12 dark:text-white dark:shadow-black/25 sm:w-[760px]",
          locale === "fa" ? "locale-fa" : "locale-en"
        )}
        sideOffset={8}
      >
        <DropdownMenuLabel className="mb-3 px-2 py-1.5 text-xs font-semibold uppercase text-muted-foreground">
          {t("common.browseByCategory")}
        </DropdownMenuLabel>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">
              {t("common.noCategories")}
            </p>
          </div>
        ) : (
          <>
            {featuredCategories.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                {featuredCategories.map((category) => {
                    const Icon = category.icon;
                    const isActive = currentCategory === category.value;
              
              return (
                <DropdownMenuItem 
                  key={category.value} 
                  asChild
                  className="p-0"
                >
                  <Link
                    href={getCategoryUrl(category.value)}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card/70 transition-all hover:-translate-y-0.5 hover:border-primary/20 hover:bg-muted hover:shadow-xl hover:shadow-storefront-brand/[0.08] dark:bg-white/8 dark:hover:bg-white/12 dark:hover:shadow-black/20",
                      isActive && "border-primary/30 bg-muted shadow-xl shadow-storefront-brand/[0.08] dark:bg-white/14 dark:shadow-black/20"
                    )}
                  >
                    <CategoryMediaImage
                      src={category.image}
                      alt={category.name}
                      className="h-32 w-full bg-storefront-brand-soft dark:bg-white/10"
                      imageClassName="opacity-75 transition-transform duration-300 group-hover:scale-105 group-hover:opacity-90"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                      <div className="absolute end-3 top-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full backdrop-blur-sm transition-colors",
                          isActive 
                            ? "bg-secondary text-secondary-foreground"
                            : "bg-card/85 text-primary"
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                      </div>
                      {isActive && (
                        <div className="absolute start-3 top-3">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary">
                            <Check className="h-4 w-4 text-secondary-foreground" />
                          </div>
                        </div>
                      )}
                    </CategoryMediaImage>
                    <div className="bg-card/60 p-4 dark:bg-white/8">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-primary dark:text-white">
                            {category.name}
                          </h3>
                          {category.description && (
                            <p className="mt-0.5 line-clamp-2 text-xs leading-5 text-muted-foreground">
                              {category.description}
                            </p>
                          )}
                        </div>
                        <ArrowIcon className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-foreground" />
                      </div>
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
                  })}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {regularCategories.map((category) => {
                  const Icon = category.icon;
                  const isActive = currentCategory === category.value;
              
              return (
                <DropdownMenuItem 
                  key={category.value} 
                  asChild
                  className="p-0"
                >
                  <Link
                    href={getCategoryUrl(category.value)}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg border border-border bg-card/65 px-4 py-3 text-sm transition-all hover:border-primary/20 hover:bg-muted hover:shadow-sm dark:bg-white/8 dark:hover:bg-white/12",
                      isActive && "border-primary/30 bg-muted dark:bg-white/14"
                    )}
                  >
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                      isActive
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-primary/7 text-primary dark:bg-white/10"
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-primary dark:text-white">
                          {category.name}
                        </span>
                        {isActive && (
                          <Check className="h-4 w-4 shrink-0 text-foreground" />
                        )}
                      </div>
                      {category.description && (
                        <span className="line-clamp-1 text-xs text-muted-foreground">
                          {category.description}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              );
            })}
            </div>
            <DropdownMenuSeparator className="my-3 bg-border" />
            <DropdownMenuItem asChild className="p-0">
              <Link 
                href="/products" 
                className="flex w-full items-center justify-center rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                {t("common.viewAllProducts")}
              </Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
