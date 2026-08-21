import { PageShell } from "@/shared/components/layout/page-shell";
import { ProductGridSkeleton } from "./product-grid";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * The catalogue's resting shape.
 *
 * This was a route-level `loading.tsx`. Any `loading.tsx` on a segment makes
 * Next flush the response shell before the page resolves, and a status code
 * cannot be changed once bytes are on the wire — so the boundary that sat here
 * turned `notFound()` on the *nested* product route into a 200 carrying a
 * "not found" page. Hosting the same skeleton as a `<Suspense>` fallback inside
 * the catalogue page keeps the skeleton exactly where it was while leaving
 * `/products/[slug]` free to answer 404 properly.
 */
export function ProductsPageSkeleton() {
  return (
    <PageShell>
      <section className="bg-background pb-16 sm:pb-20">
        {/* Mirrors PageHeader's band padding so the real masthead lands where
            this one stood. */}
        <div className="store-container store-section-head">
          <Skeleton className="mb-4 h-5 w-40" />
          <Skeleton className="mb-3 h-3 w-24" />
          <Skeleton className="h-12 w-64" />
          <Skeleton className="mt-4 h-5 w-full max-w-md" />
        </div>

        <div className="store-container">
          <div className="grid min-w-0 gap-7 lg:grid-cols-[220px_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[240px_minmax(0,1fr)] xl:gap-10">
            {/* Desktop filter rail */}
            <aside className="hidden border-e border-border pe-6 lg:block xl:pe-8">
              <Skeleton className="h-6 w-24" />
              <Skeleton className="mt-7 h-5 w-28" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-lg" />
                ))}
              </div>
              <Skeleton className="mt-7 h-px w-full" />
              <Skeleton className="mt-7 h-5 w-24" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-lg" />
                ))}
              </div>
            </aside>

            {/* Product grid */}
            <div>
              <div className="flex items-center justify-between gap-3">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-11 w-24 rounded-full lg:hidden" />
                  <Skeleton className="h-11 w-28 rounded-full" />
                </div>
              </div>
              <div className="mb-7 mt-5 border-t border-border" />
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
