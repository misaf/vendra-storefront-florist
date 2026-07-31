import Jsona from "jsona";
import { getApiBaseUrl, getSiteUrl } from "@/shared/lib/config";
import type { JsonApiLinks, JsonApiMeta } from "@/shared/api/types";
import {
  JSON_API_HEADERS,
  getAcceptLanguageHeader,
} from "@/shared/lib/network";
import { routing } from "@/shared/i18n/routing";

const API_BASE_URL = getApiBaseUrl();
const dataFormatter = new Jsona();
type AuthTokenProvider = () => string | null | undefined;
let authTokenProvider: AuthTokenProvider | null = null;
let staticAuthToken: string | null = null;

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
  authToken?: string | null;
  body?: unknown;
  headers?: HeadersInit;
  locale?: string;
  next?: {
    revalidate?: number | false;
    tags?: string[];
  };
  query?: QueryParams;
  timeout?: number;
}

export function setApiAuthToken(token: string | null) {
  staticAuthToken = token;
}

export function setApiAuthTokenProvider(provider: AuthTokenProvider | null) {
  authTokenProvider = provider;
}

export function clearApiAuthToken() {
  staticAuthToken = null;
  authTokenProvider = null;
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
  useSameOriginProxy = false
): string {
  const normalizedPath = path.replace(/^\/+/, "");
  const queryString = createQueryString(query);

  const baseUrl = useSameOriginProxy
    ? `/api/proxy/${normalizedPath}`
    : `${API_BASE_URL}/${normalizedPath}`;

  return queryString ? `${baseUrl}?${queryString}` : baseUrl;
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
  token,
}: {
  headers?: HeadersInit;
  locale?: string;
  token?: string | null;
}): Headers {
  const requestHeaders = new Headers(JSON_API_HEADERS);
  const acceptLanguage = getAcceptLanguageHeader(locale ?? getBrowserLocale());

  if (acceptLanguage) {
    requestHeaders.set("Accept-Language", acceptLanguage);
  }

  // The canonical API serves every property from one host and picks the tenant
  // from the request origin. A browser sets Origin itself; a server-side render
  // has none, so the storefront states its own public origin.
  if (typeof window === "undefined") {
    requestHeaders.set("Origin", getSiteUrl());
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

async function apiRequest<TData>(
  method: string,
  path: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<TData>> {
  const {
    authToken,
    body,
    headers,
    locale,
    query,
    timeout = 30000,
    ...init
  } = options;
  const controller = new AbortController();
  const timeoutId =
    timeout > 0 ? setTimeout(() => controller.abort(), timeout) : null;
  const useSameOriginProxy = typeof window !== "undefined" && method === "GET";
  const url = getApiUrl(path, query, useSameOriginProxy);
  const token = authToken ?? authTokenProvider?.() ?? staticAuthToken;

  try {
    const response = await fetch(url, {
      ...init,
      method,
      headers: createRequestHeaders({ headers, locale, token }),
      body: body === undefined ? undefined : JSON.stringify(body),
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

export const apiClient = {
  get<TData>(path: string, options?: ApiRequestOptions) {
    return apiRequest<TData>("GET", path, options);
  },
  post<TData>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiRequest<TData>("POST", path, { ...options, body });
  },
  patch<TData>(path: string, body?: unknown, options?: ApiRequestOptions) {
    return apiRequest<TData>("PATCH", path, { ...options, body });
  },
  delete<TData>(path: string, options?: ApiRequestOptions) {
    return apiRequest<TData>("DELETE", path, options);
  },
};
