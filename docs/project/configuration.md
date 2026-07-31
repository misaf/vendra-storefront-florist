# Project Configuration

Configuration has two layers:

1. **Property config** — production receives base64-encoded JSON through `STOREFRONT_CONFIG_BASE64`; local development falls back to `properties/<slug>/property.config.json`. It contains brand names per locale, storefront theme, domain, canonical `siteUrl`, contacts, socials, map pin, business type, price currency, and OG image. Code reaches it through `@/shared/property`.
2. **Environment** — deployment-level values only, read through `src/shared/lib/config.ts`.

## Environment variables

- `PROPERTY` — which `properties/<slug>/` to build. Optional while only one exists.
- `STOREFRONT_CONFIG_BASE64` — complete base64-encoded property JSON injected by Vendra's provisioner at container runtime.
- `VENDRA_API_URL` / `NEXT_PUBLIC_VENDRA_API_URL` — the canonical API, e.g. `https://api.vendra.test`. The `/api` segment is appended automatically. `API_BASE_URL` / `NEXT_PUBLIC_API_BASE_URL` are still accepted and take precedence.
- `STORAGE_BASE_URL` / `NEXT_PUBLIC_STORAGE_BASE_URL` — media host. Unset, the API origin is used.
- `NEXT_PUBLIC_SITE_URL` — canonical origin override. Unset, the property's `siteUrl` applies.
- `CONTACT_MOBILE_PHONE`, `CONTACT_OFFICE_PHONE`, `CONTACT_EMAIL`, `CONTACT_HOURS_OPEN`, `CONTACT_HOURS_CLOSE`, `CONTACT_MAP_QUERY` — overrides for the property's contact block.

## Guidelines

- Never hardcode API or storage URLs inside components.
- The shared image currently supports the runtime theme ID `default`.
- Never hardcode a brand name, phone number, handle or domain anywhere in `src/` — those belong to the property config.
- Always use the existing configuration helpers.
- Reuse the project's API clients, queries, mutations, and utilities.
- Local integrated Docker runs copy `.env.traefik.example` to `.env` and use `docker-compose.traefik.yml`. Production deployment configuration is generated and owned by Vendra's `deploy/property-template`; property identity changes do not rebuild the shared image.
