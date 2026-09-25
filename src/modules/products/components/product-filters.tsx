"use client";

import { useEffect, useId, useMemo, useState } from "react";
import { Check, ChevronDown, Heart, Loader2, Search, X } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { PriceRangeFilter } from "./price-range-filter";
import type { ProductAvailability } from "../lib/filter-state";
import type { ProductCategory, ProductPriceRange } from "../types";

type Translate = (key: string, values?: Record<string, string | number>) => string;

const CATEGORY_PAGE_SIZE = 10;

/**
 * A rail heading. The design system sets these as small tracked capitals in the
 * *body* face at the muted step — deliberately quieter than the section titles
 * on the page, because a filter group's name is a label for the controls under
 * it, not a heading in the page's outline.
 */
const legendClass =
  "flex w-full items-center justify-between gap-3 text-[0.8125rem] font-semibold uppercase tracking-[0.09em] text-foreground/55 [.locale-fa_&]:tracking-normal [.locale-fa_&]:normal-case";

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
    "flex min-h-11 cursor-pointer items-center rounded-full px-4 py-2.5 text-[0.90625rem] leading-6 transition-colors",
    "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-ring",
    /* Selected is the accent's own tint under its deep step, not a filled
       accent pill: a rail of fourteen collections with one solid clay bar in
       it read as a button among labels. */
    checked
      ? "bg-clay-100 font-semibold text-clay-800"
      : "text-foreground hover:bg-accent hover:text-accent-foreground"
  );
}

interface ProductFiltersProps {
  /** The catalogue search in force, so the rail's field opens on it. */
  search: string;
  onSearchChange: (search: string) => void;
  categories: ProductCategory[];
  category: string;
  availability: ProductAvailability | undefined;
  categoriesLoading: boolean;
  locale: string;
  onCategoryChange: (category: string) => void;
  onAvailabilityChange: (availability: ProductAvailability | undefined) => void;
  /** The catalogue's price extent, or null when it has no band worth drawing. */
  priceRange: ProductPriceRange | null;
  minPrice: number | undefined;
  maxPrice: number | undefined;
  onPriceChange: (next: { minPrice?: number; maxPrice?: number }) => void;
  favoritesOnly: boolean;
  onFavoritesOnlyChange: (favoritesOnly: boolean) => void;
  /** How many products the shopper has saved, for the toggle's own count. */
  favoritesCount: number;
  t: Translate;
  className?: string;
}

export function ProductFilters({
  search,
  onSearchChange,
  categories,
  category,
  availability,
  categoriesLoading,
  locale,
  onCategoryChange,
  onAvailabilityChange,
  priceRange,
  minPrice,
  maxPrice,
  onPriceChange,
  favoritesOnly,
  onFavoritesOnlyChange,
  favoritesCount,
  t,
  className,
}: ProductFiltersProps) {
  const categoryGroupName = useId();
  const availabilityGroupName = useId();
  const [categorySearch, setCategorySearch] = useState("");
  /* The rail's search is a draft until it is submitted. Committing on every
     keystroke would push a new address — and a new catalogue request — per
     letter typed, against an API serving 560 products. Enter, the magnifier,
     or leaving the field commits it; the ✕ clears it in one move. */
  const [searchDraft, setSearchDraft] = useState(search);
  useEffect(() => setSearchDraft(search), [search]);
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

  const commitSearch = () => {
    const next = searchDraft.trim();
    if (next !== search) onSearchChange(next);
  };

  return (
    <div className={cn("flex flex-col gap-[2.125rem]", className)}>
      {/* The rail opens on the search, as the design lays it out: one pill with
          the magnifier inside its leading edge. It used to live only in the
          header's command palette, so the catalogue — the one page where a
          shopper is already narrowing — had no field of its own. */}
      <form
        role="search"
        onSubmit={(event) => {
          event.preventDefault();
          commitSearch();
        }}
        className="relative"
      >
        <Search
          className="pointer-events-none absolute start-[0.9375rem] top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={searchDraft}
          onChange={(event) => setSearchDraft(event.target.value)}
          onBlur={commitSearch}
          aria-label={t("products.searchPlaceholder")}
          placeholder={t("products.searchPlaceholder")}
          className="h-[2.625rem] bg-background ps-10 text-sm"
        />
        {search ? (
          <button
            type="button"
            onClick={() => {
              setSearchDraft("");
              onSearchChange("");
            }}
            aria-label={t("search.clearSearch")}
            className="absolute end-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        ) : null}
      </form>

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

        {/* Only a genuinely long list gets a field of its own. The rail already
            opens on a product search, and a second search box directly under
            the first read as one control repeated — so this one waits until
            the collection list is long enough that paging through it is the
            slower way to reach a name. */}
        {categories.length > 16 ? (
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

        <div className="mt-3.5 space-y-0.5">
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

      {/* Only a catalogue with something to slide between gets a slider: a shop
          whose products are all one price, or one that priced nothing at all,
          returns no range and the group does not appear. */}
      {priceRange ? (
        <PriceRangeFilter
          range={priceRange}
          minPrice={minPrice}
          maxPrice={maxPrice}
          onCommit={onPriceChange}
          t={t}
          legendClassName={legendClass}
        />
      ) : null}

      <fieldset>
        <legend className={legendClass}>
          {t("products.availabilityFilter")}
        </legend>
        <div className="mt-3.5 space-y-0.5">
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

      {/* Saved products, as a switch rather than a fourth radio group: it
          narrows whatever the groups above have already chosen instead of
          replacing it, which is why it sits outside them with no legend. */}
      <label className={cn(optionClass(favoritesOnly), "justify-between gap-3")}>
        <input
          type="checkbox"
          checked={favoritesOnly}
          onChange={(event) => onFavoritesOnlyChange(event.target.checked)}
          className="sr-only"
        />
        <span className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className={cn(
              "flex size-4 shrink-0 items-center justify-center rounded-[0.3125rem] border-[1.5px] transition-colors",
              favoritesOnly
                ? "border-primary-foreground bg-primary-foreground text-primary"
                : "border-border"
            )}
          >
            {favoritesOnly ? <Check className="size-3" strokeWidth={3.2} /> : null}
          </span>
          <Heart
            className={cn("size-4 shrink-0", favoritesOnly ? "" : "text-rose")}
            fill="currentColor"
            aria-hidden="true"
          />
          <span className="min-w-0 break-words">{t("products.favoritesOnly")}</span>
        </span>
        {favoritesCount > 0 ? (
          <span
            className={cn(
              "shrink-0 text-xs tabular-nums",
              favoritesOnly ? "text-primary-foreground/75" : "text-muted-foreground"
            )}
          >
            {new Intl.NumberFormat(locale).format(favoritesCount)}
          </span>
        ) : null}
      </label>
    </div>
  );
}
