import { NextRequest, NextResponse } from "next/server";
import { searchCatalogProducts } from "@/modules/products/server";
import { routing } from "@/shared/i18n/routing";

function positiveInteger(value: string | null, fallback: number, maximum: number) {
  const parsed = Number.parseInt(value ?? "", 10);

  if (!Number.isFinite(parsed) || parsed < 1) return fallback;
  return Math.min(parsed, maximum);
}

/** A price bound off the query string, or nothing when it is not a real one. */
function priceBound(value: string | null) {
  if (value == null || value === "") return undefined;
  const parsed = Number.parseFloat(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return parsed;
}

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("query")?.trim() ?? "";
  const requestedLocale = request.nextUrl.searchParams.get("locale") ?? "fa";
  const locale = (routing.locales as readonly string[]).includes(requestedLocale)
    ? requestedLocale
    : routing.defaultLocale;
  const inStockParam = request.nextUrl.searchParams.get("inStock");
  const inStock =
    inStockParam === "1" || inStockParam === "true"
      ? true
      : inStockParam === "0" || inStockParam === "false"
        ? false
        : undefined;

  if (query.length < 2) {
    return NextResponse.json(
      { error: "Search query must contain at least two characters." },
      { status: 400 }
    );
  }

  const result = await searchCatalogProducts({
    search: query,
    locale,
    category: request.nextUrl.searchParams.get("category") || undefined,
    inStock,
    sort: request.nextUrl.searchParams.get("sort") || undefined,
    minPrice: priceBound(request.nextUrl.searchParams.get("minPrice")),
    maxPrice: priceBound(request.nextUrl.searchParams.get("maxPrice")),
    page: positiveInteger(request.nextUrl.searchParams.get("page"), 1, 100),
    perPage: positiveInteger(
      request.nextUrl.searchParams.get("perPage"),
      12,
      48
    ),
  });

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "private, max-age=30",
    },
  });
}
