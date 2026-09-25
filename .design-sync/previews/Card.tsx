import {
  Badge,
  Button,
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "vendra-storefront-florist";

export const Basic = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="font-display text-xl font-normal">
        Garden Party Bouquet
      </CardTitle>
      <CardDescription>
        Peonies, garden roses and eucalyptus, hand-tied in kraft paper.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <p className="font-display text-2xl text-rose">$68.00</p>
    </CardContent>
    <CardFooter className="gap-3">
      <Button className="flex-1">Add to cart</Button>
      <Button variant="outline">Details</Button>
    </CardFooter>
  </Card>
);

export const WithAction = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle>Weekly flower subscription</CardTitle>
      <CardDescription>Next delivery Friday, 9–12 morning window</CardDescription>
      <CardAction>
        <Badge variant="sage">Active</Badge>
      </CardAction>
    </CardHeader>
    <CardContent className="text-sm text-muted-foreground">
      A seasonal arrangement delivered every week. Skip or pause any time
      before Wednesday.
    </CardContent>
    <CardFooter className="border-t border-border pt-6">
      <Button variant="link" className="px-0">
        Manage subscription
      </Button>
    </CardFooter>
  </Card>
);

export const OrderSummary = () => (
  <Card className="max-w-sm">
    <CardHeader>
      <CardTitle className="font-display text-xl font-normal">
        Order summary
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3 text-sm">
      <div className="flex justify-between">
        <span className="text-muted-foreground">Subtotal</span>
        <span className="tabular-nums">$124.00</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">Items</span>
        <span className="tabular-nums">3</span>
      </div>
      <div className="font-display flex justify-between border-t border-border pt-3 text-lg">
        <span>Total</span>
        <span className="text-rose">$124.00</span>
      </div>
    </CardContent>
    <CardFooter>
      <Button size="lg" className="w-full">
        Checkout
      </Button>
    </CardFooter>
  </Card>
);
