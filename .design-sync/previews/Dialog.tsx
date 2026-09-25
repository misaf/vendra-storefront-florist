import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "vendra-storefront-florist";

/* Rendered open: the confirm step before a cart is cleared. */
export const ConfirmClear = () => (
  <Dialog open>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Clear your cart?</DialogTitle>
        <DialogDescription>
          All three bouquets will be removed. You can undo this right after.
        </DialogDescription>
      </DialogHeader>
      <DialogFooter>
        <Button variant="outline">Keep shopping</Button>
        <Button variant="destructive">Clear cart</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
