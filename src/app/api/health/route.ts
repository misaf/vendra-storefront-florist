import { NextResponse } from "next/server";
import { getProperty } from "@/shared/property";

export function GET() {
  // Read and validate runtime configuration as part of readiness. A process-only
  // check can report healthy while every storefront page fails to render.
  getProperty();

  return NextResponse.json({ status: "ok" });
}
