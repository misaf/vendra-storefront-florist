# Project Structure

## App Router

`src/app/[locale]/`

Locale-prefixed route segments, layouts, loading states, errors, and thin route
files. Route files should handle routing conventions, metadata exports, and
composition only. User-facing UI, data loading helpers, and feature logic live
in `src/modules/<feature>/`.

Current routes:

- `/` — homepage.
- `/products` and `/products/[slug]` — product listing and product detail.
- `/blog` and `/blog/[slug]` — blog listing and blog post detail.
- `/faq` — FAQ listing.
- `/about` — about-us page.
- `/contact` — contact page.
- `/checkout` and `/checkout/success` — demo checkout flow and confirmation.

`src/app/api/`

Route handlers used as same-origin proxies:

- `src/app/api/proxy/[...path]/route.ts` — proxies JSON:API requests to the backend.
- `src/app/api/storage/[...path]/route.ts` — proxies backend storage/media.

## Feature Modules

`src/modules/<feature>/`

Each major feature owns its UI, hooks, API/resource logic, and types:

```text
src/modules/<feature>/
  components/
  hooks/
  lib/
  types.ts
  index.ts
```

`index.ts` is the public entry point. Code outside a module should import from
`@/modules/<feature>` instead of reaching into `components/`, `hooks/`, `lib/`,
or `types.ts`. Relative imports are fine within the same module.

Current modules:

- `home` — storefront composition, hero, and initial homepage loading.
- `products` — products, categories, product listing/detail UI, and product API mapping.
- `blog` — blog listing/detail UI, blog cards/sections, and blog API mapping.
- `faq` — FAQ page UI and FAQ API mapping.
- `contact` — contact page and inquiry form UI.
- `about` — about-us page.
- `checkout` — demo checkout and success screen.
- `cart` — cart drawer/button and local cart state.
- `account` — user panel, favorites state, and local order history.
- `navigation` — header, footer, language/theme controls, and global search.
- `newsletter` — newsletter signup UI.

Server route modules such as `src/modules/products/page.tsx` may be imported
directly by `src/app/` route wrappers because Next.js requires `generateMetadata`
to stay server-only. Do not re-export those server route files from client-used
module barrels.

## Shared Code

`src/shared/`

Shared code is for generic utilities and UI used by multiple modules:

- `src/shared/components/ui/` — shadcn/ui primitives and project UI primitives.
- `src/shared/components/layout/` — `PageShell` and `SkipLink`.
- `src/shared/components/seo/` — JSON-LD rendering.
- `src/shared/components/rich-text.tsx` and `theme-provider.tsx`.
- `src/shared/hooks/` — generic hooks such as translations and viewport helpers.
- `src/shared/i18n/` — routing, navigation, and request config.
- `src/shared/api/` — JSON:API client, React Query provider, and shared API types.
- `src/shared/lib/` — config, date, image, network, slug, storage, and generic utils.
- `src/shared/seo/` — metadata and schema builders.

Prefer shared only for code genuinely used by two or more modules. Do not move
feature-specific behavior into shared just to avoid an import.

## Storefront Themes

`src/themes/<id>/` owns theme-specific route composition. The bundled current
design is `default`. A property selects one theme in `property.config.json`, and
`scripts/select-property.mjs` writes a static `src/generated/theme.ts` adapter.
App Router pages import that adapter, while themes reuse feature modules for
API access, types, state, and shared behavior. This keeps property selection and
theme selection build-time safe without coupling reusable modules to a design.

Storefront themes are distinct from the visitor-controlled light/dark color
mode; every storefront theme must support both color modes.

## State Management

Cart, favorites, and order history are **client-side localStorage state**:

- `src/modules/cart/hooks/cart-context.tsx`
- `src/modules/account/hooks/favorites-context.tsx`
- `src/modules/account/hooks/order-context.tsx`

These contexts are not backed by the API. Checkout remains a simulated demo
flow with no backend submission.

## API Layer

Feature resource logic lives inside the owning module:

- `src/modules/products/lib/queries.ts`, `keys.ts`, `types.ts`
- `src/modules/blog/lib/queries.ts`, `keys.ts`, `types.ts`
- `src/modules/faq/lib/queries.ts`, `keys.ts`, `types.ts`

Shared API infrastructure lives in `src/shared/api/`.

## Translations

Translation files keep keys synchronized:

- `messages/fa.json`
- `messages/en.json`

Top-level namespaces: `common`, `home`, `products`, `blog`, `about`, `contact`,
`checkout`, `footer`, `search`, `newsletter`.

## Static Assets

`public/`

Static assets such as placeholder media, hero imagery, and icons used by the storefront.
