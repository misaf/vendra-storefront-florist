import Jsona from "jsona";
import type { JsonApiLinks, JsonApiMeta } from "@/shared/api/types";
import { createApiRequestHeaders } from "@/shared/lib/network";
import { routing } from "@/shared/i18n/routing";

const dataFormatter = new Jsona();

export interface ApiClientErrorDetails {
  status: number;
  statusText: string;
  body?: unknown;
  url: string;
}

export class ApiClientError extends Error {
  status: number;
  statusText: string;
  body?: unknown;
  url: string;

  constructor({ status, statusText, body, url }: ApiClientErrorDetails) {
    super(`API error: ${status} ${statusText}`);
    this.name = "ApiClientError";
    this.status = status;
    this.statusText = statusText;
    this.body = body;
    this.url = url;
  }
}

export interface JsonApiDocument<TData = unknown> {
  data?: TData;
  meta?: JsonApiMeta;
  links?: JsonApiLinks;
  jsonapi?: {
    version: string;
  };
}

export interface ApiResponse<TData> {
  data: TData;
  meta?: JsonApiMeta;
  links?: JsonApiLinks;
}

export type QueryParams =
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

export interface ApiRequestOptions
  extends Omit<RequestInit, "body" | "headers" | "method"> {
  headers?: HeadersInit;
  locale?: string;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  query?: QueryParams;
  timeout?: number;
}

export interface ApiClient {
  get<TData>(
    path: string,
    options?: ApiRequestOptions
  ): Promise<ApiResponse<TData>>;
}

interface ApiClientConfig {
  /** Absolute for server clients; same-origin (`/api/proxy`) in the browser. */
  baseUrl: string;
  /** Store origin used by Vendra to resolve the tenant. Server clients only. */
  origin?: string;
}

function appendQueryParam(params: URLSearchParams, key: string, value: unknown) {
  if (value === null || value === undefined || value === "") {
    return;
  }

  params.append(key, String(value));
}

export function createQueryString(query?: QueryParams): string {
  if (!query) {
    return "";
  }

  if (query instanceof URLSearchParams) {
    return query.toString();
  }

  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    appendQueryParam(params, key, value);
  }

  return params.toString();
}

export function getApiUrl(
  path: string,
  query?: QueryParams,
  baseUrl = "/api/proxy"
): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const queryString = createQueryString(query);
  const normalizedBaseUrl = baseUrl.replace(/\/+$/, "");
  const url = `${normalizedBaseUrl}/${normalizedPath}`;

  return queryString ? `${url}?${queryString}` : url;
}

async function readResponseBody(response: Response): Promise<unknown> {
  if (response.status === 204) {
    return null;
  }

  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

function deserializeJsonApi<TData>(body: unknown): ApiResponse<TData> {
  const document = body as JsonApiDocument;

  if (!document || typeof document !== "object" || !("data" in document)) {
    return {
      data: body as TData,
    };
  }

  return {
    data: dataFormatter.deserialize(document as Parameters<Jsona["deserialize"]>[0]) as TData,
    meta: document.meta,
    links: document.links,
  };
}

function getBrowserLocale(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const [, locale] = window.location.pathname.split("/");
  return (routing.locales as readonly string[]).includes(locale)
    ? locale
    : undefined;
}

function createRequestHeaders({
  headers,
  locale,
  origin,
}: {
  headers?: HeadersInit;
  locale?: string;
  origin?: string;
}): Headers {
  // The canonical API serves every store from one host, so the request Host no
  // longer identifies the tenant — Vendra resolves it from Origin. A browser
  // sets Origin itself, but to this container's runtime host, which is not the
  // store's registered domain in development; a server render sets none at all.
  // So server-side calls state the store's public origin explicitly, and
  // browser GETs go through the same-origin proxy, which does the same on
  // their behalf.
  return createApiRequestHeaders({
    headers,
    locale: locale ?? getBrowserLocale(),
    origin,
  });
}

/**
 * Read one resource from the canonical API.
 *
 * GET-only, deliberately. The storefront never writes: Vendra owns every
 * mutation, and `/api/proxy` — the hop the browser's reads take — forwards
 * nothing but GETs against a fixed allowlist. A write verb here would be a
 * capability with no caller and no route to travel.
 */
async function apiGet<TData>(
  path: string,
  options: ApiRequestOptions,
  config: ApiClientConfig
): Promise<ApiResponse<TData>> {
  const { headers, locale, query, timeout = 30000, ...init } = options;
  const controller = new AbortController();
  const timeoutId =
    timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;
  const url = getApiUrl(path, query, config.baseUrl);

  try {
    const response = await fetch(url, {
      ...init,
      method: "GET",
      headers: createRequestHeaders({ headers, locale, origin: config.origin }),
      signal: controller.signal,
    });

    const responseBody = await readResponseBody(response);

    if (!response.ok) {
      throw new ApiClientError({
        status: response.status,
        statusText: response.statusText,
        body: responseBody,
        url,
      });
    }

    return deserializeJsonApi<TData>(responseBody);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`);
    }

    throw error instanceof Error
      ? error
      : new Error("Unknown API request error");
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

/**
 * Create a read-only Vendra API client for one transport boundary.
 *
 * Runtime store configuration deliberately does not live in this universal
 * module. Client query code imports it, so importing server configuration here
 * put the development store fixture and environment parsing into the browser
 * bundle. The server factory lives in `server-client.ts`; this module's default
 * stays on the allowlisted same-origin proxy.
 */
export function createApiClient(config: ApiClientConfig): ApiClient {
  return {
    get: <TData>(path: string, options: ApiRequestOptions = {}) =>
      apiGet<TData>(path, options, config),
  };
}

export const apiClient = createApiClient({ baseUrl: "/api/proxy" });
