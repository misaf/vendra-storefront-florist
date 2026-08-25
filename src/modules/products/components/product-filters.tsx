"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { ChevronDown, Loader2, Search } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import type { ProductAvailability } from "../lib/filter-state";
import type { ProductCategory } from "../types";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const CATEGORY_PAGE_SIZE = 10;

/**
 * A rail heading. The design system sets these as small tracked capitals in the
 * *body* face at the muted step — deliberately quieter than the section titles
 * on the page, because a filter group's name is a label for the controls under
 * it, not a heading in the page's outline.
 */
const legendClass =
  "flex w-full items-center justify-between gap-3 text-xs font-bold uppercase tracking-[0.09em] text-muted-foreground [.locale-fa_&]:tracking-normal";

/**
 * One option in a rail group, drawn as the system's pill.
 *
 * The radio itself is visually hidden rather than removed: the design draws
 * selection as a filled pill and nothing else, but a group of eleven
 * collections still has to arrow-key and announce as one radio group. So the
 * native input stays, the fill carries the state visually, and `focus-within`
 * puts the page's own ring on the pill the hidden input is inside.
 */
function optionClass(checked: boolean) {
  return cn(
    "flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2 text-sm leading-6 transition-colors",
    "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
    checked
      ? "bg-primary font-semibold text-primary-foreground"
      : "text-foreground/80 hover:bg-accent hover:text-accent-foreground"
  );
}

interface ProductFiltersProps {
  categories: ProductCategory[];
  category: string;
  availability: ProductAvailability | undefined;
  categoriesLoading: boolean;
  locale: string;
  onCategoryChange: (category: string) => void;
  onAvailabilityChange: (availability: ProductAvailability | undefined) => void;
  t: Translate;
  className?: string;
}

export function ProductFilters({
  categories,
  category,
  availability,
  categoriesLoading,
  locale,
  onCategoryChange,
  onAvailabilityChange,
  t,
  className,
}: ProductFiltersProps) {
  const categoryGroupName = useId();
  const availabilityGroupName = useId();
  const [categorySearch, setCategorySearch] = useState("");
  const [visibleCategoryCount, setVisibleCategoryCount] =
    useState(CATEGORY_PAGE_SIZE);

  const categoryOptions = useMemo(
    () => [
      { value: "all", label: t("products.categoryAll") },
      ...categories.map((item) => ({ value: item.slug, label: item.name })),
    ],
    [categories, t]
  );
  const filteredCategories = useMemo(() => {
    const query = categorySearch.trim().toLocaleLowerCase(locale);
    if (!query) return categoryOptions;

    return categoryOptions.filter((option) =>
      option.label.toLocaleLowerCase(locale).includes(query)
    );
  }, [categoryOptions, categorySearch, locale]);

  useEffect(() => {
    setVisibleCategoryCount(CATEGORY_PAGE_SIZE);
  }, [categorySearch]);

  const activeCategoryIndex = filteredCategories.findIndex(
    (option) => option.value === category
  );
  const effectiveVisibleCount = Math.max(
    visibleCategoryCount,
    activeCategoryIndex + 1
  );
  const visibleCategories = filteredCategories.slice(0, effectiveVisibleCount);
  const hasMoreCategories = effectiveVisibleCount < filteredCategories.length;

  const availabilityOptions: Array<{
    value: ProductAvailability | undefined;
    label: string;
  }> = [
    { value: undefined, label: t("products.availabilityAll") },
    { value: "in-stock", label: t("common.inStock") },
    { value: "out-of-stock", label: t("products.outOfStock") },
  ];

  return (
    <div className={cn("flex flex-col gap-8", className)}>
      <fieldset>
        <legend className={legendClass}>
          <span>{t("products.categoryFilter")}</span>
          {categoriesLoading ? (
            <Loader2
              className="size-4 animate-spin text-muted-foreground"
              aria-label={t("common.loading")}
            />
          ) : null}
        </legend>

        {categories.length > 8 ? (
          <div className="relative mt-3">
            <Search
              className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={categorySearch}
              onChange={(event) => setCategorySearch(event.target.value)}
              aria-label={t("products.categorySearch")}
              placeholder={t("products.categorySearch")}
              className="h-11 bg-background px-9 text-sm"
            />
          </div>
        ) : null}

        <div className="mt-3 space-y-0.5">
          {visibleCategories.length > 0 ? (
            visibleCategories.map((option) => {
              const checked = category === option.value;

              return (
                <label key={option.value} className={optionClass(checked)}>
                  <input
                    type="radio"
                    name={categoryGroupName}
                    value={option.value}
                    checked={checked}
                    onChange={() => onCategoryChange(option.value)}
                    className="sr-only"
                  />
                  <span className="min-w-0 break-words">{option.label}</span>
                </label>
              );
            })
          ) : (
            <p className="px-2.5 py-3 text-sm text-muted-foreground">
              {t("products.noCategoryResults")}
            </p>
          )}
        </div>

        {hasMoreCategories ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-2 w-full justify-center gap-2 text-xs font-semibold text-primary"
            onClick={() =>
              setVisibleCategoryCount((count) => count + CATEGORY_PAGE_SIZE)
            }
          >
            {t("products.loadMoreCategories")}
            <ChevronDown className="size-4" aria-hidden="true" />
          </Button>
        ) : null}
      </fieldset>

      <fieldset>
        <legend className={legendClass}>
          {t("products.availabilityFilter")}
        </legend>
        <div className="mt-3 space-y-0.5">
          {availabilityOptions.map((option) => {
            const value = option.value ?? "all";
            const checked = availability === option.value;

            return (
              <label key={value} className={optionClass(checked)}>
                <input
                  type="radio"
                  name={availabilityGroupName}
                  value={value}
                  checked={checked}
                  onChange={() => onAvailabilityChange(option.value)}
                  className="sr-only"
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
