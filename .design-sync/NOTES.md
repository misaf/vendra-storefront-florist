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

## Excluded components

- `SafeImage` (`next/image`) and `ShareButton` (needs next-intl context) only run inside the Next app — left out of entry.ts and componentSrcMap.

## Known render warns

- `[FONT_REMOTE]` — expected; fonts come from Google Fonts at runtime.
- Leaflet CSS rides along in the stylesheet because globals.css imports it; harmless.

## Findings about the app itself (not sync issues)

- `Toaster`'s `toastOptions.classNames` (bg-card, shadow-panel…) never win: they live in Tailwind's `@layer utilities`, and sonner injects unlayered styles, which beat any layer. Toasts render in sonner's default white in production too. The preview reflects that faithfully.
- `DropdownMenuTrigger asChild` + `Button`: the Radix trigger's `data-slot` replaces `data-slot="button"`, so the trigger loses the display face and the 44px floor from globals.css.

## Re-sync risks

- `ds-entry.css` duplicates the font list from `src/app/[locale]/layout.tsx` — a font change there must be mirrored here.
- `entry.ts` and `componentSrcMap` are hand-maintained; a new file in `src/shared/components/ui/` is invisible to the sync until added.
- Preview tiles in Carousel use gradient stand-ins, not product photography.
- The stylesheet depends on Tailwind scanning `src/` — a class used only in a preview needs `build-css.mjs` re-run before capture.
