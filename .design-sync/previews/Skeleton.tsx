import { Skeleton } from "vendra-storefront-florist";

/* The catalogue's loading tile: image, name, price. */
export const ProductCard = () => (
  <div className="flex w-56 flex-col gap-3">
    <Skeleton className="aspect-[4/5] w-full rounded-[1.875rem]" />
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/3" />
  </div>
);

export const Grid = () => (
  <div className="grid w-[36rem] grid-cols-3 gap-4">
    {[0, 1, 2].map((i) => (
      <div key={i} className="flex flex-col gap-3">
        <Skeleton className="aspect-[4/5] w-full rounded-[1.875rem]" />
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    ))}
  </div>
);

export const TextLines = () => (
  <div className="flex w-80 flex-col gap-2.5">
    <Skeleton className="h-7 w-2/3" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-4/5" />
  </div>
);
