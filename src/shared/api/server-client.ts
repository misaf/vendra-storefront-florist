import "server-only";

import { getApiBaseUrl, getSiteUrl } from "@/shared/config";
import { createApiClient } from "@/shared/api/client";

/** Direct runtime Vendra client for Server Components and Route Handlers. */
export const serverApiClient = createApiClient({
  baseUrl: getApiBaseUrl(),
  origin: getSiteUrl(),
});
