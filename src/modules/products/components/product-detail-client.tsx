"use client";

import { Link, useRouter } from "@/shared/i18n/navigation";
import { Suspense, use, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { PageShell } from "@/shared/components/layout/page-shell";
import { ThemedProductImage } from "./themed-product-image";
import { ProductCard } from "./product-card";
import { ProductImageFallback } from "./product-image-fallback";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { isRtlLocale } from "@/shared/lib/locale";
import {
  ArrowLeft,
  ArrowRight,
  Hash,
  Heart,
  Minus,
  Plus,
  ShoppingBag,
} from "lucide-react";
import { useCart } from "@/modules/cart";
import { useFavorites } from "@/modules/account";
import { useTranslations } from "@/shared/hooks/use-translations";
import type { Product } from "../types";
import { formatRemainingQuantity, isLowStock } from "../lib/format";
import { Price, getDiscountPercent } from "./price";
import { cn, normalizeImageUrl } from "@/shared/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/shared/lib/image";
import dynamic from "next/dynamic";
import { hasRichTextContent } from "@/shared/lib/rich-text";

// The TipTap renderer (and prosemirror underneath it) is the heaviest thing on
// these pages and is only reached when a record actually carries rich text, so
// it loads as its own chunk instead of riding along with the catalogue.
const RichText = dynamic(() =>
  import("@/shared/components/rich-text").then((m) => m.RichText)
);
import { toast } from "sonner";

interface ProductDetailClientProps {
  initialProduct: Product | null;
  relatedProductsPromise: Promise<Product[]>;
  initialError: string | null;
}

export default function ProductDetailClient({
  initialProduct,
  relatedProductsPromise,
  initialError,
}: ProductDetailClientProps) {
  const { t, locale } = useTranslations();
  const { addToCart } = useCart();
  const router = useRouter();
  const { toggleFavorite, isFavorite } = useFavorites();
  const isRTL = isRtlLocale(locale);
  const BackArrow = isRTL ? ArrowRight : ArrowLeft;

  const product = initialProduct;
  const error = initialError ?? (initialProduct ? null : "NOT_FOUND");
  const productIsFavorite = product ? isFavorite(product.id) : false;
  const formatQuantity = useCallback(
    (quantity: number) => formatRemainingQuantity(t, locale, quantity),
    [locale, t]
  );
  const [hasImageError, setHasImageError] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const inStock = product ? product.inStock !== false : false;
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  const hasPrice = price > 0;
  const isPurchasable = inStock && hasPrice;
  const hasDiscount = isPurchasable && originalPrice > price;
  const discountPercent =
    hasDiscount && product ? getDiscountPercent(product) : 0;
  const isLowQuantity = product ? isLowStock(product) : false;
  // Stock tracking is optional in the catalogue: a positive count is a real
  // ceiling, anything else means "not tracked" and must not cap the stepper.
  const maxQuantity =
    product?.quantity != null && product.quantity > 0 ? product.quantity : null;

  const addProductToCart = useCallback(
    (targetProduct: Product, count = 1) => {
      for (let index = 0; index < count; index += 1) {
        addToCart(targetProduct);
      }
      toast.success(t("common.addedToCart", { name: targetProduct.name }), {
        action: {
        label: t("common.viewCart"),
        onClick: () => router.push("/cart"),
      },
      });
    },
    [addToCart, router, t]
  );

  /* One photograph, as the design shows one. The page carried a thumbnail
     rail and a keyboard-driven lightbox over it; the catalogue's products
     mostly ship a single image, so the rail was usually absent and the zoom
     was a second way to look at a picture already filling half the page. */
  const detailImage = useMemo(() => {
    const source = product?.images?.[0] ?? product?.image;
    return source ? normalizeImageUrl(source) : PLACEHOLDER_IMAGE;
  }, [product]);

  return (
    <PageShell>
      {error ? (
        <section className="store-section">
          <div className="store-container max-w-4xl">
            <ErrorState
              message={
                error === "NOT_FOUND"
                  ? t("products.detailNotFound") || "Product not found"
                  : t("products.loadError") ||
                    "We couldn't load this product just now. Please try again."
              }
              action={
                <Button asChild variant="outline" className="gap-2">
                  <Link href="/products">
                    <BackArrow className="size-4" />
                    {t("products.detailBack") || "Back to products"}
                  </Link>
                </Button>
              }
            />
          </div>
        </section>
      ) : product ? (
        <>
	          <section className="store-section bg-background dark:bg-background">
	            <div className="store-container">
                <Breadcrumbs
                  label={t("products.breadcrumb")}
                  className="relative z-10 mb-7"
                  items={[
                    { label: t("common.home"), href: "/" },
                    { label: t("common.products"), href: "/products" },
                    ...(product.category
                      ? [
                          {
                            label: product.category,
                            href: {
                              pathname: "/products",
                              query: product.categorySlug
                                ? { category: product.categorySlug }
                                : {},
                            },
                          },
                        ]
                      : []),
                    { label: product.name },
                  ]}
                />

	              <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(22rem,0.78fr)] lg:items-start lg:gap-14 xl:gap-20">
	                <div className="min-w-0">
	                  <div className="organic-washed relative aspect-square overflow-hidden rounded-[2.25rem] bg-secondary shadow-card">
	                    {hasImageError ? (
                        <ProductImageFallback
                          size="lg"
                          label={t("products.imageUnavailable") || "Image unavailable"}
                        />
	                    ) : (
	                      <ThemedProductImage
	                        src={detailImage}
	                        alt={product.name}
	                        fill
	                        sizes="(min-width: 1024px) 52vw, (min-width: 640px) 48vw, 100vw"
	                        /* Centred, unlike the catalogue tile's `object-top`.
	                           The tile is a 4:5 frame taking a few percent off
	                           a 3:4 photograph, where biasing to the top keeps
	                           the crop on the plinth. This plate is square, so
	                           the crop is a quarter of the height — taken from
	                           one end it removes the flowers or the vessel
	                           entirely, and shared between both it removes
	                           margin from each. */
	                        className="object-cover object-center"
	                        preload
	                        unoptimized
	                        onError={() => setHasImageError(true)}
	                      />
	                    )}
	                  </div>

	                </div>

	                <div className="store-sticky-lg relative grid min-w-0 gap-4 border-t border-border pt-7 lg:border-t-0 lg:pt-3">
	                  <div className="flex min-w-0 flex-col justify-center gap-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        {/* The collection as the system's sage tag, the same
                            object the catalogue pins to a card's corner — the
                            seam-and-capitals eyebrow belonged to a page's
                            masthead, not to a product's label. */}
                        <Badge variant="sage" className="px-3 py-1 text-xs">
                          <span className="store-dynamic-text">
                            {product.category ?? t("products.title")}
                          </span>
                        </Badge>
                        {product.token ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                            <Hash className="size-3.5" aria-hidden="true" />
                            {t("products.productToken")}:
                            <span dir="ltr" className="tabular-nums">{product.token}</span>
                          </span>
                        ) : null}
                      </div>
                      {/* A product name is a label, not a banner: it is sized to
                          keep price, stock and the buy action in the same view. */}
                      <h1 className="store-dynamic-text font-display text-3xl leading-[1.06] text-card-foreground [.locale-fa_&]:leading-[1.4] sm:text-4xl lg:text-[2.75rem]">
                        <bdi>{product.name}</bdi>
                      </h1>
                    </div>

                    <div className="flex flex-col gap-2">
                      {hasPrice ? (
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                          <Price product={product} size="lg" showDiscount={hasDiscount} />
                          {hasDiscount ? (
                            <span className="rounded-full bg-rose px-2.5 py-1 text-xs font-bold text-rose-foreground">
                              {t("products.discountBadge", {
                                percent: new Intl.NumberFormat(locale).format(discountPercent),
                              })}
                            </span>
                          ) : null}
                        </p>
                      ) : (
                        <p className="text-xl font-semibold text-foreground sm:text-2xl">
                          {t("products.priceOnRequest")}
                        </p>
                      )}

                      {/* The same dot the catalogue cards carry, at the same
                          three colours, so availability reads as one fact
                          stated the same way wherever a shopper meets it. It
                          replaces a check/clock/cross icon set that only this
                          page used — three glyphs to say what the words beside
                          them already said, in a vocabulary no other surface
                          shared. Colour never carries it alone. */}
                      <p className="inline-flex items-center gap-2.5 text-sm text-muted-foreground">
                        <span
                          className={cn(
                            "size-2 shrink-0 rounded-full",
                            !inStock
                              ? "bg-sand-400"
                              : isLowQuantity
                                ? "bg-rose"
                                : "bg-leaf"
                          )}
                          aria-hidden="true"
                        />
                        <span className="sr-only">{t("common.availability")}: </span>
                        {!inStock
                          ? product.availableSoon
                            ? t("products.backSoon")
                            : t("products.outOfStock")
                          : isLowQuantity && product.quantity != null
                            ? formatQuantity(product.quantity)
                            : t("common.inStock")}
                      </p>
                    </div>

                    {hasRichTextContent(
                      product.richDescription ?? product.description
                    ) ? (
                      <RichText
                        content={product.richDescription ?? product.description}
                      />
                    ) : null}

                    {/* Buy block. On phones it pins to the bottom of the viewport
                        so the action stays reachable while the description is
                        read; from sm up it sits in the normal flow. */}
                    <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 -mx-2 flex flex-col gap-3 rounded-3xl border border-border bg-background/95 p-3 shadow-panel backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                      {isPurchasable ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-1 self-start rounded-full border border-border bg-card p-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              disabled={quantity <= 1}
                              aria-label={t("common.decreaseQuantity")}
                              onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                            >
                              <Minus className="size-4" />
                            </Button>
                            <span
                              className="w-10 text-center text-base font-bold tabular-nums"
                              aria-live="polite"
                              aria-label={`${t("common.quantity")}: ${new Intl.NumberFormat(locale).format(quantity)}`}
                            >
                              {new Intl.NumberFormat(locale).format(quantity)}
                            </span>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="rounded-full"
                              disabled={maxQuantity != null && quantity >= maxQuantity}
                              aria-label={t("common.increaseQuantity")}
                              onClick={() =>
                                setQuantity((value) =>
                                  maxQuantity != null ? Math.min(maxQuantity, value + 1) : value + 1
                                )
                              }
                            >
                              <Plus className="size-4" />
                            </Button>
                          </div>
                          <Button
                            size="lg"
                            className="w-full gap-2 sm:w-auto sm:flex-1"
                            onClick={() => addProductToCart(product, quantity)}
                          >
                            <ShoppingBag className="size-4" aria-hidden="true" />
                            {t("common.addToCart")}
                          </Button>
                          {/* The design keeps saving in this row, beside the
                              buy action — it is a decision about *this*
                              product, where sharing it is not. It reads as a
                              square outline control at the row's own height,
                              and it keeps its accessible name because the
                              glyph alone is ambiguous between "save" and
                              "saved". */}
                          <Button
                            type="button"
                            variant="outline"
                            className="size-12 shrink-0 self-start p-0 sm:self-auto"
                            aria-pressed={productIsFavorite}
                            aria-label={
                              productIsFavorite
                                ? t("common.removeFromFavorites")
                                : t("common.favorites")
                            }
                            onClick={() => toggleFavorite(product)}
                          >
                            <Heart
                              className={cn(
                                "size-[18px]",
                                productIsFavorite && "fill-rose text-rose"
                              )}
                              aria-hidden="true"
                            />
                          </Button>
                        </div>
                      ) : (
                        <Button asChild size="lg" className="w-full sm:w-auto">
                          <Link
                            href={{
                              pathname: "/contact",
                              query: { subject: product.name },
                            }}
                          >
                            {/* Two different dead ends need two different asks:
                                an unpriced product needs a quote, a sold-out one
                                needs to know when it is back. */}
                            {hasPrice ? t("products.outOfStockCta") : t("products.contactForPrice")}
                          </Link>
                        </Button>
                      )}
                    </div>

	                    {/* The care notes, as the design sets them: a sage dot,
	                        one line each, under a single rule. They were three
	                        ringed icon medallions with a bolded title over a
	                        caption — a second card of assurances inside the
	                        product's own column, competing with the buy action
	                        directly above it. */}
	                    <ul className="flex flex-col gap-3 border-t border-border pt-[1.375rem]">
                      {[
                        t("home.serviceFreshnessText"),
                        t("home.serviceDesignText"),
                        t("home.servicePreparationText"),
                      ].map((note) => (
                        <li key={note} className="flex items-start gap-3">
                          <span
                            className="mt-[0.4375rem] size-2 shrink-0 rounded-full bg-leaf"
                            aria-hidden="true"
                          />
                          <span className="text-sm leading-relaxed text-card-foreground/78">
                            {note}
                          </span>
                        </li>
                      ))}
                    </ul>

	                  </div>
                </div>
	              </div>
            </div>
          </section>

          {/* The heading lives inside the boundary with the rail it names: an
              empty result now removes the whole band rather than leaving a
              "Related products" title over a "no products in this category"
              notice, which reads as a fault on a page that is working. */}
          <Suspense fallback={<RelatedProductsSkeleton title={t("products.detailRelatedTitle")} />}>
            <RelatedProductsContent promise={relatedProductsPromise} />
          </Suspense>
        </>
      ) : null}
    </PageShell>
  );
}

/** The band the rail sits in, so its skeleton and its content share a frame. */
function RelatedProductsSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="store-section border-t border-border bg-background">
      <div className="store-container">
        {/* One heading, no eyebrow: "Browse by category" above "Related
            products" named the rail twice and neither line was the rail. */}
        <h2 className="store-section-title mb-[1.625rem] text-foreground">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

/**
 * Mirrors the carousel's own track — a partially visible fourth card at the
 * viewport edge — rather than the four-up grid it used to draw, which
 * rearranged the whole band the moment the real rail arrived.
 */
function RelatedProductsSkeleton({
  title,
}: {
  title: string;
}) {
  return (
    <RelatedProductsSection title={title}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-[1.375rem] lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="flex flex-col">
            <Skeleton className="aspect-[4/5] w-full rounded-[1.625rem]" />
            <Skeleton className="mt-3 h-4 w-3/4" />
            <Skeleton className="mt-2 h-5 w-1/2" />
          </div>
        ))}
      </div>
    </RelatedProductsSection>
  );
}

/**
 * Related products are streamed in via <Suspense> so the main product paints
 * first; `use()` unwraps the server-provided promise once it resolves.
 */
function RelatedProductsContent({
  promise,
}: {
  promise: Promise<Product[]>;
}) {
  const relatedProducts = use(promise);
  const { t, locale } = useTranslations();

  // Nothing to cross-sell is not an error worth a panel — the band simply
  // isn't there.
  if (relatedProducts.length === 0) {
    return null;
  }

  return (
    <RelatedProductsSection title={t("products.detailRelatedTitle")}>
      {/* A wall, not a carousel. The design closes a product page on the same
          four-up grid the catalogue draws, which shows every suggestion at
          once instead of hiding three of four behind arrows — and lets each
          card keep the buy action it has everywhere else. */}
      <ul className="grid grid-cols-2 items-stretch gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-[1.375rem] lg:grid-cols-4">
        {relatedProducts.slice(0, 4).map((relatedProduct) => (
          <li key={relatedProduct.id}>
            <ProductCard
              product={relatedProduct}
              locale={locale}
              t={t}
              showCategory
              sizes="(min-width: 1024px) 17vw, (min-width: 768px) 24vw, 45vw"
            />
          </li>
        ))}
      </ul>
    </RelatedProductsSection>
  );
}
