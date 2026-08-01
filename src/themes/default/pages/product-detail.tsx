import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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

  let initialProduct: Product | null = null;
  let initialError: string | null = null;

  try {
    initialProduct = await getProduct(slug, locale);
    if (!initialProduct) {
      initialError = "NOT_FOUND";
    }
  } catch (error) {
    initialError = error instanceof Error ? error.message : "Failed to load product";
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
        breadcrumbSchema(locale, [
          { name: "Home", path: "" },
          { name: "Products", path: "/products" },
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
