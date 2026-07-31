"use client";

import { Link } from "@/shared/i18n/navigation";
import { Suspense, use, useCallback, useMemo, useState } from "react";
import { PageShell } from "@/shared/components/layout/page-shell";
import { ThemedProductImage } from "./themed-product-image";
import { Button } from "@/shared/components/ui/button";
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
import { Alert, AlertDescription } from "@/shared/components/ui/alert";
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
  MapPin,
  Hash,
  Heart,
  ImageOff,
  MessageCircle,
  Package,
  ShoppingBag,
  PackageCheck,
  Send,
  Share2,
  Truck,
  Sparkles,
  Palette,
} from "lucide-react";
import { useCart } from "@/modules/cart";
import { useFavorites } from "@/modules/account";
import { useTranslations } from "@/shared/hooks/use-translations";
import type { Product } from "@/modules/products";
import { formatRemainingQuantity } from "../lib/format";
import { createReadableResourcePath } from "@/shared/lib/slug-url";
import { cn, formatLocalizedPrice, normalizeImageUrl } from "@/shared/lib/utils";
import { PLACEHOLDER_IMAGE } from "@/shared/lib/image";
import { RichText, hasRichTextContent } from "@/shared/components/rich-text";
import { toast } from "sonner";

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

  const addProductToCart = useCallback(
    (targetProduct: Product) => {
      addToCart(targetProduct);
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
        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <Alert variant="destructive">
              <AlertDescription>
                <p>
                  {error === "NOT_FOUND"
                    ? t("products.detailNotFound") || "Product not found"
                    : error}
                </p>
                <Button asChild variant="outline" className="mt-4 gap-2">
                  <Link href="/products">
                    <BackArrow className="h-4 w-4" />
                    {t("products.detailBack") || "Back to products"}
                  </Link>
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        </section>
      ) : product ? (
        <>
	          <section className="bg-background pb-12 pt-32 dark:bg-background sm:pb-14 sm:pt-36">
	            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		              <nav
		                aria-label={t("products.breadcrumb") || "Breadcrumb"}
		                className="relative z-10 mb-6 text-sm"
		              >
		                <ol className="flex flex-wrap items-center gap-2">
		                  <li>
		                    <Link
		                      href="/products"
		                      className="group inline-flex items-center gap-1.5 rounded-sm text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
		                    >
		                      <BackArrow className="size-3.5 transition-transform duration-300 group-hover:-translate-x-0.5 rtl:group-hover:translate-x-0.5" />
		                      {t("common.products")}
		                    </Link>
		                  </li>
		                  {product.category ? (
		                    <li className="flex items-center gap-2">
		                      <span className="text-muted-foreground" aria-hidden="true">/</span>
		                      <span className="font-semibold text-primary" aria-current="page">
		                        {product.category}
		                      </span>
		                    </li>
		                  ) : null}
		                </ol>
		              </nav>

	              <Card className="grid gap-0 overflow-hidden rounded-lg border-border bg-card p-0 shadow-xl shadow-storefront-brand/5 lg:grid-cols-2">
	                <div className="p-3 sm:p-4">
	                  <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-secondary">
                    <span aria-hidden="true" className="absolute start-3 top-3 z-10 h-1.5 w-10 rounded-full bg-foreground/25" />
	                    {hasImageError ? (
	                      <div className="flex h-full w-full flex-col items-center justify-center gap-3 text-muted-foreground">
	                        <span className="flex size-16 items-center justify-center rounded-full bg-background/75 shadow-sm ring-1 ring-border">
	                          <ImageOff className="h-7 w-7" />
	                        </span>
	                        <span className="text-sm font-semibold">
	                          {t("products.imageUnavailable") || "Image unavailable"}
	                        </span>
	                      </div>
	                    ) : (
                        <button
                          type="button"
                          aria-label={product.name}
                          className="relative block h-full w-full cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                          onClick={() => setIsImageDialogOpen(true)}
                        >
	                      <ThemedProductImage
	                        src={detailImage}
	                        alt={product.name}
	                        fill
	                        className="object-contain p-5"
	                        priority
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
	                            className={`relative aspect-square size-16 overflow-hidden rounded-md border-2 bg-storefront-brand-soft shadow-sm dark:bg-storefront-brand-soft ${
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
	                              className="object-contain p-1"
	                              unoptimized
	                            />
	                          </button>
	                        );
	                      })}
	                    </div>
	                  ) : null}
	                </div>

                <div className="relative grid gap-4 border-t border-border p-4 sm:p-6 lg:border-t-0 lg:gap-5">
	                  <div className="flex min-w-0 flex-col justify-center gap-6">
		                    <div className="flex flex-wrap items-center gap-2">
		                      {product.token ? (
                        <span className="inline-flex items-center gap-2 rounded-full border border-border bg-storefront-brand-soft px-3 py-1 text-xs font-semibold text-primary">
                          <Hash className="size-3.5" />
                          {t("products.productToken") || "Product Code"}:
                          <span dir="ltr">{product.token}</span>
                        </span>
	                      ) : null}
	                    </div>

	                    <div>
	                      <span className="golzar-seam mb-3 max-w-[7rem]">
                          <span className="petal-dot" aria-hidden="true" />
                          <span className="h-px flex-1" aria-hidden="true" />
                        </span>
                        <h1 className="font-display text-3xl leading-tight tracking-tight text-card-foreground sm:text-4xl lg:text-5xl">
	                        {product.name}
	                      </h1>
	                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
                      <button
                        type="button"
                        onClick={() => toggleFavorite(product)}
                        aria-pressed={productIsFavorite}
                        aria-label={
                          productIsFavorite
                            ? t("common.removeFromFavorites") || "Remove from favorites"
                            : t("common.favorites") || "Add to favorites"
                        }
                        title={
                          productIsFavorite
                            ? t("common.removeFromFavorites") || "Remove from favorites"
                            : t("common.favorites") || "Add to favorites"
                        }
                        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                      >
                        <Heart
                          className={`size-5 shrink-0 ${
                            productIsFavorite
                              ? "fill-primary text-primary"
                              : ""
                          }`}
                        />
                        <span className="truncate">
                          {productIsFavorite
                            ? t("common.removeFromFavorites") || "Remove from favorites"
                            : t("common.favorites") || "Add to favorites"}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={handleShare}
                        aria-label={t("common.share") || "Share"}
                        title={t("common.share") || "Share"}
                        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                      >
                        <Share2 className="size-5 shrink-0" />
                        <span className="truncate">{t("common.share") || "Share"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSocialShare("telegram")}
                        aria-label={t("common.shareOnTelegram")}
                        title={t("common.shareOnTelegram")}
                        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                      >
                        <Send className="size-5 shrink-0" />
                        <span className="truncate">{t("common.shareOnTelegram")}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSocialShare("whatsapp")}
                        aria-label={t("common.shareOnWhatsApp")}
                        title={t("common.shareOnWhatsApp")}
                        className="inline-flex h-10 min-w-0 items-center justify-center gap-2 rounded-full border border-border bg-card px-3 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:w-auto"
                      >
                        <MessageCircle className="size-5 shrink-0" />
                        <span className="truncate">{t("common.shareOnWhatsApp")}</span>
                      </button>
                    </div>

                    {product.inStock !== false ? (
                      <p className="text-3xl font-bold text-card-foreground">
                        {Number(product.price) > 0
                          ? formatLocalizedPrice(
                              product.price,
                              locale,
                              product.formattedPrice
                            )
                          : t("products.priceOnRequest")}
                      </p>
                    ) : null}

                    {hasRichTextContent(
                      product.richDescription ?? product.description
                    ) ? (
                      <RichText
                        content={product.richDescription ?? product.description}
                        className="space-y-4 text-base leading-8 text-muted-foreground [&_.tableWrapper]:overflow-x-auto [&_.tableWrapper]:rounded-lg [&_.tableWrapper]:border [&_.tableWrapper]:border-border [&_a]:font-semibold [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-4 [&_blockquote]:border-s-2 [&_blockquote]:border-primary/30 [&_blockquote]:ps-4 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-medium [&_h2]:leading-tight [&_h2]:text-card-foreground [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-medium [&_h3]:text-card-foreground [&_img]:rounded-lg [&_ol]:list-inside [&_ol]:list-decimal [&_strong]:text-card-foreground [&_table]:w-full [&_table]:min-w-max [&_table]:border-collapse [&_tbody_tr:nth-child(even)]:bg-muted/35 [&_td]:border [&_td]:border-border [&_td]:px-3 [&_td]:py-2 [&_td]:align-top [&_th]:border [&_th]:border-border [&_th]:bg-muted [&_th]:px-3 [&_th]:py-2 [&_th]:text-start [&_th]:font-semibold [&_th]:text-card-foreground [&_ul]:list-inside [&_ul]:list-disc"
                      />
                    ) : null}

	                    {product.quantity != null && product.quantity < 2 ? (
	                      <p className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
	                        <Package className="size-4" />
	                        {formatQuantity(product.quantity)}
	                      </p>
	                    ) : null}

	                    <div className="flex flex-wrap items-center gap-3">
                      {Number(product.price) > 0 && product.inStock !== false ? (
	                        <Button size="lg" className="gap-2" onClick={() => addProductToCart(product)}>
                          <ShoppingBag className="size-4" />
                          {t("common.addToCart")}
                        </Button>
                      ) : (
	                        <Button asChild size="lg">
                          <Link
                            href={{
                              pathname: "/contact",
                              query: { subject: product.name },
                            }}
                          >
                            {t("products.contactForPrice") || "Contact for Price"}
                          </Link>
                        </Button>
                      )}

	                      <Button asChild size="lg" variant="outline">
	                        <Link href="/contact">
	                          {t("contact.title") || "Contact Us"}
	                        </Link>
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

          <section className="border-t border-border bg-background py-16">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="mb-8">
                <h2 className="font-display text-2xl leading-tight text-foreground sm:text-3xl">
                  {t("products.detailRelatedTitle") || "Related Products"}
                </h2>
                <div className="mt-3 h-1 w-24 rounded-full bg-foreground" />
              </div>
              <Suspense fallback={<RelatedProductsSkeleton />}>
                <RelatedProductsContent promise={relatedProductsPromise} isRTL={isRTL} />
              </Suspense>
            </div>
          </section>

          <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}>
            <DialogContent className="max-w-[calc(100vw-1rem)] gap-0 p-2 sm:max-w-6xl sm:p-3">
              <DialogTitle className="sr-only">{product.name}</DialogTitle>
              <DialogDescription className="sr-only">
                {product.name}
              </DialogDescription>
              <div className="relative h-[82vh] max-h-[760px] w-full overflow-hidden rounded-md bg-secondary">
                <ThemedProductImage
                  src={detailImage}
                  alt={product.name}
                  fill
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
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="flex flex-col items-center px-3">
          <Skeleton className="aspect-[4/5] w-full rounded-md" />
          <Skeleton className="mt-3 h-4 w-3/4" />
          <Skeleton className="mt-2 h-4 w-1/2" />
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
  const [relatedImageErrorIds, setRelatedImageErrorIds] = useState<Set<number>>(
    new Set()
  );

  if (relatedProducts.length === 0) {
    return (
      <Empty className="py-10">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="h-6 w-6" />
          </EmptyMedia>
          <EmptyTitle>{t("products.noProducts") || "No products found"}</EmptyTitle>
          <EmptyDescription>
            {t("products.noProductsInCategory") ||
              "There are no products available in this category."}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Carousel
      opts={{ align: "start", loop: false, direction: isRTL ? "rtl" : "ltr" }}
      className="w-full"
    >
      <CarouselContent className="mx-0">
        {relatedProducts.map((relatedProduct) => {
          const relatedHref = `/products/${createReadableResourcePath(
            relatedProduct.id,
            relatedProduct.slug
          )}`;
          const hasRelatedImageError = relatedImageErrorIds.has(relatedProduct.id);
          const inStock = relatedProduct.inStock !== false;
          const hasPrice = Number(relatedProduct.price) > 0 && inStock;
          const displayPrice = formatLocalizedPrice(
            relatedProduct.price,
            locale,
            relatedProduct.formattedPrice
          );

          return (
            <CarouselItem
              key={relatedProduct.id}
              className="basis-[58%] px-0 sm:basis-[36%] md:basis-1/4 lg:basis-1/5 xl:basis-[14.285714%]"
            >
              <div className="group flex h-full flex-col items-center border-e border-border px-3">
                <Link
                  href={relatedHref}
                  className="relative block aspect-[4/5] w-full overflow-hidden rounded-md bg-storefront-brand-soft outline-none transition-shadow focus-visible:ring-2 focus-visible:ring-ring dark:bg-storefront-brand-soft"
                >
                  {hasRelatedImageError ? (
                    <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                      <ImageOff className="h-7 w-7" />
                    </div>
                  ) : (
                    <ThemedProductImage
                      src={normalizeImageUrl(relatedProduct.image)}
                      alt={relatedProduct.name}
                      width={240}
                      height={300}
                      className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]"
                      unoptimized
                      loading="lazy"
                      onError={() =>
                        setRelatedImageErrorIds((previousIds) => {
                          if (previousIds.has(relatedProduct.id)) {
                            return previousIds;
                          }
                          const nextIds = new Set(previousIds);
                          nextIds.add(relatedProduct.id);
                          return nextIds;
                        })
                      }
                    />
                  )}
                </Link>
                <div className="min-h-11 w-full flex-1 px-1 pb-2 pt-3 text-center">
                  <div className="min-h-5 text-[11px] font-semibold leading-5 sm:text-xs">
                    <Link
                      href={relatedHref}
                      className="block truncate rounded-sm text-center outline-none transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {relatedProduct.name}
                    </Link>
                  </div>
                  {relatedProduct.quantity != null &&
                  relatedProduct.quantity < 2 ? (
                    <p className="mt-1 max-w-full truncate text-[11px] font-semibold leading-4 text-primary">
                      {formatRemainingQuantity(t, locale, relatedProduct.quantity)}
                    </p>
                  ) : null}
                </div>
                <div className="mt-auto flex w-full justify-center px-1 pb-1 pt-1 text-center">
                  <span
                    className={cn(
                      "block truncate text-sm font-bold leading-5",
                      inStock ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {inStock
                      ? hasPrice
                        ? displayPrice
                        : t("products.priceOnRequest")
                      : t("products.outOfStock")}
                  </span>
                </div>
              </div>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "right-2 left-auto md:-right-4" : "left-2 right-auto md:-left-4"
        }`}
      >
        {isRTL ? (
          <ArrowRight className="h-4 w-4" />
        ) : (
          <ArrowLeft className="h-4 w-4" />
        )}
        <span className="sr-only">{t("common.previousSlide")}</span>
      </CarouselPrevious>
      <CarouselNext
        className={`z-10 bg-card/95 shadow-md hover:bg-card ${
          isRTL ? "left-2 right-auto md:-left-4" : "right-2 left-auto md:-right-4"
        }`}
      >
        {isRTL ? (
          <ArrowLeft className="h-4 w-4" />
        ) : (
          <ArrowRight className="h-4 w-4" />
        )}
        <span className="sr-only">{t("common.nextSlide")}</span>
      </CarouselNext>
    </Carousel>
  );
}
