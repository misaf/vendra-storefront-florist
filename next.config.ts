import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
import { hostnameOf, resolveApiUrl, resolveStorageUrl } from "./src/shared/config/env";

const apiUrl = resolveApiUrl();
const apiHostname = hostnameOf(apiUrl ?? undefined, "localhost");
const storageHostname = hostnameOf(resolveStorageUrl() ?? undefined, "localhost");
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
