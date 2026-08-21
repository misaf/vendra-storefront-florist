import { NextRequest, NextResponse } from "next/server";
import {
  getApiBaseUrl,
  getSiteUrl,
  getStorefrontDomain,
  getStorefrontKey,
  getStorefrontKeyHeader,
} from "@/shared/lib/config";
import { createApiRequestHeaders, getNetworkErrorStatus } from "@/shared/lib/network";
import { resolveUpstreamPath } from "@/shared/api/proxy-allowlist";

const API_BASE_URL = getApiBaseUrl();

function createProxyHeaders(request: NextRequest): Headers {
  // The browser's own origin is this storefront's runtime host, which in
  // development is localhost. The canonical API selects the tenant by origin,
  // so the proxy forwards the configured public origin instead. The browser's
  // Accept-Language header is forwarded verbatim.
  //
  // This hop is also where the tenant credential is attached: it keeps the
  // secret server-side while still letting browser reads be credentialed.
  const acceptLanguage = request.headers.get("Accept-Language");
  const authorization = request.headers.get("Authorization");
  const headers = new Headers();

  if (acceptLanguage) headers.set("Accept-Language", acceptLanguage);
  if (authorization) headers.set("Authorization", authorization);

  return createApiRequestHeaders({
    origin: getSiteUrl(),
    storefrontDomain: getStorefrontDomain(),
    storefrontKey: getStorefrontKey(),
    storefrontKeyHeader: getStorefrontKeyHeader(),
    headers,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  const params = await context.params;
  const path = resolveUpstreamPath(params?.path);

  if (!path) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const queryString = request.nextUrl.searchParams.toString();
  const url = `${API_BASE_URL}/${path}${queryString ? `?${queryString}` : ""}`;

  try {
    const response = await fetch(url, {
      headers: createProxyHeaders(request),
      cache: "no-store",
    });

    // The upstream status is the browser's to see — a 404 must stay a 404 so
    // the client can render "not found" rather than a generic failure. The
    // upstream *body* is not: it is written for an internal audience and can
    // carry stack traces, SQL or tenant details, so it is logged and dropped.
    if (!response.ok) {
      const details = await response.text().catch(() => "<unreadable>");
      console.error(
        `[Proxy] ${response.status} ${response.statusText} for ${path}: ${details}`
      );
      return NextResponse.json(
        { error: `Upstream request failed with status ${response.status}` },
        { status: response.status }
      );
    }

    const body = await response.text();

    try {
      return NextResponse.json(JSON.parse(body));
    } catch {
      console.error(`[Proxy] Non-JSON response for ${path}`);
      return NextResponse.json(
        { error: "Upstream returned a malformed response" },
        { status: 502 }
      );
    }
  } catch (error) {
    console.error("[Proxy] Error:", error);
    const status = error instanceof Error ? getNetworkErrorStatus(error) : 500;

    return NextResponse.json(
      { error: "Failed to reach the catalogue API" },
      { status }
    );
  }
}
