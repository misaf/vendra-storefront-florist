# Vendra Storefront Agent Guide

Short, mandatory quick-start guide for agents in this repository. Keep it short; the README is the long-form reference for deployment and configuration.

## Read First

Before making code changes, read the focused docs that match the task:

- `README.md` — storefront overview, repository structure, localization, configuration, Docker/deployment
- This guide (below) — editing workflow, module rules, verification
- For UI work: `src/shared/components/ui/` primitives and the feature module's own `README.md`

## Mandatory Rules

### Project Context

- This is the **Vendra storefront template**: one shared image configured per property at container runtime. `fa`/`en` today; more locales may be added later.
- **Nothing in `src/` may name a property.** Brand, contacts, socials, canonical origin, map pin and business type live in `properties/<slug>/property.config.json`, reached through `@/shared/property`. Brand-bearing copy goes in `properties/<slug>/messages/`, which is deep-merged over the brand-neutral base catalogue.
- The property config is validated against the single source of truth `properties/schema.json` by `scripts/validate-property.mjs` at build time and by `src/shared/property/validation.ts` at runtime — never hand-maintain a second field list.
- `properties/houshang-flowers/` is the bundled local-development fallback. Production injects the property configuration through `STOREFRONT_CONFIG_BASE64`; `default` is the bundled storefront theme.
- Current surfaces: home, products listing, product detail, blog (list + post), about, contact, cart, and checkout.
- Product, category, blog, and FAQ content is API-backed. Cart, favorites, and order history are **client-side localStorage state** in `src/modules/cart` and `src/modules/account`; the account panel and checkout run on that local state. Checkout payment and the newsletter form are **simulated demo flows** with no backend submission.
- The Laravel backend API lives at `https://github.com/misaf/vendra`. Treat it as the source of truth for API contracts.
- Use App Router conventions under `src/app/[locale]/`. Preserve locale-aware routing and Persian RTL support.
- For the `fa` locale, use BYekan as the primary Persian UI font.

### Architecture

- Route server composition (server components, metadata, data loading) lives in `src/themes/<theme>/pages/*.tsx`, selected at build time per property. Feature modules provide the client components, query hooks, types, and data-loading helpers they need.
- Keep feature code under `src/modules/<feature>/`. Code outside a module should import from that module's `index.ts` public barrel, not from its `components/`, `hooks/`, `lib/`, or `types.ts` internals.
- Shared infrastructure lives in `src/shared/`: UI primitives (`components/ui/`), API client (`api/`), property access (`property/`), config (`lib/config.ts`), SEO (`seo/`).
- Do not invent backend routes, API fields, or fake data when real API data exists.
- For user-visible text, update both `messages/en.json` and `messages/fa.json` unless there is a clear locale-specific reason. Keep the base catalogue brand-neutral — a brand name in `messages/` is a bug.
- After changing a property config, its message overrides, or `properties/schema.json`, run `npm run property` (also runs automatically before `dev`, `build` and `typecheck`). Never hand-edit `src/generated/property.ts` or `src/generated/theme.ts`.
- Keep changes scoped to the user's request. Do not introduce unrelated refactors.
- Never overwrite or revert changes you did not make.

### UI Quality

- Public storefront pages must feel polished, premium, responsive, and accessible.
- Always verify new UI in both light and dark themes before considering work complete.

### Verification

Run the smallest verification that provides confidence for the change:

- Small component or TypeScript changes: `npm run lint && npm run typecheck`
- Route-level, API, or large UI changes: `npm run build`
- Full check when appropriate: `npm run check`

## Quick Commands

- `npm run dev` — start the local Next.js dev server
- `npm run property` — regenerate the selected property and theme adapters
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript without emitting files
- `npm run build` — create a production build
- `npm run check` — run lint, typecheck, and build together
