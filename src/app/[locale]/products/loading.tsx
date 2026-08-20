import { PageShell } from "@/shared/components/layout/page-shell";
import { ProductGridSkeleton } from "@/modules/products";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ProductsLoading() {
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
          <div className="grid min-w-0 gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:items-start lg:gap-10">
            {/* Category rail */}
            <aside className="border-b border-border pb-4 lg:rounded-xl lg:border lg:bg-card/55 lg:p-4">
              <Skeleton className="h-7 w-full" />
              <div className="mt-3 flex gap-2 overflow-hidden lg:flex-col">
                {Array.from({ length: 8 }, (_, i) => (
                  <Skeleton
                    key={i}
                    className="h-11 w-28 shrink-0 rounded-full lg:h-8 lg:w-full lg:rounded-lg"
                  />
                ))}
              </div>
            </aside>

            {/* Product grid */}
            <div>
              <div className="mb-7 flex flex-wrap gap-2 border-b border-border pb-5">
                {Array.from({ length: 4 }, (_, i) => (
                  <Skeleton key={i} className="h-9 w-20 rounded-full" />
                ))}
              </div>
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
