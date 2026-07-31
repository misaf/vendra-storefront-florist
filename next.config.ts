import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const getHostname = (url: string | undefined, fallback: string): string => {
  if (!url) return fallback;
  try {
    return new URL(url).hostname;
  } catch {
    return fallback;
  }
};

// Mirrors the precedence in src/shared/lib/config.ts. Kept in sync by hand:
// next.config runs before the app's module graph exists.
const apiUrl =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.VENDRA_API_URL ||
  process.env.NEXT_PUBLIC_VENDRA_API_URL;

const apiHostname = getHostname(apiUrl, "localhost");
const storageHostname = getHostname(
  process.env.STORAGE_BASE_URL || process.env.NEXT_PUBLIC_STORAGE_BASE_URL || apiUrl,
  "localhost"
);
const imageHostnames = Array.from(new Set([apiHostname, storageHostname]));

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    qualities: [75, 95],
    remotePatterns: imageHostnames.flatMap((hostname) => [
      {
        protocol: "https" as const,
        hostname,
        pathname: "/storage/**",
      },
      {
        protocol: "http" as const,
        hostname,
        pathname: "/storage/**",
      },
    ]),
  },
};

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

export default withNextIntl(nextConfig);
