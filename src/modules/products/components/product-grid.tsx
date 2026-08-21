import type { ReactNode } from "react";
import { Skeleton } from "@/shared/components/ui/skeleton";
import { cn } from "@/shared/lib/utils";

/**
 * Column ramp for the catalogue grid: 2 up on phones, 3 from `md`, 4 from `xl`.
 * The gutters are tighter horizontally than vertically so cards group into rows
 * rather than into a uniform mesh.
 *
 * The fourth column used to wait for `2xl` (1536px), which left a 560-product
 * catalogue three cards wide on every ordinary laptop — the content column next
 * to the 240px sidebar is ~1090px at 1440, so a 4-up row is still a comfortable
 * ~250px card rather than a cramped one.
 *
 * This string used to be written out three times — in the grid, in the grid's
 * own loading branch and again in `products/loading.tsx` — so a column change
 * had to be made in three places or the route's skeleton stopped matching the
 * page it was standing in for.
 */
const GRID_CLASS =
  "grid grid-cols-2 items-stretch gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 xl:grid-cols-4";

/**
 * What a card in this grid actually occupies, matched to the ramp above. Passed
 * to every `ProductCard` in the grid so the browser fetches a rendition close to
 * the drawn size instead of the full-width one.
 */
export const PRODUCT_GRID_IMAGE_SIZES =
  "(min-width: 1280px) 17vw, (min-width: 768px) 24vw, 45vw";

export function ProductGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(GRID_CLASS, className)}>{children}</div>;
}

/**
 * A single card's resting shape. Mirrors `ProductCard`'s own boxes — 4:5 image,
 * two title lines, price, action — so the layout does not shift when the real
 * card replaces it.
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex h-full flex-col">
      <Skeleton className="aspect-[4/5] w-full rounded-xl" />
      <div className="flex flex-1 flex-col gap-2 pt-3">
        <Skeleton className="h-3.5 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <Skeleton className="mt-2 h-5 w-28" />
      <Skeleton className="mt-3 h-11 w-full rounded-full" />
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <ProductGrid>
      {Array.from({ length: count }, (_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </ProductGrid>
  );
}
