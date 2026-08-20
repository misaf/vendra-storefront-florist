import type { Metadata } from "next";
import { getContactInfo, getSiteUrl } from "@/shared/lib/config";
import { getProperty, getPropertyName } from "@/shared/property";
import { routing, type Locale } from "@/shared/i18n/routing";

/** Brand name per locale (used for OG site name, JSON-LD, title templates). */
export const SITE_NAME: Record<Locale, string> = Object.fromEntries(
  routing.locales.map((locale) => [locale, getPropertyName(locale)])
) as Record<Locale, string>;

/**
 * Property social-share image fallback, or `null` when none is configured.
 *
 * Vendra's console sends `ogImage: ""` rather than omitting the key when a
 * property has no share image, so an empty value is a normal input, not a
 * misconfiguration — treat it as "unset" and fall back.
 */
export const DEFAULT_OG_IMAGE =
  getProperty().ogImage?.trim() ||
  getProperty().heroImage?.trim() ||
  null;

/** Currency used in Product JSON-LD offers (ISO 4217). */
export const PRICE_CURRENCY = getProperty().priceCurrency;

const OG_LOCALE: Record<Locale, string> = {
  fa: "fa_IR",
  en: "en_US",
};

function isLocale(value: string): value is Locale {
  return (routing.locales as readonly string[]).includes(value);
}

function siteName(locale: string): string {
  return isLocale(locale) ? SITE_NAME[locale] : SITE_NAME[routing.defaultLocale];
}

function alternateOgLocales(locale: string): string[] {
  const currentLocale = isLocale(locale) ? locale : routing.defaultLocale;
  return routing.locales
    .filter((alternateLocale) => alternateLocale !== currentLocale)
    .map((alternateLocale) => OG_LOCALE[alternateLocale]);
}

/**
 * Strips HTML and collapses whitespace into a clean meta description,
 * truncated to `max` characters with an ellipsis.
 */
export function plainText(input?: string | null, max = 160): string {
  if (!input) return "";
  const text = input
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Absolute URL for a site-root-relative path (defaults to the origin). */
export function absoluteUrl(path = ""): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  // Already absolute (e.g. a CDN image URL) — leave it untouched.
  if (/^https?:\/\//i.test(path)) return path;
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

/**
 * Locale-prefixed, root-relative path. `path` is the locale-less route
 * (e.g. "/products" or "" for the home page).
 */
export function localizedPath(locale: string, path = ""): string {
  const clean = !path || path === "/" ? "" : path.startsWith("/") ? path : `/${path}`;
  return `/${locale}${clean}`;
}

/**
 * Canonical + hreflang alternates for a page. `path` is the locale-less
 * route. Every locale gets an absolute alternate, plus an `x-default`
 * pointing at the default locale.
 */
export function buildAlternates(
  locale: string,
  path = ""
): NonNullable<Metadata["alternates"]> {
  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = absoluteUrl(localizedPath(l, path));
  }
  languages["x-default"] = absoluteUrl(localizedPath(routing.defaultLocale, path));

  return {
    canonical: absoluteUrl(localizedPath(locale, path)),
    languages,
  };
}

export interface BuildMetadataParams {
  locale: string;
  /** Locale-less route, e.g. "/products". Omit/"" for home. */
  path?: string;
  title?: string;
  description?: string;
  /** Absolute or root-relative image URLs. Falls back to the property image. */
  images?: string[];
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  /** When true, asks crawlers not to index this route (cart/checkout/etc.). */
  noIndex?: boolean;
}

/**
 * Builds a complete Metadata object: canonical + hreflang alternates,
 * Open Graph, Twitter card, and optional noindex. Pages keep returning
 * their own translated `title`/`description`; this wires up the rest.
 */
export function buildMetadata({
  locale,
  path = "",
  title,
  description,
  images,
  type = "website",
  publishedTime,
  modifiedTime,
  noIndex = false,
}: BuildMetadataParams): Metadata {
  const previewAlt = title || siteName(locale);
  const previewSources =
    images && images.length > 0
      ? images
      : DEFAULT_OG_IMAGE
        ? [DEFAULT_OG_IMAGE]
        : [];
  const previewImages = previewSources.map((image) => ({
    url: absoluteUrl(image),
    width: 1200,
    height: 630,
    alt: previewAlt,
  }));

  return {
    title,
    description,
    alternates: buildAlternates(locale, path),
    openGraph: {
      type,
      siteName: siteName(locale),
      locale: OG_LOCALE[isLocale(locale) ? locale : routing.defaultLocale],
      alternateLocale: alternateOgLocales(locale),
      url: absoluteUrl(localizedPath(locale, path)),
      title,
      description,
      ...(previewImages.length > 0 ? { images: previewImages } : {}),
      ...(type === "article" ? { publishedTime, modifiedTime } : {}),
    },
    twitter: {
      card: previewImages.length > 0 ? "summary_large_image" : "summary",
      title,
      description,
      ...(previewImages.length > 0 ? { images: previewImages } : {}),
    },
    ...(noIndex
      ? { robots: { index: false, follow: false, googleBot: { index: false, follow: false } } }
      : {}),
  };
}

/* ------------------------------------------------------------------ */
/* JSON-LD structured-data builders                                    */
/* ------------------------------------------------------------------ */

type JsonLd = Record<string, unknown>;

/** Organization / LocalBusiness — emit once site-wide (root layout). */
export function organizationSchema(locale: string): JsonLd {
  const contact = getContactInfo();
  const image = DEFAULT_OG_IMAGE ? absoluteUrl(DEFAULT_OG_IMAGE) : null;

  return {
    "@context": "https://schema.org",
    "@type": getProperty().businessType,
    "@id": `${getSiteUrl()}/#organization`,
    name: siteName(locale),
    url: getSiteUrl(),
    ...(image ? { image, logo: image } : {}),
    telephone: contact.mobilePhone,
    email: contact.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: getProperty().address.locality,
      addressCountry: getProperty().address.country,
    },
    openingHours: `Mo-Su ${contact.hoursOpen}-${contact.hoursClose}`,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: contact.mobilePhone,
        contactType: "sales",
      },
      {
        "@type": "ContactPoint",
        telephone: contact.officePhone,
        contactType: "customer service",
      },
    ],
  };
}

/** WebSite + sitelinks search box — emit once site-wide (root layout). */
export function websiteSchema(locale: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${getSiteUrl()}/#website`,
    name: siteName(locale),
    url: absoluteUrl(localizedPath(locale)),
    inLanguage: locale,
    publisher: { "@id": `${getSiteUrl()}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${absoluteUrl(localizedPath(locale, "/products"))}?search={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

export interface ProductSchemaInput {
  name: string;
  description?: string;
  image?: string;
  images?: string[];
  price?: number;
  sku?: string;
  inStock?: boolean;
  path: string;
}

/** Product rich result with an Offer. */
export function productSchema(locale: string, product: ProductSchemaInput): JsonLd {
  const imageSources = product.images && product.images.length > 0
    ? product.images
    : product.image
      ? [product.image]
      : DEFAULT_OG_IMAGE
        ? [DEFAULT_OG_IMAGE]
        : [];
  const images = imageSources.map((src) => absoluteUrl(src));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { "@type": "Brand", name: siteName(locale) },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(localizedPath(locale, product.path)),
      priceCurrency: PRICE_CURRENCY,
      ...(typeof product.price === "number" && product.price > 0
        ? { price: product.price }
        : {}),
      availability:
        product.inStock === false
          ? "https://schema.org/OutOfStock"
          : "https://schema.org/InStock",
    },
  };
}

export interface ArticleSchemaInput {
  title: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  modifiedAt?: string;
  path: string;
}

/** BlogPosting rich result. */
export function articleSchema(locale: string, article: ArticleSchemaInput): JsonLd {
  const image = article.image || DEFAULT_OG_IMAGE;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.description,
    ...(image ? { image: [absoluteUrl(image)] } : {}),
    inLanguage: locale,
    mainEntityOfPage: absoluteUrl(localizedPath(locale, article.path)),
    ...(article.publishedAt ? { datePublished: article.publishedAt } : {}),
    ...(article.modifiedAt || article.publishedAt
      ? { dateModified: article.modifiedAt || article.publishedAt }
      : {}),
    author: { "@type": "Organization", name: siteName(locale) },
    publisher: { "@id": `${getSiteUrl()}/#organization` },
  };
}

/** Breadcrumb trail. `items` are ordered [{ name, path }] (locale-less paths). */
export function breadcrumbSchema(
  locale: string,
  items: { name: string; path: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(localizedPath(locale, item.path)),
    })),
  };
}

export function faqPageSchema(
  items: { question: string; answer: string }[]
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: plainText(item.answer, 5000),
      },
    })),
  };
}
