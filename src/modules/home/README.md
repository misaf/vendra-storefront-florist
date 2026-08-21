# Home Module

Owns the storefront home page's sections and its initial data loading.

Import reusable home exports from `@/modules/home`. Home-page data composition
may depend on other module public APIs, but reusable product/blog UI belongs in
those modules — `CategoryTile` and `ProductCard` come from `@/modules/products`,
and the journal band from `@/modules/blog`.

Initial data loading lives in `lib/load.ts` (`loadInitialBlog`,
`loadInitialHomeCatalogue`); route composition lives in
`src/app/[locale]/page.tsx`, which documents the page's order.

The page shows every category the catalogue returns, one product rail of the
newest in-stock items, and three journal entries. It deliberately does not
preview the destination pages a second time: each band is either the complete
set (categories) or a query a shopper can step into unchanged (`arrivals` links
to `/products?sort=newest&availability=in-stock`).
