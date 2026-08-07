# Deploying a storefront property

One published image serves every property in the Vendra fleet. A property is not
baked into the image — it arrives as environment at container start.

Deployment is owned by **`vendra-controller`**, a Go control plane shipping two
binaries: the `vendra` host CLI and a `provisioner` HTTP service that Vendra's
console drives. The production Compose template lives *inside* that binary, at
`vendra-controller/assets/compose/property/docker-compose.yml`.

- **How the two sides differ today** — `deploy/CONTRACT.md`. Read it before
  changing any environment variable here; several drifts are open.
- **Onboarding commands** — the README's deployment walkthrough.

`bin/stack`, the `properties.yml` registry and `property sync` **did** exist, in
the `vendra` repo, until commit `58d71bbc` (2026-08-01) moved host orchestration
out to `vendra-controller`. The registry and `sync` have since been rebuilt in the
controller (`vendra property ls` / `sync`); `bin/stack` is replaced by the
`vendra` CLI.

## The environment contract

### Required

| Variable | What it is |
| --- | --- |
| `VENDRA_API_URL` | The canonical API, e.g. `https://api.<BASE_DOMAIN>`. One host for the whole fleet. The `/api` suffix is optional — it is appended if missing. |
| `STOREFRONT_CONFIG_BASE64` | The property's entire configuration as base64 JSON: brand, domain, contacts, social, checkout, and per-locale message overrides. Generate with `npm run property:config <slug>`. |

Without a valid `STOREFRONT_CONFIG_BASE64`, `/api/health` fails and the
production deployment never becomes ready. That is deliberate: falling back
would silently serve whichever property was bundled at build time — another
tenant's brand, under this tenant's domain.

### Not yet consumed by the backend

| Variable | What it is |
| --- | --- |
| `VENDRA_STOREFRONT_KEY` | This storefront's credential for the canonical API. Server-side only. |
| `VENDRA_STOREFRONT_KEY_HEADER` | Header it travels in. Defaults to `X-Storefront-Key`. |

Every property calls one API host, so the request `Host` no longer identifies the
tenant, and neither `Origin` nor `X-Storefront-Domain` may be trusted on its own.
This is intended to be the server-validated channel tenant identity comes from.
**Nothing in Vendra reads these headers yet**, and the controller's template does
not set the variable, so today the credential header is simply omitted. The value
is deliberately opaque — an API key, an HMAC token or a JWT all work, so
the backend can settle its mechanism without a storefront change.

The storefront sends, on every server-side call and through the same-origin
proxy: `Origin` (the property's canonical origin), `X-Storefront-Domain` (its
registered tenant domain), and the credential header. **The domain is a hint the
backend may act on only after verifying the credential.**

The credential never reaches the browser. Server renders attach it directly;
browser reads go through `/api/proxy/*`, which attaches it server-side.

### Optional

| Variable | Effect when unset |
| --- | --- |
| `STORAGE_BASE_URL` | The API origin is used; it serves `/storage`. |
| `SITE_URL` | The property config's `siteUrl` applies. Set only when serving a property on another domain (staging). The controller maps `STOREFRONT_SITE_URL` to it. |
| `CONTACT_*` | The property config's contact block applies. |
| `NESHAN_SERVICE_KEY` | Reverse geocoding falls back to Nominatim. |

### Build-time only

`NEXT_PUBLIC_*` values are inlined into the client bundle by `next build`, so
setting them at container start has no effect. Only fleet-wide, browser-side
values belong here: `NEXT_PUBLIC_MAP_PROVIDER`, `NEXT_PUBLIC_NESHAN_MAP_KEY`,
`NEXT_PUBLIC_NESHAN_MAP_TYPE`.

There is deliberately **no** public API or storage URL. One would freeze a single
tenant's host into the shared image, and the browser does not need either: reads
go through same-origin `/api/proxy/*` and images through `/api/storage/*`.

> **Constraint.** `next.config.ts` derives `images.remotePatterns` at build time
> from the build's API/storage host. Because images are served through
> `/api/storage/*` (same-origin), this does not bind the image to one tenant —
> but any new `next/image` `src` pointing straight at a per-tenant remote host
> would fail the allowlist. Keep media on the proxy route.

## Onboarding a property

Production runs from Vendra's console; see the README. For a manual deployment:

```bash
# 1. In this repo — emit the property's configuration.
npm run property:config <slug> -- --json > /tmp/<slug>.json

# 2. With the vendra CLI on the host.
sudo vendra property add <slug> <domain> \
  --image ghcr.io/<org>/vendra-storefront-florist@sha256:<digest> \
  --configuration /tmp/<slug>.json \
  --config /etc/vendra/controller.yaml
sudo vendra property up <slug>
```

The controller validates the full set of fields the image requires at boot and
names any that are missing, so an incomplete configuration is rejected before a
container is started. `property:config` generates a valid one.

CORS updates itself: the API's allowlist is derived from active tenant domains
(`StorefrontOrigins`), so a storefront can call the API as soon as its domain is
active.

## Health

The image serves `GET /api/health` and declares a Docker `HEALTHCHECK` against it.

The controller writes `STOREFRONT_HEALTH_PATH=/api/health` and sets matching
Traefik health-check labels, so a bad deploy drains at the edge.

## Verifying an image is tenant-neutral

```bash
# Two configs, one image, no rebuild between them.
docker run --rm -p 3000:3000 \
  -e VENDRA_API_URL=https://api.vendra.test \
  -e STOREFRONT_CONFIG_BASE64="$(npm run -s property:config <slug> -- --raw)" \
  ghcr.io/<org>/vendra-storefront-florist@sha256:<digest>

# The credential must not appear in the client bundle.
grep -r "$VENDRA_STOREFRONT_KEY" .next/static && echo "LEAKED" || echo "clean"
```
