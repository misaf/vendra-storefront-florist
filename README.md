# Vendra Storefront Florist

A bilingual (EN/FA) florist storefront template for Vendra properties, built with Next.js 16 and React 19. **One codebase, one image per property.**

Nothing in `src/` names a property. Everything that identifies a storefront — brand, contacts, socials, canonical origin, business type — lives in `properties/<slug>/`, and the build selects one.

## Properties

```
properties/
└── houshang-flowers/            # the bundled example property
    ├── property.config.json     # brand, theme, domain, contacts, socials, map, JSON-LD
    └── messages/
        ├── en.json              # overrides merged over messages/en.json
        └── fa.json
```

`scripts/select-property.mjs` validates the chosen config and generates static property and theme adapters under `src/generated/`. It runs automatically before `dev`, `build` and `typecheck`.

Select a property with `PROPERTY=<slug>`; with only one directory under `properties/`, it is optional.

### Adding a property

1. `cp -r properties/houshang-flowers properties/<slug>` and edit `property.config.json` — `slug` must match the directory name.
2. In `messages/`, restate only the strings that carry the brand. The base catalogue is deliberately brand-neutral; anything not overridden falls through to it.
3. Register `domain` as an **active tenant domain** in Vendra. The canonical API resolves the tenant from this storefront's origin, so an unregistered domain gets 404 on every call.
4. Build its image: `PROPERTY=<slug> npm run build`.

## Storefront themes

Each property selects a build-time storefront implementation with `"theme": "default"` in `property.config.json`. The bundled current design lives at `src/themes/default/` and is the starter theme.

To add another theme:

1. Create `src/themes/<theme-id>/index.ts` with the same named route exports as `src/themes/default/index.ts`.
2. Reuse feature modules for API access, state, and shared behavior; keep theme-specific page composition in the theme directory.
3. Set the property's `theme` to `<theme-id>` and run `PROPERTY=<slug> npm run property`.

Theme selection is compiled into each property image. It is intentionally not a runtime toggle and is separate from the visitor's light/dark color preference.

## Quick Start

```bash
npm install
npm run dev            # PROPERTY from .env, or the only property present
```

Open `http://localhost:3000`.

### Environment files

- `.env.local` is for `npm run dev` overrides and local secrets. Next.js loads
  it automatically; never commit it.
- `.env` is for this repository's Docker Compose build, Traefik router, and
  container environment. Create it from `.env.traefik.example`; never
  commit it.
- `.env.traefik.example` documents this repository's local integrated Docker
  variables and contains no real credentials. Production environment files are
  generated and owned by Vendra's `deploy/property-template`.
- Property defaults belong in `properties/<slug>/property.config.json`.
  `CONTACT_*` variables are optional deployment overrides.
- `NEXT_PUBLIC_*` values are compiled into the browser bundle. Rebuild the
  image after changing one. Never put a secret in a `NEXT_PUBLIC_*` variable.

Use `NEXT_PUBLIC_MAP_PROVIDER=osm` without keys, or set it to `neshan` and
provide both `NEXT_PUBLIC_NESHAN_MAP_KEY` (browser-visible) and
`NESHAN_SERVICE_KEY` (server-only).

## Available Scripts

- `npm run dev` — Start local development server
- `npm run build` — Create production build
- `npm run start` — Run production server
- `npm run property` — Regenerate the selected property and theme adapters
- `npm run lint` — Run ESLint
- `npm run typecheck` — Run TypeScript without emitting files
- `npm run check` — Run lint, typecheck, and production build

## API

The storefront talks to **one** canonical Vendra API (`VENDRA_API_URL`, e.g. `https://api.vendra.test`) — never to its own domain. Because that host serves every property, the tenant is resolved from the request origin:

- Server-rendered calls send the property's `siteUrl` as `Origin` explicitly.
- Browser calls go through the same-origin `/api/proxy` route, which forwards the same value.

The `/api` path segment is appended automatically, so `VENDRA_API_URL` may be given with or without it.

## Integrated Docker development with Vendra Traefik

The storefront container does not publish a host port or run its own reverse
proxy. Vendra's single Traefik instance terminates TLS and discovers this
container over the external `traefik-public` network.

```bash
# From the sibling Vendra repository, start Traefik and the backend.
cd ../vendra
bin/stack up --build
bin/stack hosts --write

# Return here and start this locally built storefront behind that Traefik.
cd ../vendra-storefront-florist
cp .env.traefik.example .env
# Edit PROPERTY, DOMAIN, ROUTER_NAME, VENDRA_API_URL and optional integrations.
docker compose -f docker-compose.traefik.yml up -d --build
```

Open `https://<DOMAIN>/en`.

- `PROPERTY` and every `NEXT_PUBLIC_*` value are baked at image build time. Rebuild after changing them.
- Server-side values (`VENDRA_API_URL`, `CONTACT_*`) are read from the container environment at runtime; unset, the property config applies.
- In production a property is deployed only from Vendra's `deploy/property-template` with a prebuilt image pinned by digest. This repository's Compose file is local integration tooling, not a second production definition.
- Both Docker and Traefik health checks use `/api/health`; it verifies the storefront process, not backend API availability.
- Vendra owns Traefik, ports `80/443`, TLS certificates, security headers, compression, and `www` redirects.

Useful commands:

```bash
docker compose -f docker-compose.traefik.yml ps
docker compose -f docker-compose.traefik.yml logs -f app
docker compose -f docker-compose.traefik.yml up -d --build
docker compose -f docker-compose.traefik.yml stop
docker compose -f docker-compose.traefik.yml down
```

## End-to-end property deployment

A property needs two registrations: a backend tenant in Vendra and a
domain-routed container using the shared storefront image. Use the same slug
and domain in both systems.

### Automated creation from Vendra panels

Vendra's Console property form can optionally request this storefront; its
Reseller property form requires it. Both collect the complete property config
and persist a deployment request. Configure Vendra's queue-facing provisioner:

```dotenv
STOREFRONT_PROVISIONER_URL=http://provisioner:8080/storefronts
STOREFRONT_PROVISIONER_TOKEN=replace-with-a-secret-token
STOREFRONT_IMAGE=ghcr.io/misaf/vendra-storefront-florist:1.x
STOREFRONT_THEMES=default
```

The provisioner accepts the documented JSON request, starts a new container
from the shared image, injects the property's runtime configuration, registers
its domain router, and returns `status`, `reference`, and `image_digest`. Until
both URL and token are configured, Vendra safely keeps
the request in `pending`; it never runs Docker or shell commands in the web
process. See Vendra's `deploy/README.md` for the provider contract and status
lifecycle.

The examples below use:

```text
slug:   houshang-flowers
domain: houshang-flowers.com
image:  ghcr.io/<organization>/houshang-flowers-storefront:<version>
```

### 1. Prepare and verify the property

From this repository:

```bash
cp -r properties/houshang-flowers properties/<slug>
# Edit properties/<slug>/property.config.json and its message overrides.

PROPERTY=<slug> npm run property
PROPERTY=<slug> npm run check
```

The config's `slug` must match its directory, its `domain` and `siteUrl` must
match the intended public storefront, and its `theme` must exist under
`src/themes/`.

### 2. Build and publish one image for the property

The canonical API and all `NEXT_PUBLIC_*` values are build-time inputs:

```bash
docker build \
  --build-arg PROPERTY=<slug> \
  --build-arg VENDRA_API_URL=https://api.<vendra-base-domain> \
  --build-arg NEXT_PUBLIC_VENDRA_API_URL=https://api.<vendra-base-domain> \
  -t ghcr.io/<organization>/<slug>-storefront:<version> .

docker push ghcr.io/<organization>/<slug>-storefront:<version>
```

Pass additional build arguments when used: `NEXT_PUBLIC_SITE_URL`,
`STORAGE_BASE_URL`, `NEXT_PUBLIC_STORAGE_BASE_URL`,
`NEXT_PUBLIC_MAP_PROVIDER`, `NEXT_PUBLIC_NESHAN_MAP_KEY`, and
`NEXT_PUBLIC_NESHAN_MAP_TYPE`. In production, deploy the pushed image by digest
instead of a moving tag.

### 3. Provision the backend property

From the Vendra repository, start the platform and create the tenant with the
same public domain:

```bash
cd ../vendra
bin/stack up --build

php artisan vendra-subscription:provision \
  "<Property name>" \
  <domain> \
  <owner-username> \
  <owner-email> \
  --reseller=<reseller-id-or-slug> \
  --plan=<plan>
```

The domain must be active in Vendra. Otherwise every storefront API request is
rejected because Vendra cannot resolve the tenant from the request origin.

### 4. Register and start the storefront in Vendra

```bash
cd ../vendra

bin/stack property add \
  <slug> \
  <domain> \
  ghcr.io/<organization>/<slug>-storefront@sha256:<digest>

# Local development only: resolve the property domain and extend local TLS.
bin/stack hosts --write

bin/stack property up <slug>
bin/stack property ls
bin/stack status
```

`property add` records the property in `deploy/properties.yml`. Commit that
file; it is Vendra's durable storefront fleet registry. Generated
`deploy/properties/<slug>/` directories and their `.env` files are intentionally
not committed.

For a public deployment, point the domain's DNS A/AAAA records at the server
running Vendra Traefik and set `CERT_RESOLVER=letsencrypt` in the generated
property deployment `.env`. Keep it empty for local `.test` development.

### 5. Verify end to end

```bash
cd ../vendra
bin/stack ps
bin/stack status
bin/stack logs <slug>

curl -kI https://<domain>/en
curl -k https://api.<vendra-base-domain>/up
```

Then verify `/en`, `/fa`, products, blog, FAQ, contact, cart, and checkout in
both light and dark modes. A storefront page can load while API calls fail, so
confirm that API-backed products or FAQs render for the correct tenant.

### Updating, recovering, and removing properties

```bash
cd ../vendra

# After publishing a new digest, update both deploy/properties.yml and the
# generated deploy/properties/<slug>/.env, then:
bin/stack property restart <slug>

# Recreate missing generated property deployment directories from the registry:
bin/stack property sync

# Stop one property without removing its registration:
bin/stack property down <slug>

# Remove its deployment and registry entry (destructive; confirm intentionally):
bin/stack property rm <slug>
```

Backend tenant deletion is a separate Vendra data operation and is not implied
by removing the storefront deployment.

## Project Notes

- App routes are locale-first: `/{locale}/...`
- Base translation messages live in `messages/en.json` and `messages/fa.json`; per-property overrides in `properties/<slug>/messages/`
- Application source lives under `src/`, with feature code in `src/modules/` and shared infrastructure in `src/shared/`
- Image hosts are configured in `next.config.ts` from the API and storage environment variables

## Tech Stack

- Next.js 16.2
- React 19.2
- TypeScript
- Tailwind CSS 4
- Radix UI + shadcn/ui components
