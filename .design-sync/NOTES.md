# design-sync notes — vendra-storefront-florist

## How this repo syncs

- This is a Next.js app, not a published package: there is no `dist/`. The bundle entry is the hand-written `.design-sync/entry.ts`, which re-exports `src/shared/components/ui/*`. The component list is pinned in `cfg.componentSrcMap` (no `.d.ts` exports to discover from) — **add new UI components to both entry.ts and componentSrcMap.**
- Styles: `cfg.buildCmd` (`node .design-sync/build-css.mjs`) compiles `.design-sync/ds-entry.css` → `.design-sync/.cache/ds-styles.css` with the repo's own `@tailwindcss/postcss`. That entry imports `src/app/globals.css`, adds `@source` for `src/` and `.design-sync/previews/`, and loads the four brand fonts from Google Fonts. **Run it before every converter build**, especially after editing a preview — new utility classes only exist after a recompile.
- Fonts: the app loads Figtree / Caprasimo / Vazirmatn / Lalezar via `next/font/google`, which cannot run outside Next. ds-entry.css re-creates them with a Google Fonts `@import` (same weights/subsets as `src/app/[locale]/layout.tsx`) and defines `--font-figtree`/`--font-caprasimo`/`--font-vazirmatn`/`--font-lalezar` on `:root`. Keep the weights in sync with layout.tsx.
- `toast` from `sonner` is re-exported from entry.ts: a toast only reaches a `Toaster` sharing the same sonner module instance.
- Playwright: the macOS cache has chromium-1234 → playwright@1.62.1 (installed into `.ds-sync/` with `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`).
- Commands (repo root):
  - `node .design-sync/build-css.mjs`
  - `node .ds-sync/package-build.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle`
  - re-sync: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --out ./ds-bundle --remote .design-sync/.cache/remote-sync.json`

## Storefront "View" components

- Module components that need the Next app (next/image, the locale-aware `Link`, storefront context, translations) are split in two: a drawing-only `*View` in `src/shared/components/ui/` (synced) and a thin wrapper in `src/modules/**` (not synced). Synced so far: `CategoryTileView`, `PriceView`, `BlogPostCardView`, `NewsletterFormView`.
- Views take the router link through `asChild` + Radix `Slottable` (the child `<Link />` becomes the root, and the view's markup renders inside it). Previews pass a plain `href="#"` instead.
- Previews use `organic-wash-*` divs as photography stand-ins, the same as the Carousel previews.

## Design System artifact (separate from the Claude Design project)

- The "Vendra Florist" style-guide artifact (https://claude.ai/artifact/5iBoXBHBtVp8LPgjsV7vT9, Design System type) carries the same components. `/design-sync` does not update it.
- After a sync: `node .design-sync/artifact-gen.mjs` writes `components/**` (bundle, bundle.css, React 19 in `lib/`, per-component `preview.html`, `README.md`, `.d.ts`) to `.design-sync/.cache/artifact/project/`. Then ask Claude to publish that folder to the artifact: read the artifact first, send only `project/components/**` (`.d.ts` files as `text/plain`), and send `project/design-system.json` only if `namespace`/`libraries` change (currently `VendraUI`, React 19.2.8).
- The generator makes `bundle.css` answer to the artifact's `data-theme="dark"` as well as `.dark`, and pins `--radius-sm`/`--radius-lg`, which the artifact's tokens.css also defines.
- A new component needs an entry in the generator's `GROUPS` (else it lands in "Other") and ideally in `HEIGHTS`.

## Excluded components

- `SafeImage` (`next/image`) and `ShareButton` (needs next-intl context) only run inside the Next app — left out of entry.ts and componentSrcMap.

## Known render warns

- `[FONT_REMOTE]` — expected; fonts come from Google Fonts at runtime.
- Leaflet CSS rides along in the stylesheet because globals.css imports it; harmless.

## Findings about the app itself (not sync issues)

- `Toaster`'s `toastOptions.classNames` (bg-card, shadow-panel…) never win: they live in Tailwind's `@layer utilities`, and sonner injects unlayered styles, which beat any layer. Toasts render in sonner's default white in production too. The preview reflects that faithfully.
- `DropdownMenuTrigger asChild` + `Button`: the Radix trigger's `data-slot` replaces `data-slot="button"`, so the trigger loses the display face and the 44px floor from globals.css.

## Re-sync risks

- 2026-09-26: the original project (`a72bb02e-…`) disappeared from this account mid-session (`list_projects` returned nothing, `get_file` returned 404). It was re-created as `7900327d-…`. If a pinned project 404s again, check the account or organization before creating another one.

- Claude Design's token scanner reads only the first ~100 KB of `_ds_bundle.css` (verified 2026-09-26: the manifest's last token sat at byte 100,102 of 185 KB). The brand palette therefore lives in `src/app/palette.css`, imported by globals.css *before* `tailwindcss`, so it compiles to ~13 KB. Anything that pushes those `:root` blocks back below the utilities hides clay/sage/sand and the semantic tokens from the app again. After a sync, check that `_ds_manifest.json` lists `--clay-100` — but only after the project has been opened once: the app regenerates the manifest on open (the re-armed `_ds_needs_recompile` sentinel), so straight after an upload `get_file` still returns the previous manifest.
- `ds-entry.css` duplicates the font list from `src/app/[locale]/layout.tsx` — a font change there must be mirrored here.
- `entry.ts` and `componentSrcMap` are hand-maintained; a new file in `src/shared/components/ui/` is invisible to the sync until added.
- Preview tiles in Carousel use gradient stand-ins, not product photography.
- The stylesheet depends on Tailwind scanning `src/` — a class used only in a preview needs `build-css.mjs` re-run before capture.
