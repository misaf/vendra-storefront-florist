import { Tabs, TabsContent, TabsList, TabsTrigger } from "vendra-storefront-florist";

/* The product page's detail tabs. */
export const ProductDetails = () => (
  <Tabs defaultValue="description" className="w-[28rem]">
    <TabsList>
      <TabsTrigger value="description">Description</TabsTrigger>
      <TabsTrigger value="care">Care</TabsTrigger>
      <TabsTrigger value="delivery">Delivery</TabsTrigger>
    </TabsList>
    <TabsContent value="description" className="pt-4 text-sm text-muted-foreground">
      A loose, garden-gathered bouquet of blush peonies, David Austin roses and
      silver-dollar eucalyptus, wrapped in recycled kraft paper.
    </TabsContent>
    <TabsContent value="care" className="pt-4 text-sm text-muted-foreground">
      Trim stems at an angle and change the water every two days.
    </TabsContent>
    <TabsContent value="delivery" className="pt-4 text-sm text-muted-foreground">
      Same-day delivery for orders before 2 pm.
    </TabsContent>
  </Tabs>
);

export const SecondSelected = () => (
  <Tabs defaultValue="care" className="w-[28rem]">
    <TabsList>
      <TabsTrigger value="description">Description</TabsTrigger>
      <TabsTrigger value="care">Care</TabsTrigger>
      <TabsTrigger value="delivery" disabled>
        Delivery
      </TabsTrigger>
    </TabsList>
    <TabsContent value="care" className="pt-4 text-sm text-muted-foreground">
      Trim stems at an angle and change the water every two days. Keep away
      from direct sun and ripening fruit.
    </TabsContent>
  </Tabs>
);
