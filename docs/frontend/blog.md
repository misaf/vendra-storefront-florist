# Frontend Blog

The blog presents the property's articles and updates. It is fully **API-backed** — never hardcode or invent posts, categories, or content.

---

## Architecture

Routes live under `src/app/[locale]/blog/`:

- `src/app/[locale]/blog/page.tsx` — thin route wrapper.
- `src/app/[locale]/blog/[slug]/page.tsx` — thin route wrapper.
- `src/modules/blog/page.tsx` — Server Component shell; fetches the first page of posts and passes them to the client as initial data, sets localized metadata.
- `src/modules/blog/components/blog-client.tsx` — Client Component listing with search, infinite scroll, and loading/empty/error states.
- `src/modules/blog/detail-page.tsx` — Server Component post detail; fetches the post, renders sanitized rich-text content, sets per-post metadata.

A condensed blog section also appears on the homepage (`src/modules/blog/components/blog-section.tsx`); the home module fetches the initial posts server-side.

Reuse `PageShell`, `@/shared/i18n/navigation`, and existing shadcn/ui primitives. Store every visible string in `messages/{locale}.json` under the `blog` namespace and keep `en`/`fa` synchronized.

---

## Data Source

Use the `src/modules/blog` public API — never fetch blog data directly in components.

- Backend resources: `/blog-posts` and `/blog-post-categories` (JSON:API), with `include=multimedia,blogPostCategory` and `filter[status]=1`.
- Query helpers: `fetchBlogPostsWithDetails` (list, with placeholder-image fallback), `fetchBlogPost` (single post by slug or leading id), `fetchBlogPostCategories`. React Query hooks `usePosts` / `usePost` are available for client fetching.
- The API layer maps the JSON:API resource into the domain `Post` type (`title`, `content`, `excerpt`, `slug`, `image`, `category`, timestamps). Keep all mapping in `src/modules/blog/lib/queries.ts`, not in components.
- Post bodies are **rich text/HTML**. The excerpt is derived by stripping HTML; the detail page renders `content` via the shared rich-text renderer and sanitization helpers in `src/shared/`.
- Images come from related `multimedia`; fall back to `PLACEHOLDER_IMAGE` (handled in the API layer). Use `SafeImage` / `next/image`.
- Format dates with `formatLocaleDate` from `src/shared/lib/date.ts` (Persian digits in `fa`).

---

## Listing Behavior

- Read `category` and `search` from the URL query string; reflect filter/search state in the URL.
- Use Intersection Observer infinite scroll (`perPage: 12`), de-duplicating posts by id across pages.
- Show the post count and loaded count, a clear-search action, and a skeleton grid while loading.
- Use the `Empty` primitive for no-results and an `Alert` with a retry action for errors.
- Keep the grid responsive (1 / 2 / 3 columns) and reuse `BlogPostCard`.

---

## Post Detail Behavior

- Resolve the post by slug; show a localized not-found / error state with a "back to blog" link when the post is missing or the API fails.
- Render a hero image (with gradient overlay), category badge, title, and publish date, then the sanitized article body.
- Mirror the back-arrow direction to the locale (`ArrowRight` in `fa`, `ArrowLeft` otherwise) and preserve RTL/LTR layout.

---

## Quality

- Mobile-first, responsive, accessible, and verified in both light and dark themes.
- Real API data only; preserve loading, empty, error, and fallback-image states.
- Never render untrusted post HTML without sanitizing it first.
