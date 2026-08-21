# About Module

Owns the about page's sections and the catalogue lookup its closing band uses.

Import from `@/modules/about` outside this module; route composition lives in
`src/app/[locale]/about/page.tsx`. Category data loading lives in
`lib/load.ts` (`loadAboutCategories`) and degrades to an empty list, so the page
renders without the catalogue.

Keep page copy localized in `messages/en.json` and `messages/fa.json`, with
brand-specific wording in the store config's `messages`. Do not invent
unverified business claims — founding dates, years of experience, team sizes,
awards, delivery promises, statistics or testimonials. Nothing in the property
configuration or the Vendra API supplies them.
