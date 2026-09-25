import { Input, Label } from "vendra-storefront-florist";

export const WithInput = () => (
  <div className="flex w-80 flex-col gap-2">
    <Label htmlFor="first-name">First name</Label>
    <Input id="first-name" placeholder="Sara" />
  </div>
);

export const WithCheckbox = () => (
  <div className="flex items-center gap-2">
    <input id="gift" type="checkbox" className="peer size-4 accent-[var(--primary)]" defaultChecked />
    <Label htmlFor="gift">This order is a gift</Label>
  </div>
);

export const DisabledPeer = () => (
  <div className="flex items-center gap-2">
    <input id="express" type="checkbox" className="peer size-4" disabled />
    <Label htmlFor="express">Express delivery (unavailable today)</Label>
  </div>
);
