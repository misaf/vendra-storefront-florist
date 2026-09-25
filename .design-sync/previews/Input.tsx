import { Input, Label } from "vendra-storefront-florist";

export const Default = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" placeholder="you@example.com" />
  </div>
);

export const Filled = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="city">City</Label>
    <Input id="city" defaultValue="Tehran" />
  </div>
);

export const Invalid = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="phone">Phone</Label>
    <Input id="phone" aria-invalid defaultValue="0912" />
    <p className="text-sm text-destructive">Enter a full phone number.</p>
  </div>
);

export const Disabled = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="country">Country</Label>
    <Input id="country" disabled defaultValue="Iran" />
  </div>
);
