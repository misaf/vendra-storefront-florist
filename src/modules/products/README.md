# Products Module

Owns product and product-category UI, API mapping, query hooks, and domain types.

Import from `@/modules/products` outside this module. Keep JSON:API mapping in
`lib/queries.ts`; UI components should consume mapped `Product` and
`ProductCategory` values.

`CategoryTile` renders one image-led link into a catalogue category and is
shared by the home and about pages; page-specific arrangements of those tiles
belong in the module that owns the page.

Server-side data loading lives in `lib/load.ts` (e.g. `getProduct`,
`loadRelatedProducts`, `loadProductsPage`). Route composition for the product
listing and detail pages lives in `src/app/[locale]/products/`.
