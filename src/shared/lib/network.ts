import { routing } from "@/shared/i18n/routing";

export const JSON_API_HEADERS = {
  "Content-Type": "application/vnd.api+json",
  Accept: "application/vnd.api+json",
} as const;

const LOCALE_ACCEPT_LANGUAGE: Partial<Record<string, string>> = {
  fa: "fa-IR,fa;q=0.9,en;q=0.8",
  en: "en-US,en;q=0.9,fa;q=0.8",
};

export function getAcceptLanguageHeader(
  locale: string | null | undefined
): string | undefined {
  if (!locale || !(routing.locales as readonly string[]).includes(locale)) {
    return undefined;
  }

  if (LOCALE_ACCEPT_LANGUAGE[locale]) {
    return LOCALE_ACCEPT_LANGUAGE[locale];
  }

  return locale === routing.defaultLocale
    ? locale
    : `${locale},${routing.defaultLocale};q=0.8`;
}

/**
 * Shared JSON:API request headers. Applies the Accept-Language header, states
 * the storefront's public origin (server-side calls have no browser Origin for
 * the canonical API to resolve the tenant from), and attaches an optional
 * bearer token. Used by the API client and the same-origin proxy route.
 *
 * Two independent identities can ride one request and must not share a header:
 * `token` is the *end user* (Authorization: Bearer), while
 * `storefrontKey`/`storefrontDomain` are the *tenant*. The domain is a hint the
 * backend may only act on after it has verified the key — never on its own.
 */
export function createApiRequestHeaders({
  headers,
  locale,
  origin,
  storefrontDomain,
  storefrontKey,
  storefrontKeyHeader,
  token,
}: {
  headers?: HeadersInit;
  locale?: string;
  origin?: string;
  storefrontDomain?: string | null;
  storefrontKey?: string | null;
  storefrontKeyHeader?: string;
  token?: string | null;
}): Headers {
  const requestHeaders = new Headers(JSON_API_HEADERS);
  const acceptLanguage = getAcceptLanguageHeader(locale);

  if (acceptLanguage) {
    requestHeaders.set("Accept-Language", acceptLanguage);
  }

  if (origin) {
    requestHeaders.set("Origin", origin);
  }

  if (storefrontKey) {
    requestHeaders.set(storefrontKeyHeader || "X-Storefront-Key", storefrontKey);
  }

  if (storefrontDomain) {
    requestHeaders.set("X-Storefront-Domain", storefrontDomain);
  }

  if (token) {
    requestHeaders.set("Authorization", `Bearer ${token}`);
  }

  if (headers) {
    new Headers(headers).forEach((value, key) => {
      requestHeaders.set(key, value);
    });
  }

  return requestHeaders;
}

export function getNetworkErrorStatus(error: Error): number {
  const message = error.message.toLowerCase();

  if (
    message.includes("certificate") ||
    message.includes("ssl") ||
    message.includes("tls") ||
    message.includes("enotfound") ||
    message.includes("getaddrinfo") ||
    message.includes("econnrefused") ||
    message.includes("connection refused")
  ) {
    return 502;
  }

  return 500;
}
