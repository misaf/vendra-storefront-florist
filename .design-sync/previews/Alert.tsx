import { Alert, AlertDescription, AlertTitle } from "vendra-storefront-florist";
import { AlertCircle, Truck } from "lucide-react";

export const Default = () => (
  <Alert className="max-w-lg">
    <Truck />
    <AlertTitle>Same-day delivery available</AlertTitle>
    <AlertDescription>
      Order before 2 pm and we'll hand-deliver your flowers this afternoon.
    </AlertDescription>
  </Alert>
);

export const Destructive = () => (
  <Alert variant="destructive" className="max-w-lg">
    <AlertCircle />
    <AlertTitle>We couldn't load the catalogue</AlertTitle>
    <AlertDescription>
      Check your connection and try again. Your cart is saved.
    </AlertDescription>
  </Alert>
);

export const TitleOnly = () => (
  <Alert className="max-w-lg">
    <AlertTitle>Prices include VAT.</AlertTitle>
  </Alert>
);
