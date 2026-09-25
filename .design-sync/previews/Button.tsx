import { Button } from "vendra-storefront-florist";
import { ArrowRight, Heart, ShoppingBag, Trash2 } from "lucide-react";

export const Variants = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>Add to cart</Button>
    <Button variant="outline">View details</Button>
    <Button variant="secondary">Save for later</Button>
    <Button variant="ghost">Cancel</Button>
    <Button variant="link">Delivery info</Button>
    <Button variant="destructive">Remove</Button>
  </div>
);

export const Sizes = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Shop the collection</Button>
  </div>
);

export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button>
      <ShoppingBag /> Add to cart
    </Button>
    <Button variant="outline">
      Continue to delivery <ArrowRight className="rtl:rotate-180" />
    </Button>
    <Button variant="outline" size="icon" aria-label="Add to favourites">
      <Heart />
    </Button>
    <Button variant="ghost" size="icon" aria-label="Remove item">
      <Trash2 />
    </Button>
  </div>
);

export const Disabled = () => (
  <div className="flex flex-wrap items-center gap-3">
    <Button disabled>Out of stock</Button>
    <Button variant="outline" disabled>
      Place order
    </Button>
  </div>
);

/* Persian pages carry `.locale-fa` on the body: buttons switch from the
   Caprasimo display face to Vazirmatn at 600, and icons flip with rtl:. */
export const Persian = () => (
  <div className="locale-fa flex flex-wrap items-center gap-3" dir="rtl">
    <Button>
      <ShoppingBag /> افزودن به سبد
    </Button>
    <Button variant="outline">
      ادامه به ارسال <ArrowRight className="rtl:rotate-180" />
    </Button>
    <Button variant="secondary">ذخیره برای بعد</Button>
  </div>
);
