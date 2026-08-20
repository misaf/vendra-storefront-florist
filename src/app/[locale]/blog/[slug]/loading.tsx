import { PageShell } from "@/shared/components/layout/page-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function BlogPostLoading() {
  return (
    <PageShell>
      <header className="bg-background pt-10 sm:pt-14">
        <div className="store-container max-w-3xl">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="mt-8 h-4 w-40" />
          <Skeleton className="mt-3 h-12 w-full" />
          <Skeleton className="mt-3 h-12 w-2/3" />
          <Skeleton className="mt-5 h-4 w-36" />
        </div>
      </header>

      {/* Lead image */}
      <div className="mx-auto mt-10 max-w-5xl px-4 sm:mt-12 sm:px-6 lg:px-8">
        <Skeleton className="aspect-[16/9] w-full rounded-xl" />
      </div>

      {/* Body */}
      <div className="store-container store-section max-w-2xl">
        <div className="space-y-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? "w-9/12" : "w-full"}`} />
          ))}
        </div>
      </div>
    </PageShell>
  );
}
