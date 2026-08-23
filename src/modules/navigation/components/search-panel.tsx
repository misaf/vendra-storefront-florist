"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/shared/i18n/navigation";
import { useTranslations } from "@/shared/hooks/use-translations";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/shared/components/ui/command";
import { Price, fetchProductsWithDetails } from "@/modules/products";
import type { Product } from "@/modules/products";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { Loader2 } from "lucide-react";
import { SafeImage } from "@/shared/components/ui/safe-image";
import { DynamicText } from "@/shared/components/dynamic-text";

/**
 * The search palette itself. Split out of the header trigger so cmdk and this
 * result-rendering code are fetched the first time someone actually opens
 * search, rather than on every page load for every visitor.
 */
export default function SearchPanel({
  open,
  onOpenChange,
  onCloseAutoFocus,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCloseAutoFocus?: (event: Event) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchFailed, setSearchFailed] = useState(false);
  const { t, locale } = useTranslations();
  const router = useRouter();
  const trimmedQuery = searchQuery.trim();

  // Debounced search
  useEffect(() => {
    if (!open || trimmedQuery.length < 2) {
      setResults([]);
      setSearchFailed(false);
      setLoading(false);
      return;
    }

    let cancelled = false;
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      setSearchFailed(false);
      try {
        const result = await fetchProductsWithDetails({
          page: 1,
          perPage: 8,
          locale,
          search: trimmedQuery,
        });
        if (!cancelled) setResults(result.products);
      } catch (error) {
        if (cancelled) return;
        console.error("Search error:", error);
        setResults([]);
        setSearchFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
    };
  }, [locale, trimmedQuery, open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
      setSearchFailed(false);
    }
  }, [open]);

  const handleSelect = useCallback(
    (product: Product) => {
      onOpenChange(false);
      // Open the selected product directly rather than running a search.
      router.push(
        `/products/${createReadableResourcePath(product.id, product.slug)}`
      );
    },
    [onOpenChange, router]
  );

  const handleSearchAll = useCallback(() => {
    if (trimmedQuery) {
      onOpenChange(false);
      router.push({
        pathname: "/products",
        query: { search: trimmedQuery },
      });
    }
  }, [trimmedQuery, router, onOpenChange]);

  return (
  <CommandDialog
    open={open}
    onOpenChange={onOpenChange}
    onCloseAutoFocus={onCloseAutoFocus}
    // Results are filtered server-side; don't let cmdk re-filter and hide
    // valid matches (or the "View all results" action).
    shouldFilter={false}
    title={t("search.title") || "Search Products"}
    description={t("search.description") || "Search for products by name or description"}
    closeLabel={t("common.close")}
    className="border-border/80 bg-card shadow-panel sm:max-w-2xl"
  >
    <CommandInput
      placeholder={t("search.placeholder") || "Search products..."}
      aria-label={t("search.placeholder") || "Search products..."}
      value={searchQuery}
      onValueChange={setSearchQuery}
    />
    <CommandList>
      {loading && (
        <div className="flex items-center justify-center py-6" role="status" aria-live="polite">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          <span className="ms-2 text-sm text-muted-foreground">
            {t("search.searching") || "Searching..."}
          </span>
        </div>
      )}
      {!loading && trimmedQuery.length < 2 && (
        <CommandEmpty>
          {t("search.typeToSearch") || "Type at least 2 characters to search"}
        </CommandEmpty>
      )}
      {!loading && searchFailed && (
        <div className="px-6 py-8 text-center text-sm text-destructive" role="alert">
          {t("search.error")}
        </div>
      )}
      {!loading && !searchFailed && trimmedQuery.length >= 2 && results.length === 0 && (
        <CommandEmpty>
          {t("search.noResults") || "No products found"}
        </CommandEmpty>
      )}
      {!loading && results.length > 0 && (
        <>
          <CommandGroup heading={t("search.results") || "Products"}>
            {results.map((product) => (
              <CommandItem
                key={product.id}
                value={`${product.name} ${product.token ?? ""}`}
                onSelect={() => handleSelect(product)}
                className="group flex items-center gap-4 border-b border-border/60 px-3 py-3"
              >
                <div className="relative size-16 flex-shrink-0 overflow-hidden rounded-b-lg rounded-t-[2rem] bg-secondary">
                  <SafeImage
                    src={product.thumbnail || product.image}
                    /* The visible product name is in this same option. */
                    alt=""
                    width={64}
                    height={64}
                    className="h-full w-full object-contain transition-transform duration-300 group-data-[selected=true]:scale-[1.04]"
                    unoptimized
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="truncate text-sm font-medium leading-5">
                    <DynamicText>{product.name}</DynamicText>
                  </div>
                  {product.token ? (
                    <div
                      className="truncate text-xs font-medium leading-4 text-muted-foreground"
                      dir="ltr"
                    >
                      {t("products.productToken")}: {product.token}
                    </div>
                  ) : null}
                  <div className="mt-0.5 flex min-w-0 items-baseline gap-2 text-xs font-semibold leading-4">
                    {product.inStock === false ? (
                      <span className="truncate">
                        {product.availableSoon
                          ? t("products.backSoon")
                          : t("products.outOfStock")}
                      </span>
                    ) : Number(product.price) > 0 ? (
                      <Price
                        product={product}
                        size="sm"
                        className="min-w-0"
                        valueClassName="truncate"
                      />
                    ) : (
                      <span className="truncate">{t("products.priceOnRequest")}</span>
                    )}
                  </div>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
          {trimmedQuery && (
            <CommandItem
              onSelect={handleSearchAll}
              className="justify-center border-t px-3 py-4 text-center text-sm font-semibold text-primary"
            >
              {t("search.viewAllResults") || `View all results for "${searchQuery}"`}
            </CommandItem>
          )}
        </>
      )}
    </CommandList>
  </CommandDialog>
  );
}
