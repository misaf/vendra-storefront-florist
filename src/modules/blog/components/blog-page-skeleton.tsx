import { PageShell } from "@/shared/components/layout/page-shell";
import { PostGridSkeleton } from "./post-grid";
import { Skeleton } from "@/shared/components/ui/skeleton";

/**
 * The journal index's resting shape. Moved out of a route-level `loading.tsx`
 * for the same reason as the catalogue's — see ProductsPageSkeleton: a loading
 * boundary on this segment flushed the response before `blog/[slug]` could
 * answer 404, so every mistyped post URL returned 200.
 */
export function BlogPageSkeleton() {
  return (
    <PageShell>
      <section className="bg-background pb-16 sm:pb-24">
        {/* Mirrors PageHeader's band padding so the real masthead lands where
            this one stood. */}
        <div className="store-container store-section-head pb-0 sm:pb-0">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-3 h-12 w-56" />
          <Skeleton className="mt-4 h-5 w-full max-w-md" />
        </div>

        <div className="store-container">
          {/* Featured lead */}
          <div className="mt-12 grid gap-6 border-b border-border pb-12 lg:grid-cols-12 lg:items-center lg:gap-10">
            <Skeleton className="aspect-[16/10] w-full rounded-2xl lg:col-span-7" />
            <div className="lg:col-span-5">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-4 h-10 w-full" />
              <Skeleton className="mt-3 h-10 w-3/4" />
              <Skeleton className="mt-5 h-4 w-40" />
            </div>
          </div>

          <PostGridSkeleton className="mt-12" />
        </div>
      </section>
    </PageShell>
  );
}
