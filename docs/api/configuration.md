# API Configuration

API endpoints are configured centrally in `src/shared/lib/config.ts`. Use the helpers (`getApiBaseUrl`, `getStorageBaseUrl`, `getSiteUrl`) instead of hardcoded values.

The storefront talks to **one** canonical Vendra API, never to its own domain:

```env
VENDRA_API_URL=https://api.vendra.test
NEXT_PUBLIC_VENDRA_API_URL=https://api.vendra.test
```

The `/api` segment is appended automatically, so either form works. `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` are still honoured and take precedence. `STORAGE_BASE_URL` / `NEXT_PUBLIC_STORAGE_BASE_URL` default to the API origin.

## Tenant resolution

That single host serves every property, so the API resolves the tenant from the request **origin**, matched against active tenant domains:

- Server-rendered calls set `Origin` to the property's `siteUrl` explicitly (a server fetch has no browser-set origin).
- Browser calls go through the same-origin `/api/proxy` route, which forwards the same value rather than the browser's own origin.

A storefront whose domain is not registered and active in Vendra gets **404** on every API call.

Never hardcode API or storage URLs inside components, hooks, or utilities.
