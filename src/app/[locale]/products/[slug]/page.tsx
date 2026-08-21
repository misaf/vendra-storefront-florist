import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { ProductDetailClient, getProduct, loadRelatedProducts } from "@/modules/products";
import type { Product } from "@/modules/products";
import { JsonLd } from "@/shared/components/seo/json-ld";
import {
  breadcrumbSchema,
  buildMetadata,
  plainText,
  productSchema,
} from "@/shared/seo";
import { stringifyRichText } from "@/shared/lib/rich-text";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "products" });
  const path = `/products/${slug}`;

  let product: Product | null = null;
  try {
    product = await getProduct(slug, locale);
  } catch {
    // Fall back to generic metadata when the API is unavailable.
  }

  if (product) {
    const description =
      plainText(
        stringifyRichText(product.richDescription ?? product.description)
      ) ||
      t("metadataDescription");
    const images = product.images?.length
      ? product.images
      : product.image
        ? [product.image]
        : undefined;

    return buildMetadata({
      locale,
      path,
      title: product.name,
      description,
      images,
    });
  }

  const productLabel = decodeURIComponent(slug).replace(/-/g, " ");
  return buildMetadata({
    locale,
    path,
    title: `${productLabel} | ${t("metadataTitle")}`,
    description: t("metadataDescription"),
  });
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const t = await getTranslations({ locale, namespace: "products" });

  let initialProduct: Product | null = null;
  let initialError: string | null = null;

  try {
    initialProduct = await getProduct(slug, locale);
  } catch (error) {
    initialError = error instanceof Error ? error.message : "Failed to load product";
  }

  // A product that does not exist is a 404, not a 200 page carrying an error
  // card. The soft 404 let crawlers index every mistyped or retired product URL
  // as a real page, and told the browser the navigation had succeeded.
  // A *failed* request is different — the product may well exist — so that
  // still renders the retryable error state below.
  if (!initialProduct && !initialError) {
    notFound();
  }

  // Kick off the related fetch without awaiting — streamed on the client.
  const relatedProductsPromise = initialProduct
    ? loadRelatedProducts(initialProduct, locale)
    : Promise.resolve<Product[]>([]);

  const structuredData = initialProduct
    ? [
        productSchema(locale, {
          name: initialProduct.name,
          description:
            plainText(
              stringifyRichText(
                initialProduct.richDescription ?? initialProduct.description
              ),
              5000
            ) || undefined,
          image: initialProduct.image,
          images: initialProduct.images,
          price: initialProduct.price,
          sku: initialProduct.token,
          inStock: initialProduct.inStock,
          path: `/products/${slug}`,
        }),
        // Mirrors the trail the page actually draws — localized labels, and the
        // category step the visible breadcrumb includes. Hardcoded English
        // "Home"/"Products" on a Persian page described a trail no visitor saw,
        // which is exactly what Search Console flags as a mismatch.
        breadcrumbSchema(locale, [
          { name: t("breadcrumbHome"), path: "" },
          { name: t("breadcrumbProducts"), path: "/products" },
          ...(initialProduct.category && initialProduct.categorySlug
            ? [
                {
                  name: initialProduct.category,
                  path: `/products?category=${encodeURIComponent(initialProduct.categorySlug)}`,
                },
              ]
            : []),
          { name: initialProduct.name, path: `/products/${slug}` },
        ]),
      ]
    : null;

  return (
    <>
      {structuredData && <JsonLd data={structuredData} />}
      <ProductDetailClient
        initialProduct={initialProduct}
        relatedProductsPromise={relatedProductsPromise}
        initialError={initialError}
      />
    </>
  );
}
