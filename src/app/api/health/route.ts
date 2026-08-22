import { NextResponse } from "next/server";
import { getStorefrontConfig } from "@/shared/config/storefront";

export function GET() {
  // Read and validate runtime configuration as part of readiness. A process-only
  // check can report healthy while every storefront page fails to render.
  getStorefrontConfig();

  return NextResponse.json({ status: "ok" });
}
