import {
  Badge,
  Button,
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "vendra-storefront-florist";

/* Rendered open from the inline end: the catalogue's mobile filter panel. */
export const Filters = () => (
  <Sheet open>
    <SheetContent>
      <SheetHeader>
        <SheetTitle>Filters</SheetTitle>
        <SheetDescription>Narrow the catalogue by collection and stock.</SheetDescription>
      </SheetHeader>
      <div className="flex flex-wrap gap-2 px-4">
        <Badge variant="outline">Birthday</Badge>
        <Badge variant="sand">Anniversary</Badge>
        <Badge variant="sand">Sympathy</Badge>
        <Badge variant="sand">Just because</Badge>
      </div>
      <SheetFooter>
        <Button>Show 24 bouquets</Button>
        <Button variant="outline">Clear all</Button>
      </SheetFooter>
    </SheetContent>
  </Sheet>
);
