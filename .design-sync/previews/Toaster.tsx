import { useEffect } from "react";
import { Button, Toaster, toast } from "vendra-storefront-florist";

/* Toasts come from the bundle's own `toast` - it must share the sonner
   instance Toaster listens on. The storefront fires these on add-to-cart. */
export const AddedToCart = () => {
  useEffect(() => {
    toast.success("Garden Party Bouquet added to your cart", {
      duration: Infinity,
      action: { label: "View cart", onClick: () => {} },
    });
    toast.error("We couldn't place your order. Please try again.", {
      duration: Infinity,
    });
  }, []);
  return (
    <div className="h-[16rem]">
      <Button variant="outline">Add to cart</Button>
      <Toaster position="bottom-left" expand />
    </div>
  );
};
