"use client";

import { Link } from "@/shared/i18n/navigation";
import { Suspense, use, useCallback, useMemo, useState } from "react";
import { PageShell } from "@/shared/components/layout/page-shell";
import { ThemedProductImage } from "./themed-product-image";
import { ProductCard } from "./product-card";
import { ProductImageFallback } from "./product-image-fallback";
import { Breadcrumbs } from "@/shared/components/layout/breadcrumbs";
import { Button } from "@/shared/components/ui/button";
import { ErrorState } from "@/shared/components/ui/error-state";
import { Card } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { isRtlLocale } from "@/shared/lib/locale";
import { useProperty } from "@/shared/property/property-provider";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/shared/components/ui/empty";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/shared/components/ui/carousel";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Hash,
  Heart,
  MessageCircle,
  Minus,
  Package,
  Plus,
  ShoppingBag,
  PackageCheck,
  Send,
  Share2,
  Truck,
  Sparkles,
  Palette,
  XCircle,
} from "lucide-react";
import { useCart } from "@/modules/cart";
import { useFavorites } from "@/modules/account";
import { useTranslations } from "@/shared/hooks/use-translations";
import { useFocusReturn } from "@/shared/hooks/use-focus-return";
import type { Product } from "../types";
import { formatRemainingQuantity, isLowStock } from "../lib/format";
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
import { useFormatPrice } from "@/shared/property/use-format-price";

interface ProductDetailClientProps {
  initialProduct: Product | null;
  relatedProductsPromise: Promise<Product[]>;
  initialError: string | null;
}

type SocialSharePlatform = "telegram" | "whatsapp";

export default function ProductDetailClient({
  initialProduct,
  relatedProductsPromise,
  initialError,
}: ProductDetailClientProps) {
  const formatPrice = useFormatPrice();
  const { t, locale } = useTranslations();
  const property = useProperty();
  const { addToCart, openCart } = useCart();
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
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { capture: captureImageOpener, onCloseAutoFocus: onImageDialogClose } = useFocusReturn();

  const inStock = product ? product.inStock !== false : false;
  const price = Number(product?.price) || 0;
  const originalPrice = Number(product?.originalPrice) || 0;
  const hasPrice = price > 0;
  const isPurchasable = inStock && hasPrice;
  const hasDiscount = isPurchasable && originalPrice > price;
  const discountPercent = hasDiscount
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0;
  const displayPrice = formatPrice(product?.price, product?.formattedPrice);
  const displayOriginalPrice = formatPrice(
    product?.originalPrice,
    product?.formattedOriginalPrice
  );
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
        action: { label: t("common.viewCart"), onClick: openCart },
      });
    },
    [addToCart, openCart, t]
  );

  const galleryImages = useMemo(() => {
    if (!product) return [] as string[];
    const sources = product.images?.length ? product.images : [product.image];
    const normalized = sources
      .filter(Boolean)
      .map((src) => normalizeImageUrl(src));
    return Array.from(new Set(normalized));
  }, [product]);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const detailImage = selectedImage ?? galleryImages[0] ?? PLACEHOLDER_IMAGE;

  const handleShare = useCallback(async () => {
    if (typeof window === "undefined") return;
    const shareUrl = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: product?.name, url: shareUrl });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(shareUrl);
        toast.success(t("common.linkCopied"));
      } else {
        toast.error(t("common.shareFailed"));
      }
    } catch {
      /* user cancelled the native share sheet — no feedback needed */
    }
  }, [product, t]);

  const handleSocialShare = useCallback(
    async (platform: SocialSharePlatform) => {
      if (typeof window === "undefined" || !product) return;

      const shareUrl = window.location.href;
      const imageUrl =
        detailImage === PLACEHOLDER_IMAGE
          ? ""
          : new URL(detailImage, window.location.origin).toString();
      const inquiryMessage = t("common.productInquiryMessage", {
        name: product.name,
      });
      const message = [inquiryMessage, shareUrl, imageUrl]
        .filter(Boolean)
        .join("\n");

      if (platform === "whatsapp") {
        window.open(
          `https://wa.me/${property.social.whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
            message
          )}`,
          "_blank",
          "noopener,noreferrer"
        );
        return;
      }

      if (navigator.clipboard) {
        await navigator.clipboard.writeText(message);
        toast.success(t("common.socialShareCopied"));
      }

      window.open(
        `https://t.me/${property.social.telegramUsername}`,
        "_blank",
        "noopener,noreferrer"
      );
    },
    [detailImage, product, t]
  );

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
                  className="relative z-10 mb-5"
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

	              <Card className="grid gap-0 overflow-hidden rounded-3xl border-0 bg-card p-0 shadow-panel sm:grid-cols-[1.08fr_0.92fr]">
	                <div className="p-2.5 sm:p-4 lg:p-5">
	                  <div className="relative aspect-square overflow-hidden rounded-xl bg-secondary sm:aspect-[5/6]">
	                    {hasImageError ? (
                        <ProductImageFallback
                          size="lg"
                          label={t("products.imageUnavailable") || "Image unavailable"}
                        />
	                    ) : (
                        <button
                          type="button"
                          aria-label={t("products.openImagePreview", { name: product.name })}
                          className="store-focus-inset relative block h-full w-full cursor-zoom-in"
                          onClick={() => {
                            captureImageOpener();
                            setIsImageDialogOpen(true);
                          }}
                        >
	                      <ThemedProductImage
	                        src={detailImage}
	                        alt={product.name}
	                        fill
	                        sizes="(min-width: 1024px) 52vw, (min-width: 640px) 48vw, 100vw"
	                        className="object-contain p-3 sm:p-5"
	                        fetchPriority="high"
	                        unoptimized
	                        onError={() => setHasImageError(true)}
	                      />
                        </button>
	                    )}
	                  </div>

	                  {galleryImages.length > 1 ? (
	                    <div className="mt-3 flex flex-wrap items-center gap-2">
	                      {galleryImages.map((image, index) => {
	                        const isActive = image === detailImage;
	                        return (
	                          <button
	                            key={image}
	                            type="button"
	                            onClick={() => {
	                              setSelectedImage(image);
	                              setHasImageError(false);
	                            }}
	                            className={`relative aspect-square size-16 overflow-hidden rounded-xl border-2 bg-storefront-brand-soft shadow-sm transition-colors dark:bg-storefront-brand-soft ${
	                              isActive
	                                ? "border-primary"
	                                : "border-transparent hover:border-primary/40"
	                            }`}
	                            aria-label={`${product.name} ${index + 1}`}
	                            aria-pressed={isActive}
	                          >
	                            <ThemedProductImage
	                              src={image}
	                              alt=""
	                              fill
	                              sizes="64px"
	                              className="object-contain p-1"
	                              unoptimized
	                            />
	                          </button>
	                        );
	                      })}
	                    </div>
	                  ) : null}
	                </div>

	                <div className="relative grid gap-4 border-t border-border p-5 sm:border-s sm:border-t-0 sm:p-7 lg:p-10">
	                  <div className="flex min-w-0 flex-col justify-center gap-5">
                    <div>
                      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <p className="store-eyebrow">{product.category ?? t("products.title")}</p>
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
                        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1 text-3xl font-bold tabular-nums text-foreground sm:text-4xl" dir="ltr">
                          <span aria-label={`${t(hasDiscount ? "products.salePrice" : "products.priceLabel")}: ${displayPrice}`}>
                            {displayPrice}
                          </span>
                          {hasDiscount ? (
                            <>
                              <span aria-label={`${t("products.originalPrice")}: ${displayOriginalPrice}`}>
                                <del
                                  aria-hidden="true"
                                  className="text-base font-medium text-muted-foreground decoration-1 sm:text-lg"
                                >
                                  {displayOriginalPrice}
                                </del>
                              </span>
                              <span className="rounded-full bg-rose px-2.5 py-1 text-xs font-bold text-rose-foreground">
                                {t("products.discountBadge", {
                                  percent: new Intl.NumberFormat(locale).format(discountPercent),
                                })}
                              </span>
                            </>
                          ) : null}
                        </p>
                      ) : (
                        <p className="text-xl font-semibold text-foreground sm:text-2xl">
                          {t("products.priceOnRequest")}
                        </p>
                      )}

                      <p
                        className={cn(
                          "inline-flex items-center gap-2 text-sm font-semibold",
                          inStock ? "text-leaf" : "text-muted-foreground"
                        )}
                      >
                        {/* The icon has to agree with the words: an X beside
                            "back in stock soon" reads as a flat refusal. */}
                        {inStock ? (
                          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
                        ) : product.availableSoon ? (
                          <Clock className="size-4 shrink-0" aria-hidden="true" />
                        ) : (
                          <XCircle className="size-4 shrink-0" aria-hidden="true" />
                        )}
                        <span className="sr-only">{t("common.availability")}: </span>
                        {inStock
                          ? t("common.inStock")
                          : product.availableSoon
                            ? t("products.backSoon")
                            : t("products.outOfStock")}
                      </p>
                    </div>

                    {hasRichTextContent(
                      product.richDescription ?? product.description
                    ) ? (
                      <RichText
                        content={product.richDescription ?? product.description}
                      />
                    ) : null}

	                    {isLowStock(product) && product.quantity != null ? (
	                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
	                        <Package className="size-4" />
	                        {formatQuantity(product.quantity)}
	                      </p>
	                    ) : null}

                    {/* Buy block. On phones it pins to the bottom of the viewport
                        so the action stays reachable while the description is
                        read; from sm up it sits in the normal flow. */}
                    <div className="sticky bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-20 -mx-2 flex flex-col gap-3 rounded-2xl border border-border bg-background/95 p-3 shadow-xl shadow-foreground/10 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0 sm:shadow-none">
                      {isPurchasable ? (
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <div className="flex items-center gap-1 self-start rounded-full border border-border bg-card p-1">
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="size-11 rounded-full"
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
                              className="size-11 rounded-full"
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

                    {/* Save / share / order-by-chat. Secondary by placement and
                        each icon carries a visible word, so nothing here is an
                        unlabelled glyph competing with the buy action. */}
                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => toggleFavorite(product)}
                        aria-pressed={productIsFavorite}
                        className={cn("gap-2", productIsFavorite && "border-primary/40 text-primary")}
                      >
                        <Heart className={cn("size-4", productIsFavorite && "fill-primary text-primary")} aria-hidden="true" />
                        {productIsFavorite ? t("common.removeFromFavorites") : t("common.favorites")}
                      </Button>
                      <Button type="button" variant="outline" size="sm" className="gap-2" onClick={handleShare}>
                        <Share2 className="size-4" aria-hidden="true" />
                        {t("common.share")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => void handleSocialShare("whatsapp")}
                        aria-label={t("products.askOnWhatsApp")}
                      >
                        <MessageCircle className="size-4" aria-hidden="true" />
                        {t("common.shareOnWhatsApp")}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="gap-2"
                        onClick={() => void handleSocialShare("telegram")}
                        aria-label={t("products.askOnTelegram")}
                      >
                        <Send className="size-4" aria-hidden="true" />
                        {t("common.shareOnTelegram")}
                      </Button>
                    </div>

	                    <div className="grid gap-4 border-t border-border pt-5">
                      {[
                        {
                          Icon: Sparkles,
                          title: t("home.serviceFreshnessTitle"),
                          text: t("home.serviceFreshnessText"),
                          badge: "bg-secondary text-muted-foreground ring-border",
                        },
                        {
                          Icon: Palette,
                          title: t("home.serviceDesignTitle"),
                          text: t("home.serviceDesignText"),
                          badge: "bg-secondary text-muted-foreground ring-border",
                        },
                        {
                          Icon: PackageCheck,
                          title: t("home.servicePreparationTitle"),
                          text: t("home.servicePreparationText"),
                          badge: "bg-secondary text-muted-foreground ring-border",
                        },
                      ].map(({ Icon, title, text, badge }) => (
                        <div key={title} className="flex items-start gap-3">
                          <span
                            className={`mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full ring-1 ${badge}`}
                          >
                            <Icon className="size-4" />
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-card-foreground">
                              {title}
                            </p>
                            <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                              {text}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4">
	                      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-card-foreground">
	                        <PackageCheck className="size-4 shrink-0 text-primary" />
	                        {t("products.deliveryTitle")}
	                      </div>
	                      <div className="grid gap-3 sm:grid-cols-2">
	                        <div className="flex gap-3">
	                          <Truck className="mt-0.5 size-4 shrink-0 text-primary" />
	                          <div>
	                            <p className="text-sm font-semibold text-card-foreground">
	                              {t("products.deliveryLocal")}
	                            </p>
	                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
	                              {t("products.deliveryLocalDescription")}
	                            </p>
	                          </div>
	                        </div>
	                        <div className="flex gap-3">
	                          <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
	                          <div>
	                            <p className="text-sm font-semibold text-card-foreground">
	                              {t("products.deliveryPickup")}
	                            </p>
	                            <p className="mt-1 text-xs leading-5 text-muted-foreground">
	                              {t("products.deliveryPickupDescription")}
	                            </p>
	                          </div>
	                        </div>
	                      </div>
	                    </div>
	                  </div>
                </div>
              </Card>
            </div>
          </section>

          <section className="store-section border-t border-border bg-background">
            <div className="store-container">
              <div className="mb-8">
                <p className="store-eyebrow mb-3">{t("common.browseByCategory")}</p>
                <h2 className="store-section-title text-foreground">
                  {t("products.detailRelatedTitle")}
                </h2>
              </div>
              <Suspense fallback={<RelatedProductsSkeleton />}>
                <RelatedProductsContent promise={relatedProductsPromise} isRTL={isRTL} />
              </Suspense>
            </div>
          </section>

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogContent
              closeLabel={t("common.close")}
              className="max-w-[calc(100vw-1rem)] gap-0 p-2 sm:max-w-6xl sm:p-3"
              onCloseAutoFocus={onImageDialogClose}
            >
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <DialogDescription className="sr-only">
                {product.name}
              </DialogDescription>
              <div className="relative h-[82vh] max-h-[760px] w-full overflow-hidden rounded-md bg-secondary">
                <ThemedProductImage
                  src={detailImage}
                  alt={product.name}
                  fill
                  sizes="100vw"
                  className="object-contain p-2 sm:p-4"
                  unoptimized
                />
              </div>
            </DialogContent>
          </Dialog>
        </>
      ) : null}

    </PageShell>
  );
}

function RelatedProductsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col">
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-5 w-1/2" />
        </div>
      ))}
    </div>
  );
}

/**
 * Related products are streamed in via <Suspense> so the main product paints
 * first; `use()` unwraps the server-provided promise once it resolves.
 */
function RelatedProductsContent({
  promise,
  isRTL,
}: {
  promise: Promise<Product[]>;
  isRTL: boolean;
}) {
  const relatedProducts = use(promise);
  const { t, locale } = useTranslations();
  const numberFormat = new Intl.NumberFormat(locale);

  if (relatedProducts.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="size-6" />
          </EmptyMedia>
          <EmptyTitle>{t("products.noProducts")}</EmptyTitle>
          <EmptyDescription>{t("products.noProductsInCategory")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Carousel
      opts={{ align: "start", loop: false, direction: isRTL ? "rtl" : "ltr" }}
      className="w-full"
      aria-label={t("products.detailRelatedTitle")}
    >
      <CarouselContent className="-ms-3 sm:-ms-4">
        {relatedProducts.map((relatedProduct, index) => (
          <CarouselItem
            key={relatedProduct.id}
            aria-label={t("common.carouselItemPosition", {
              current: numberFormat.format(index + 1),
              total: numberFormat.format(relatedProducts.length),
              name: relatedProduct.name,
            })}
            className="basis-[74%] ps-3 min-[480px]:basis-1/2 sm:basis-1/3 sm:ps-4 lg:basis-1/4"
          >
            <ProductCard
              product={relatedProduct}
              locale={locale}
              t={t}
              showAddToCart={false}
              sizes="(min-width: 1280px) 19rem, (min-width: 1024px) 22vw, (min-width: 640px) 31vw, 74vw"
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "right-2 left-auto md:-right-4" : "left-2 right-auto md:-left-4"
        }`}
      >
        {isRTL ? <ArrowRight className="size-4" /> : <ArrowLeft className="size-4" />}
        <span className="sr-only">{t("common.previousSlide")}</span>
      </CarouselPrevious>
      <CarouselNext
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "left-2 right-auto md:-left-4" : "right-2 left-auto md:-right-4"
        }`}
      >
        {isRTL ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
        <span className="sr-only">{t("common.nextSlide")}</span>
      </CarouselNext>
    </Carousel>
  );
}
