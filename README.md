# Vendra Storefront Florist

> **Ecosystem documentation:** <https://misaf.github.io/vendra-ecosystem-docs>
>
> Store provisioning, the runtime environment contract, and deployment are
> documented there. This README covers the application itself.

A bilingual (EN/FA) florist storefront for Vendra, built with Next.js 16 and
React 19.

**One template. One image. Many stores.** This repository builds a single
storefront design. Vendra runs one container per store from that shared image
and hands each container its store's configuration at startup. Nothing in `src/`
names a store, and no build step selects one.

If Vendra ever needs a fundamentally different storefront design, it belongs in
its own repository and its own image — not as a second theme in here.

```text
Vendra
  └─ provisions a container per store
       └─ vendra-storefront-florist image  (identical for every store)
            └─ STOREFRONT_CONFIG_BASE64    (this store's identity)
                 └─ Vendra APIs            (catalogue, content, business data)
```

## Store configuration

A container is told which store it serves through one environment variable:

- **`STOREFRONT_CONFIG_BASE64`** — base64-encoded JSON: brand name per locale,
  domain, canonical origin, contacts, socials, currency, artwork, optional
  message overrides. Validated against `config/storefront.schema.json` on boot.
- **`VENDRA_API_URL`** — the canonical Vendra API, as an origin
  (`https://api.example.com`) or with the `/api` suffix. Either form works.
- **`VENDRA_STOREFRONT_KEY`** — optional opaque credential sent to the API as
  `X-Storefront-Key`. Server-side only; it must never have a `NEXT_PUBLIC_`
  variant.

Vendra renders `STOREFRONT_CONFIG_BASE64` itself when it provisions a store.
`scripts/storefront-config.mjs` is the manual equivalent:

```bash
npm run storefront:config -- path/to/store.json          # STOREFRONT_CONFIG_BASE64=…
npm run storefront:config -- path/to/store.json --raw    # the base64 only
npm run storefront:config -- path/to/store.json --json   # validated JSON, pretty
```

It validates against the same schema the container applies on boot, so a config
that fails here would have failed there.

**A production container with no `STOREFRONT_CONFIG_BASE64` refuses to serve.**
That is deliberate: silently falling back would serve the development fixture's
brand under a real store's domain.

## Standalone development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. There is no property to select and no generation
step — `npm run dev` is the whole setup.

Configuration resolves in one order, in both development and production:

| Source | When | Contains |
| --- | --- | --- |
| `STOREFRONT_CONFIG_BASE64` | whenever set | the real store |
| `config/storefront.development.json` | development only | neutral placeholder |

`config/storefront.development.json` exists so a fresh clone runs. It holds
deliberately fake identity — no real store's name, phone, socials or trust seal
— because it is the one config document compiled into the shared image, and the
image must carry no store's identity. It is a fixture, not a store registry:
adding a second file to it is not how a second store is served.

To develop against a real Vendra tenant, put its config in `.env.local` using
the same mechanism production uses:

```bash
npm run storefront:config -- path/to/store.json >> .env.local
```

Local dev then exercises the production code path rather than a parallel one.

### Environment files

- `.env.local` — local development overrides and secrets. Loaded automatically
  by Next.js; never committed.
- `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time.
  Because one image serves every store, no store-specific value may ever be a
  `NEXT_PUBLIC_*` variable — the API, storage and site origins are read from
  server-only names for exactly this reason, and a test enforces it. Rebuild the
  image after changing a public value, and never put a secret in one.

Use `NEXT_PUBLIC_MAP_PROVIDER=osm` without keys, or set it to `neshan` and
provide both `NEXT_PUBLIC_NESHAN_MAP_KEY` (browser-visible) and
`NESHAN_SERVICE_KEY` (server-only).

## Structure

```text
config/          storefront schema + the development fixture
messages/        brand-neutral base catalogue (en, fa)
src/app/         routes, layouts, and the API routes the browser talks to
src/modules/     feature modules (products, cart, blog, checkout, …)
src/shared/      API client, UI primitives, i18n, store configuration
```

Pages live in their route files, the ordinary Next.js way. Feature modules own
data access, state and components, and expose them through a barrel
(`@/modules/products`); ESLint blocks reaching into module internals from
outside. `src/shared/property/` resolves and validates the store configuration.

## API

The storefront talks to **one** canonical Vendra API — never to its own domain.
Because that host serves every store, the request `Host` cannot identify the
tenant, so the storefront states its identity explicitly:

- Server-rendered calls send the store's `siteUrl` as `Origin`, its registered
  `domain` as `X-Storefront-Domain`, and — when `VENDRA_STOREFRONT_KEY` is set —
  the credential in `X-Storefront-Key`.
- Browser reads go through the same-origin `/api/proxy` route, which attaches
  all three server-side so the credential never reaches the client bundle. That
  proxy forwards only an explicit allowlist of catalogue and content endpoints,
  because anything it forwards is requested as this storefront.
- Catalogue images are served through `/api/storage`, same-origin, for the same
  reason: the upstream storage origin is a runtime input and must not be baked
  into the browser bundle.

Vendra remains the source of truth for catalogue, content and business data.
None of it is duplicated in this repository.

**The backend does not read the tenant headers yet.** Tenant scoping for
storefront API calls is still an open gap; the transport is in place waiting
for it.

## Available scripts

- `npm run dev` — start the local development server
- `npm run build` — production build
- `npm run start` — run the production server
- `npm test` — unit tests (`node:test`, no test-framework dependency)
- `npm run lint` / `npm run lint:strict` — ESLint (strict fails on warnings)
- `npm run typecheck` — TypeScript, no emit
- `npm run check` — lint, typecheck, test, and build
- `npm run check:strict` — strict lint, typecheck, and test
- `npm run storefront:config` — encode a store config for a container

CI runs `check:strict` and will not publish an image unless it passes.

### Tests

Tests live beside the code as `*.test.ts` and run on Node's built-in runner —
no Jest or Vitest, and no new dependency. They cover the pure rules where a
regression would be quiet and expensive: the storefront config schema check
(including that the development fixture still satisfies it), the `/api/proxy`
allowlist, the message merge, and environment resolution.

## Container

```bash
docker build -t ghcr.io/<organization>/vendra-storefront-florist:<version> .
docker push ghcr.io/<organization>/vendra-storefront-florist:<version>
```

Only fleet-wide browser settings belong in build arguments
(`NEXT_PUBLIC_MAP_PROVIDER`, `NEXT_PUBLIC_NESHAN_MAP_KEY`,
`NEXT_PUBLIC_NESHAN_MAP_TYPE`). Store identity, the API origin and credentials
are runtime inputs. In production, deploy by digest rather than a moving tag.

The image health-checks `/api/health`.

## Adding a store

A store needs a backend tenant in Vendra and a domain-routed container from this
image. Both are Vendra operations — nothing in this repository changes:

1. Provision the tenant in Vendra and register its domain as active. The
   canonical API resolves the tenant from the storefront's origin, so an
   unregistered domain gets 404 on every call.
2. Provision the storefront container with `STOREFRONT_CONFIG_BASE64` and
   `VENDRA_API_URL` set for that store.
3. Verify `/en` and `/fa`, products, blog, FAQ, contact, cart and checkout in
   both light and dark modes. A page can render while API calls fail, so
   confirm that API-backed products and FAQs load for the correct tenant.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript
- Tailwind CSS 4 · Radix UI + shadcn/ui
- next-intl (EN/FA, RTL) · TanStack Query
