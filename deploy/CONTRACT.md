# Deployment contract: this image ↔ vendra-cp

The production Compose template for a storefront property is **embedded in the
`vendra-cp` Go binary**, at
`vendra-cp/assets/compose/property/docker-compose.yml`. It is not a file
in this repository, and this repository must not ship a competing copy.

This document records what that template passes today, what this image expects,
and where the two disagree. Keep it synchronized with the checked-out sibling
repositories rather than a historical commit snapshot.

## What the controller passes today

```yaml
environment:
  NODE_ENV: production
  STOREFRONT_CONFIG_BASE64: "${STOREFRONT_CONFIG_BASE64:?required}"
  VENDRA_API_URL: "https://api.${BASE_DOMAIN}"
  NODE_EXTRA_CA_CERTS: "${STOREFRONT_CA_FILE:-}"
  VENDRA_STOREFRONT_KEY: "${VENDRA_STOREFRONT_KEY:-}"
  STORAGE_BASE_URL: "${STORAGE_BASE_URL:-}"
  SITE_URL: "${STOREFRONT_SITE_URL:-}"
  NESHAN_SERVICE_KEY: "${NESHAN_SERVICE_KEY:-}"
  CONTACT_*: "${CONTACT_*:-}"
```

Plus, written into each property's `.env` by `property.Render`:
`DOMAIN`, `ROUTER_NAME`, `BASE_DOMAIN`, `STOREFRONT_IMAGE`,
`STOREFRONT_CONFIG_BASE64`, `STOREFRONT_PORT=3000`,
`STOREFRONT_HEALTH_PATH=/api/health`, `CERT_RESOLVER`.

That satisfies the image's two required inputs. A property boots.

## Who generates the configuration

Production: Vendra's console form → `RequestStorefrontDeploymentAction` builds
`{name{en,fa}, businessType, priceCurrency, ogImage, address, contact, social}` →
`ProvisionStorefrontJob` adds `{slug, theme, domain, siteUrl}` and base64-encodes
it → POST to the provisioner.

Manual: `npm run property:config <slug>` in this repo emits the same shape from
`properties/<slug>/`, including message overrides. Laravel's deployment action
also accepts `storefront_messages`, although the Console and Reseller forms do
not currently expose an editor for it.

## Known drifts

### 1. Empty `ogImage` prevents the container from rendering — **breaks**

`RequestStorefrontDeploymentAction` sends `'ogImage' => ''` when the console form
omits a share image. This image's schema lists `ogImage` as required with
`minLength: 1`, and the validator treats `""` as absent, so the container throws
`Invalid STOREFRONT_CONFIG_BASE64: configuration is missing required fields`.

Fixed on this side: `ogImage` is no longer a required field, and an empty value
falls back to `heroImage`, because Laravel deliberately sends `""` rather than
omitting the key. When both values are empty, image metadata is omitted instead
of leaking the bundled example property's photo into another storefront.

### 2. Incomplete configurations were accepted — **fixed in vendra-cp**

`property.Validate` checked only `slug` and `domain`, so a configuration missing
`name`, `businessType`, `priceCurrency`, `address`, `contact` or `social`
rendered happily and then crash-looped the container. The quickstart documented
exactly such a configuration.

It now validates every field the image requires at boot and reports all of the
missing ones by name, so Laravel's POST gets a specific error instead of a
container that never becomes healthy. `ogImage` is deliberately excluded — it is
optional, and the console sends `""`. The quickstart example is corrected.

### 3. Health checks probed `/` — **fixed in vendra-cp**

`property.Render` now writes `STOREFRONT_HEALTH_PATH=/api/health` (exported as
`property.DefaultHealthPath`), the Compose template default matches, and the
property service carries Traefik health-check labels — `path`, `interval=10s`,
`timeout=3s` — so a bad deploy drains at the edge instead of 502-ing.

### 4. `STOREFRONT_THEME` was written and never read — **resolved**

The controller no longer writes it into the property `.env`. A theme is a
property of the *image*: this storefront resolves it at build time via
`scripts/select-property.mjs` → `src/generated/theme.ts`, so a different theme
means a different image — which `--image` already supports per property.

`theme` remains in the configuration and the registry, where it records which
theme family an image belongs to and is checked against the request. Validation
still accepts only `"default"`, the only theme published today; widening that
list is the one change needed when a second one ships.

### 5. Optional inputs had no channel — **resolved**

The property template now passes `STORAGE_BASE_URL`, `NESHAN_SERVICE_KEY`,
`CONTACT_*` and `SITE_URL` (from `STOREFRONT_SITE_URL`), all
defaulting to empty so the configuration still decides.

More importantly, `RequestStorefrontDeploymentAction` now carries
`storefront_messages` into `configuration.messages`, so a property can override
per-locale copy. Without it every storefront rendered the brand-neutral
catalogue identically. Malformed entries are dropped rather than forwarded,
because the image validates the encoded configuration at boot and refuses to
render when it does not parse.

Still not carried: `checkout`, `currency` and `trustSeal`. All optional, and no
console field populates them yet.

### 6. `VENDRA_STOREFRONT_KEY` — **passed, still inert**

The template now passes it, so setting it in a property `.env` reaches the
container. Nothing in Vendra reads `X-Storefront-Key` or `X-Storefront-Domain`
yet, so the credential is sent and ignored. The backend half is the remaining
work — see the tenancy section of the architecture doc.

## Proposed additions to the controller template

All of the previously proposed additions have landed: the optional environment
passthroughs, the Traefik health-check labels on `/api/health`, and the
`www-redirect@file,security-headers@file,compression@file` middleware chain on
every property router.
