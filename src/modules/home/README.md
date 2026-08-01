# Home Module

Owns storefront homepage composition, the hero component, and initial homepage
data loading across products and blog.

Import reusable home exports from `@/modules/home`. Homepage-specific data
composition can depend on other module public APIs, but reusable product/blog UI
belongs in those modules.

Initial data loading lives in `lib/load.ts` (`loadInitialBlog`,
`loadInitialHomeProductCategories`); route composition for the homepage lives in
`src/themes/default/pages/`.
