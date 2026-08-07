"use client";

import { useState, useEffect, useCallback } from "react";
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
import { fetchProductsWithDetails } from "@/modules/products";
import type { Product } from "@/modules/products";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { Search, Loader2 } from "lucide-react";

import { SafeImage } from "@/shared/components/ui/safe-image";
import { useFormatPrice } from "@/shared/property/use-format-price";

export function GlobalSearch() {
  const formatPrice = useFormatPrice();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const { t } = useTranslations();
  const router = useRouter();
  const trimmedQuery = searchQuery.trim();

  // Detect OS for keyboard shortcut display
  useEffect(() => {
    setIsMac(typeof window !== "undefined" && navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!open || trimmedQuery.length < 2) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const result = await fetchProductsWithDetails({
          page: 1,
          perPage: 8,
          search: trimmedQuery,
        });
        setResults(result.products);
      } catch (error) {
        console.error("Search error:", error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [trimmedQuery, open]);

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearchQuery("");
      setResults([]);
    }
  }, [open]);

  // Keyboard shortcut (Cmd+K / Ctrl+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (product: Product) => {
      setOpen(false);
      // Open the selected product directly rather than running a search.
      router.push(
        `/products/${createReadableResourcePath(product.id, product.slug)}`
      );
    },
    [router]
  );

  const handleSearchAll = useCallback(() => {
    if (trimmedQuery) {
      setOpen(false);
      router.push({
        pathname: "/products",
        query: { search: trimmedQuery },
      });
    }
  }, [trimmedQuery, router]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground sm:hidden"
        aria-label={t("search.title") || "Search"}
      >
        <Search className="h-4 w-4" />
      </button>

      <button
        onClick={() => setOpen(true)}
        className="hidden h-10 items-center gap-2 rounded-full border border-border bg-muted px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/30 hover:bg-card hover:text-foreground sm:flex sm:w-48 xl:w-64"
        aria-label={t("search.title") || "Search"}
      >
        <Search className="h-4 w-4" />
        <span className="flex-1 text-start">{t("search.placeholder") || "Search products..."}</span>
        <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded-full border border-border bg-card px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
          <span className="text-xs">{isMac ? "⌘" : "Ctrl"}</span>
          {isMac ? "K" : "+K"}
        </kbd>
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        // Results are filtered server-side; don't let cmdk re-filter and hide
        // valid matches (or the "View all results" action).
        shouldFilter={false}
        title={t("search.title") || "Search Products"}
        description={t("search.description") || "Search for products by name or description"}
      >
        <CommandInput
          placeholder={t("search.placeholder") || "Search products..."}
          value={searchQuery}
          onValueChange={setSearchQuery}
        />
        <CommandList>
          {loading && (
            <div className="flex items-center justify-center py-6">
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
          {!loading && trimmedQuery.length >= 2 && results.length === 0 && (
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
                    className="flex items-center gap-2 px-2 py-2"
                  >
                    <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-md border">
                      <SafeImage
                        src={product.image}
                        alt={product.name}
                        width={40}
                        height={40}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="truncate text-sm font-medium leading-5">
                        {product.name}
                      </div>
                      {product.token ? (
                        <div
                          className="truncate text-[11px] font-medium leading-4 text-muted-foreground"
                          dir="ltr"
                        >
                          {t("products.productToken")}: {product.token}
                        </div>
                      ) : null}
                      <div className="mt-0.5 truncate text-xs font-semibold leading-4" dir="ltr">
                        {Number(product.price) > 0 && product.inStock !== false
                          ? formatPrice(product.price, product.formattedPrice)
                          : t("products.priceOnRequest")}
                      </div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
              {trimmedQuery && (
                <CommandItem
                  onSelect={handleSearchAll}
                  className="justify-center border-t px-2 py-2 text-center text-sm font-medium"
                >
                  {t("search.viewAllResults") || `View all results for "${searchQuery}"`}
                </CommandItem>
              )}
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
