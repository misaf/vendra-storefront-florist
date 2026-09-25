import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "vendra-storefront-florist";
import { Search } from "lucide-react";

/* The storefront's empty cart: the organic sage→clay blob, decorative only. */
export const EmptyCart = () => (
  <Empty className="max-w-xl">
    <EmptyHeader>
      <EmptyMedia variant="blob" aria-hidden="true" />
      <EmptyTitle>Your cart is empty</EmptyTitle>
      <EmptyDescription>
        Add a bouquet or two and they'll wait for you here.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button size="lg">Shop now</Button>
    </EmptyContent>
  </Empty>
);

export const NoResults = () => (
  <Empty className="max-w-xl">
    <EmptyHeader>
      <EmptyMedia variant="icon">
        <Search />
      </EmptyMedia>
      <EmptyTitle>No flowers match "tulips"</EmptyTitle>
      <EmptyDescription>
        Try a different search, or <a href="#">browse every collection</a>.
      </EmptyDescription>
    </EmptyHeader>
    <EmptyContent>
      <Button variant="outline">Clear filters</Button>
    </EmptyContent>
  </Empty>
);
