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
        <div className="store-container store-section-head pb-[1.875rem] sm:pb-[1.875rem]">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="mt-4 h-5 w-full max-w-md" />
        </div>

        <div className="store-container">
          <div className="grid min-w-0 gap-7 lg:grid-cols-[minmax(14.125rem,15.75rem)_minmax(0,1fr)] lg:items-start lg:gap-[clamp(1.875rem,3.4vw,2.75rem)]">
            {/* Desktop filter rail — the same four groups in the same order as
                ProductFilters, so the rail does not resettle when the real one
                arrives. A shop with no price spread renders one group fewer;
                that is the only place these two can disagree. */}
            <aside className="hidden pe-2.5 lg:block">
              {/* The rail opens on its search field. */}
              <Skeleton className="h-[2.625rem] w-full rounded-full" />
              <Skeleton className="mt-[2.125rem] h-5 w-28" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 6 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-full" />
                ))}
              </div>
              <Skeleton className="mt-8 h-5 w-16" />
              <Skeleton className="mt-4 h-[1.375rem] w-full rounded-full" />
              <div className="mt-2.5 flex justify-between gap-3">
                <Skeleton className="h-4 w-14" />
                <Skeleton className="h-4 w-14" />
              </div>
              <Skeleton className="mt-8 h-5 w-24" />
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }, (_, i) => (
                  <Skeleton key={i} className="h-11 w-full rounded-full" />
                ))}
              </div>
              <Skeleton className="mt-8 h-11 w-full rounded-full" />
            </aside>

            {/* Product grid */}
            <div>
              <div className="flex items-center justify-between gap-3 border-b border-border pb-5">
                <Skeleton className="h-5 w-24" />
                <div className="flex gap-2">
                  <Skeleton className="h-11 w-24 rounded-full lg:hidden" />
                  <Skeleton className="h-11 w-28 rounded-full" />
                </div>
              </div>
              <div className="mb-[1.625rem] mt-5" />
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
