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
    qualities: [75, 85, 95],
    /**
     * Only reachable when the storage origin happens to be known at build time.
     * The shipped image takes its API/storage origin as a *runtime* input (see
     * README, "Build and publish the shared image"), so in the fleet build these
     * resolve to `localhost` and match nothing — which is why catalogue images
     * are requested through the same-origin `/api/storage/**` proxy with
     * `unoptimized` rather than through `/_next/image`. The optimizer resolves
     * relative URLs from disk, so a route handler can never be a local source,
     * and an absolute upstream URL cannot be formed in the browser without
     * baking the origin in at build time. Local `public/` art (hero, OG, the
     * placeholders) is unaffected and is optimized normally.
     */
    remotePatterns: imageHostnames.flatMap((hostname) => [
      {
        protocol: "https" as const,
        hostname,
        port: "",
        pathname: "/storage/**",
        search: "",
      },
      {
        protocol: "http" as const,
        hostname,
        port: "",
        pathname: "/storage/**",
        search: "",
      },
    ]),
  },
};

const withNextIntl = createNextIntlPlugin("./src/shared/i18n/request.ts");

export default withNextIntl(nextConfig);
