import { NextResponse } from "next/server";
import { getStorageBaseUrl } from "@/shared/lib/config";
import { getNetworkErrorStatus } from "@/shared/lib/network";

const STORAGE_BASE_URL = getStorageBaseUrl();

function normalizeStoragePath(pathSegments: string[] | undefined): string | null {
  if (!pathSegments || pathSegments.length === 0) {
    return null;
  }

  const segments = [...pathSegments];
  if (segments[0] === "storage") {
    segments.shift();
  }

  const sanitizedSegments: string[] = [];
  for (const segment of segments) {
    if (!segment) continue;

    let decodedSegment = segment;
    try {
      decodedSegment = decodeURIComponent(segment);
    } catch {
      return null;
    }

    const normalizedSegment = decodedSegment.trim();
    if (
      normalizedSegment === "" ||
      normalizedSegment === "." ||
      normalizedSegment === ".." ||
      normalizedSegment.includes("\\")
    ) {
      return null;
    }

    sanitizedSegments.push(normalizedSegment);
  }

  if (sanitizedSegments.length === 0) {
    return null;
  }

  return sanitizedSegments.map((segment) => encodeURIComponent(segment)).join("/");
}

/**
 * Response headers for a proxied asset. Storage paths are content-addressed by
 * uuid, so they stay immutable for a year; the upstream validators are passed
 * through so conditional requests keep working across that window.
 */
function buildResponseHeaders(upstream: Response): Headers {
  const headers = new Headers({
    "Content-Type": upstream.headers.get("content-type") || "image/jpeg",
    "Cache-Control": "public, max-age=31536000, immutable",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET",
  });

  for (const name of ["etag", "last-modified", "content-length"] as const) {
    const value = upstream.headers.get(name);
    if (value) headers.set(name, value);
  }

  return headers;
}

export async function GET(
  request: Request,
  context: { params: Promise<{ path: string[] }> }
) {
  try {
    const params = await context.params;
    const normalizedPath = normalizeStoragePath(params?.path);
    if (!normalizedPath) {
      return NextResponse.json({ error: "Invalid storage path" }, { status: 400 });
    }

    const requestUrl = new URL(request.url);
    const queryString = requestUrl.searchParams.toString();
    const url = `${STORAGE_BASE_URL}/storage/${normalizedPath}${
      queryString ? `?${queryString}` : ""
    }`;

    // Forward the browser's validators so an unchanged image can come back as
    // a bodyless 304 instead of being re-downloaded from storage and re-sent.
    const upstreamHeaders: HeadersInit = { Accept: "image/*" };
    const ifNoneMatch = request.headers.get("if-none-match");
    const ifModifiedSince = request.headers.get("if-modified-since");
    if (ifNoneMatch) upstreamHeaders["If-None-Match"] = ifNoneMatch;
    if (ifModifiedSince) upstreamHeaders["If-Modified-Since"] = ifModifiedSince;

    const response = await fetch(url, {
      headers: upstreamHeaders,
      cache: "default",
    });

    if (response.status === 304) {
      return new NextResponse(null, {
        status: 304,
        headers: buildResponseHeaders(response),
      });
    }

    if (!response.ok) {
      return NextResponse.json(
        { error: `Storage error: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    // Streamed, not buffered: a large photo no longer has to be held in the
    // server's memory in full before any of it reaches the browser.
    return new NextResponse(response.body, {
      status: 200,
      headers: buildResponseHeaders(response),
    });
  } catch (error) {
    // Logged, not returned: a fetch failure message names the upstream storage
    // host, which is internal infrastructure the browser has no business seeing.
    console.error("[Storage Proxy] Error:", error);
    const status = error instanceof Error ? getNetworkErrorStatus(error) : 500;

    return NextResponse.json(
      { error: "Failed to load the requested asset" },
      { status }
    );
  }
}
