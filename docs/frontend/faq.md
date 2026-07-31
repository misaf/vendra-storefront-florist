# Frontend FAQ

The FAQ page answers common customer questions, grouped by category. It is fully **API-backed** — never hardcode or invent questions, answers, or categories.

---

## Architecture

Routes live under `src/app/[locale]/faq/`:

- `src/app/[locale]/faq/page.tsx` — thin route wrapper.
- `src/modules/faq/page.tsx` — Server Component shell; fetches FAQs and categories in parallel, sets localized metadata, and emits `FAQPage` + `BreadcrumbList` JSON-LD.
- `src/modules/faq/components/faq-client.tsx` — Client Component with category filter chips, instant client-side search, an accordion (`<details>`) grouped under category headings, and loading/empty/error states.

A condensed FAQ accordion also appears on the contact page (`ContactFaqCard` in `src/modules/contact/components/contact-client.tsx`) via the `useFaqs` hook.

Reuse `PageShell`, `@/shared/i18n/navigation`, and existing shadcn/ui primitives. Store every visible string in `messages/{locale}.json` under the `faq` namespace (and the FAQ nav label under `common.faq`); keep `en`/`fa` synchronized.

---

## Data Source

Use the `src/modules/faq` public API — never fetch FAQ data directly in components.

- Backend resources: `/faqs` and `/faq-categories` (JSON:API), with `include=faqCategory`, `filter[status]=1`, and `sort[position]=asc`. Category filtering uses the relationship route `faq-categories/{id}/faqs` (the slug is resolved to an id first, mirroring blog).
- Query helpers: `fetchFaqs` (list, optional `category` slug), `fetchFaqCategories`. React Query hooks `useFaqs` / `useFaqCategories` are available for client fetching. Re-exported from `src/modules/faq/index.ts`.
- The API layer maps the JSON:API resource into the domain `Faq` type (`question`, `answer`, `position`, `category`, `categorySlug`). Answers are coerced to plain text (HTML stripped) in `src/modules/faq/lib/queries.ts` — keep all mapping there, not in components.

---

## Listing Behavior

- Read `category` from the URL query string; reflect the active category in the URL and refetch on change.
- Search filters loaded FAQs client-side over question + answer (locale-aware), since the FAQ set is small.
- Group FAQs by category, ordering groups by the categories list; show category headings when more than one group is present or a specific category is selected.
- Use the `Empty` primitive for no-results and an `Alert` with a retry action for errors; show a skeleton list while loading.
- Constrain the content to a readable single-column width.

---

## SEO

- `generateMetadata` returns `buildMetadata({ locale, path: "/faq", title, description })` from the `faq` namespace.
- The page emits `faqPageSchema(...)` (only when FAQs exist) and `breadcrumbSchema(...)` via `<JsonLd>`. Both builders live in `src/shared/seo/`. FAQ content is server-rendered so crawlers see the questions/answers without JavaScript.
- `/faq` is registered in `src/app/sitemap.ts` static entries.
