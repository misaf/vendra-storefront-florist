import { PageShell } from "@/shared/components/layout/page-shell";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function Loading() {
  return (
    <PageShell>
      <section className="store-section bg-background">
        <div className="store-container max-w-3xl">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="mt-4 h-10 w-2/3" />
          <Skeleton className="mt-3 h-5 w-full max-w-md" />
          <div className="mt-10 space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-10/12" />
            <Skeleton className="h-4 w-9/12" />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
