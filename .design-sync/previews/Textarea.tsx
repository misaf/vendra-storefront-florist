import { Label, Textarea } from "vendra-storefront-florist";

export const CardMessage = () => (
  <div className="flex w-96 flex-col gap-2">
    <Label htmlFor="card">Card message</Label>
    <Textarea
      id="card"
      rows={3}
      maxLength={400}
      placeholder="Happy birthday, Mina — with love from all of us."
    />
  </div>
);

export const Filled = () => (
  <div className="flex w-96 flex-col gap-2">
    <Label htmlFor="notes">Delivery notes</Label>
    <Textarea
      id="notes"
      defaultValue="Please ring the bell twice. If nobody answers, leave the flowers with the building concierge."
    />
  </div>
);

export const Invalid = () => (
  <div className="flex w-96 flex-col gap-2">
    <Label htmlFor="msg">Message</Label>
    <Textarea id="msg" aria-invalid />
    <p className="text-sm text-destructive">Tell us how we can help.</p>
  </div>
);
