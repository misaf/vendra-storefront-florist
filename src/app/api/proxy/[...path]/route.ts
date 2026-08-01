import { NextRequest, NextResponse } from "next/server";
import { getApiBaseUrl, getSiteUrl } from "@/shared/lib/config";
import { createApiRequestHeaders, getNetworkErrorStatus } from "@/shared/lib/network";

const API_BASE_URL = getApiBaseUrl();

function createProxyHeaders(request: NextRequest): Headers {
  // The browser's own origin is this storefront's runtime host, which in
  // development is localhost. The canonical API selects the tenant by origin,
  // so the proxy forwards the configured public origin instead. The browser's
  // Accept-Language header is forwarded verbatim.
  const acceptLanguage = request.headers.get("Accept-Language");

  return createApiRequestHeaders({
    origin: getSiteUrl(),
    headers: acceptLanguage ? { "Accept-Language": acceptLanguage } : undefined,
  });
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const path = params?.path?.join("/");

    if (!path) {
      return NextResponse.json(
        { error: "Invalid request parameters" },
        { status: 400 }
      );
    }

    const queryString = request.nextUrl.searchParams.toString();
    const url = `${API_BASE_URL}/${path}${queryString ? `?${queryString}` : ""}`;

    const response = await fetch(url, {
      headers: createProxyHeaders(request),
      cache: "no-store",
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "No error details");
      return NextResponse.json(
        {
          error: `API error: ${response.status} ${response.statusText}`,
          details: errorText,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(await response.json());
  } catch (error) {
    console.error("[Proxy] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const status = error instanceof Error ? getNetworkErrorStatus(error) : 500;

    return NextResponse.json(
      { error: "Failed to proxy request to API", details: errorMessage },
      { status }
    );
  }
}
