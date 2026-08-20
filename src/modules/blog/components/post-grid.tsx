import type { ReactNode } from "react";
import { Card, CardHeader } from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

/**
 * Column ramp for post cards: 1 up, 2 from `sm`, 3 from `lg`. It has to stay in
 * step with the `sizes` `BlogPostCard` requests for its image, which is why it
 * lives here rather than being written out at each of the four places that
 * previously spelled it — the journal index (twice), the related rail and the
 * route's loading skeleton.
 */
const GRID_CLASS = "grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3";

export function PostGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(GRID_CLASS, className)}>{children}</div>;
}

/** Mirrors `BlogPostCard`'s boxes so the swap to real content doesn't shift. */
export function PostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <Skeleton className="aspect-video w-full" />
      <CardHeader>
        <Skeleton className="h-4 w-20" />
        <Skeleton className="mt-2 h-6 w-full" />
        <Skeleton className="mt-2 h-4 w-3/4" />
      </CardHeader>
    </Card>
  );
}

export function PostGridSkeleton({
  count = 6,
  className,
}: {
  count?: number;
  className?: string;
}) {
  return (
    <PostGrid className={className}>
      {Array.from({ length: count }, (_, index) => (
        <PostCardSkeleton key={index} />
      ))}
    </PostGrid>
  );
}
