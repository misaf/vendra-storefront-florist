import { PageShell } from "@/shared/components/layout/page-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function ProductDetailLoading() {
  return (
    <PageShell>
      <section className="store-section bg-background">
        <div className="store-container">
          <Skeleton className="mb-5 h-5 w-72 max-w-full" />
          <div className="grid gap-0 overflow-hidden rounded-3xl bg-card lg:grid-cols-[1.08fr_0.92fr]">
            {/* Gallery */}
            <div className="p-3 sm:p-4">
              <Skeleton className="aspect-square w-full rounded-xl lg:aspect-[5/6]" />
              <div className="mt-3 flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="size-16 rounded-md" />
                ))}
              </div>
            </div>
            {/* Detail */}
            <div className="grid gap-5 border-t border-border p-4 sm:p-6 lg:border-s lg:border-t-0">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-10 w-52" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="flex flex-wrap gap-3">
                <Skeleton className="h-13 w-36 rounded-full" />
                <Skeleton className="h-13 w-48 rounded-full" />
              </div>
              <div className="flex flex-wrap gap-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-11 w-28 rounded-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
