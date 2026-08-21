# Blog Module

Owns blog listing/detail UI, homepage blog sections, post cards, blog API
mapping, query hooks, and post/category types.

Import from `@/modules/blog` outside this module. Keep JSON:API mapping and
placeholder handling in `lib/queries.ts`; keep rich text rendering/sanitization
in shared components/utilities.

Server-side data loading lives in `lib/load.ts` (`getPost`, `loadPostsPage`,
`loadRelatedPosts`). Route composition for the blog listing and detail pages
lives in `src/app/[locale]/blog/`.
