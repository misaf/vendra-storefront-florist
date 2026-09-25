import { Badge } from "vendra-storefront-florist";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge>New</Badge>
    <Badge variant="secondary">Seasonal</Badge>
    <Badge variant="outline">Selected</Badge>
    <Badge variant="destructive">Sold out</Badge>
  </div>
);

/* The Organic tints: each ramp's 100 over its 800, so tags in one row read
   at the same weight. */
export const Tints = () => (
  <div className="flex flex-wrap items-center gap-2">
    <Badge variant="clay">Roses</Badge>
    <Badge variant="sage">Eucalyptus</Badge>
    <Badge variant="sand">Dried flowers</Badge>
  </div>
);

export const ProductTags = () => (
  <div className="flex max-w-xs flex-wrap gap-2">
    <Badge variant="sage">Same-day delivery</Badge>
    <Badge variant="clay">Best seller</Badge>
    <Badge variant="sand">Only 3 left</Badge>
  </div>
);
