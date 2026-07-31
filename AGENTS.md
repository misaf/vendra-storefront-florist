# Vendra Storefront Agent Guide

This is the mandatory quick-start guide for agents in this repository. Keep it short; detailed rules live in `docs/`.

## Read First

Before making code changes, read the relevant guide indexes, then open only the focused docs needed for the task:

- `docs/project.md` — storefront overview, repository structure, localization, and configuration
- `docs/workflow.md` — editing workflow, scope control, verification, and worktree rules
- `docs/frontend.md` — UI principles, design system, component patterns, and page-specific guides
- `docs/api.md` — JSON:API contract, API layer organization, error handling, and configuration

## Mandatory Rules

### Project Context

- This is the **Vendra storefront template**: one codebase that builds one image per property. `fa`/`en` today; more locales may be added later.
- **Nothing in `src/` may name a property.** Brand, contacts, socials, canonical origin, map pin and business type live in `properties/<slug>/property.config.json`, reached through `@/shared/property`. Brand-bearing copy goes in `properties/<slug>/messages/`, which is deep-merged over the brand-neutral base catalogue.
- `properties/houshang-flowers/` is the bundled example property. Its `theme` field selects a build-time implementation from `src/themes/`; `default` is the bundled starter theme.
- Current surfaces: home, products listing, product detail, blog (list + post), about, contact, cart, and checkout.
- Product, category, blog, and FAQ content is API-backed. Cart, favorites, and order history are **client-side localStorage state** in `src/modules/cart` and `src/modules/account`; the account panel and checkout run on that local state. Checkout payment is a **simulated demo flow** with no backend submission.
- The Laravel backend API lives at `https://github.com/misaf/vendra`. Treat it as the source of truth for API contracts.
- Use App Router conventions under `src/app/[locale]/`. Preserve locale-aware routing and Persian RTL support.
- For the `fa` locale, use BYekan as the primary Persian UI font.

### Development

- Reuse existing components, hooks, API utilities, mappers, and design patterns before creating new ones.
- Use shadcn/ui and `src/shared/components/ui/` primitives as the default foundation for all interactive surfaces.
- Keep feature code under `src/modules/<feature>/`. Code outside a module should import from that module's `index.ts` public barrel, not from its `components/`, `hooks/`, `lib/`, or `types.ts` internals.
- Do not invent backend routes, API fields, or fake data when real API data exists.
- For user-visible text, update both `messages/en.json` and `messages/fa.json` unless there is a clear locale-specific reason. Keep the base catalogue brand-neutral — a brand name in `messages/` is a bug.
- After changing a property config or its message overrides, run `npm run property` (also runs automatically before `dev`, `build` and `typecheck`). Never hand-edit `src/generated/property.ts`.
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
- `npm run lint` — run ESLint
- `npm run typecheck` — run TypeScript without emitting files
- `npm run build` — create a production build
- `npm run check` — run lint, typecheck, and build together
